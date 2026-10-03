import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { recordAudit } from "@/lib/vip/audit-log";
import { resolveOwnCandidate } from "./edit-service";
import { describeEvidence } from "./evidence-rules";
import { evidencePathFor, removeEvidenceObject } from "./evidence-service";
import {
  CERT_LIMITS,
  checkCertificate,
  type CertificateInput,
  type TrustLevel,
} from "./certificate-rules";

/**
 * SERTIFIKATLAR — BAZAGA TEGADIGAN QISM.
 *
 * `trust` HECH QACHON kirish parametri emas. Yangi sertifikat har doim
 * `pending_review` bo'ladi va darajani faqat admin o'zgartiradi (§8,
 * §43): aks holda foydalanuvchi o'ziga "Tasdiqlangan" belgisini
 * yozib qo'yardi.
 */

export interface CertificateRow {
  id: string;
  title: string;
  issuer: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
  credentialNumber: string | null;
  credentialUrl: string | null;
  description: string | null;
  /**
   * ESKI OMMAVIY DALIL RASMI — faqat o'qish uchun.
   *
   * Yangi dalil yopiq bucketga yuklanadi (`evidence`). Bu maydon
   * avvalgi oqimdan qolgan yozuvlar uchun; yangi dalil biriktirilganda
   * baza uni tozalaydi.
   */
  evidenceUrl: string | null;
  /** Yopiq bucketdagi dalil: "PDF · 1,2 MB". Fayl yo'li brauzerga BERILMAYDI. */
  evidence: { label: string } | null;
  trust: TrustLevel;
  reviewNote: string | null;
}

export type CertificateResult = { ok: true } | { ok: false; error: string };

/* ========================================================================= *
 * O'QISH
 * ========================================================================= */

/**
 * Egasining barcha sertifikatlari — kutayotgan va qaytarilganlari ham.
 *
 * Aks holda odam yuborganini muharrirda ko'rmay, yo'qolib ketdi deb
 * o'ylardi va qaytadan kiritardi.
 */
export async function loadOwnCertificates(candidateId: string): Promise<CertificateRow[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("candidate_certificates")
    .select(
      "id, title, issuer, issued_on, expires_on, credential_number, credential_url, description, evidence_url, trust, review_note",
    )
    .eq("candidate_id", candidateId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  /*
   * O'QISH XATOSI "SERTIFIKAT YO'Q" EMAS.
   *
   * Bo'sh ro'yxat qaytarilsa, odam sertifikatlari yo'qolgan deb
   * o'ylab ularni qaytadan kiritardi — keyin dublikatlar paydo
   * bo'lardi. Xato sahifaning xato holatiga chiqadi.
   */
  if (error) {
    console.error("[sertifikat] o'qilmadi:", error.message);
    throw new Error("Sertifikatlarni o'qib bo'lmadi.");
  }

  const rows = data ?? [];
  const evidence = new Map<string, { label: string }>();

  if (rows.length > 0) {
    const { data: files, error: evidenceError } = await admin
      .from("certificate_evidence")
      .select("certificate_id, mime_type, size_bytes")
      .eq("candidate_id", candidateId)
      .in(
        "certificate_id",
        rows.map((row) => row.id as string),
      );

    if (evidenceError) {
      console.error("[sertifikat] dalillar o'qilmadi:", evidenceError.message);
      throw new Error("Sertifikat dalillarini o'qib bo'lmadi.");
    }

    for (const file of files ?? []) {
      evidence.set(file.certificate_id as string, {
        label: describeEvidence(file.mime_type as string, Number(file.size_bytes)),
      });
    }
  }

  return rows.map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? "",
    issuer: (row.issuer as string | null) ?? null,
    issuedOn: (row.issued_on as string | null) ?? null,
    expiresOn: (row.expires_on as string | null) ?? null,
    credentialNumber: (row.credential_number as string | null) ?? null,
    credentialUrl: (row.credential_url as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    evidenceUrl: (row.evidence_url as string | null) ?? null,
    evidence: evidence.get(row.id as string) ?? null,
    trust: row.trust as TrustLevel,
    reviewNote: (row.review_note as string | null) ?? null,
  }));
}

/* ========================================================================= *
 * QO'SHISH
 * ========================================================================= */

export async function createCertificate(
  input: CertificateInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const entitled = await requireEntitlement("profile.certificate_manage");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const check = checkCertificate(input);
  if (!check.ok) return { ok: false, error: check.errors[0]! };

  const admin = createAdminClient();

  /*
   * SON CHEGARASI SERVERDA TEKSHIRILADI.
   *
   * Brauzerdagi tekshiruv faqat qulaylik: ikki oyna ochib, ikkisidan
   * ham yuborish mumkin bo'lardi.
   */
  const { count, error: countError } = await admin
    .from("candidate_certificates")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", resolved.owned.candidateId);

  if (countError) {
    console.error("[sertifikat] sanoq o'qilmadi:", countError.message);
    return { ok: false, error: "Hozir saqlab bo'lmadi. Keyinroq urinib ko'ring." };
  }
  if ((count ?? 0) >= CERT_LIMITS.maxCount) {
    return {
      ok: false,
      error: `Sertifikat soni chegarasi (${CERT_LIMITS.maxCount}) to'ldi.`,
    };
  }

  const { data, error } = await admin
    .from("candidate_certificates")
    .insert({
      ...check.value,
      candidate_id: resolved.owned.candidateId,
      submitted_by: resolved.owned.profileId,
      /*
       * HAR DOIM `pending_review`.
       *
       * Qiymat shu yerda QOTIB YOZILGAN, `input` dan olinmaydi — ya'ni
       * brauzer qanday ma'lumot yuborsa ham darajani o'zgartira olmaydi.
       */
      trust: "pending_review",
    })
    /*
     * YANGI QATOR QAYTARILADI.
     *
     * Forma saqlangandan keyin darhol dalil yuklashni taklif qiladi —
     * buning uchun sertifikat id si kerak. Uni "eng oxirgi qo'shilgan"
     * deb qayta izlash ikki oyna ochilganda boshqa sertifikatni
     * topib qo'yardi.
     */
    .select("id")
    .single();

  if (error || !data) {
    console.error("[sertifikat] qo'shilmadi:", error?.message);
    return { ok: false, error: "Sertifikatni saqlab bo'lmadi." };
  }

  const id = data.id as string;

  await recordAudit("profile.certificate.created", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    after: {
      title: check.value.title ?? null,
      issuer: check.value.issuer ?? null,
      trust: "pending_review",
    },
    metadata: { certificate_id: id },
  });

  return { ok: true, id };
}

/* ========================================================================= *
 * O'ZGARTIRISH
 * ========================================================================= */

/**
 * Sertifikatni o'zgartiradi.
 *
 * TASDIQ BEKOR BO'LADI (§6: "do not silently destroy verification").
 * Tasdiqlangan sertifikat o'zgartirilsa, u qaytadan ko'rikka boradi:
 * admin "Harvard, 2020" ni tasdiqlagan bo'lsa, foydalanuvchi uni
 * "Oxford, 2021" ga aylantirib, tasdiqni o'zi bilan olib ketmasligi
 * kerak.
 */
export async function updateCertificate(
  certificateId: string,
  input: CertificateInput,
): Promise<CertificateResult> {
  const entitled = await requireEntitlement("profile.certificate_manage");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const check = checkCertificate(input);
  if (!check.ok) return { ok: false, error: check.errors[0]! };

  const admin = createAdminClient();

  /*
   * OLDINGI HOLAT — jurnal uchun: "tasdiqlangan sertifikat
   * o'zgartirilib, tasdiq bekor bo'ldi" degan fakt ko'rinishi kerak.
   */
  const { data: previous, error: previousError } = await admin
    .from("candidate_certificates")
    .select("title, trust")
    .eq("id", certificateId)
    .eq("candidate_id", resolved.owned.candidateId)
    .maybeSingle();

  if (previousError) {
    console.error("[sertifikat] o'qilmadi:", previousError.message);
    return { ok: false, error: "O'zgarishni saqlab bo'lmadi." };
  }
  if (!previous) return { ok: false, error: "Sertifikat topilmadi." };

  const { data, error } = await admin
    .from("candidate_certificates")
    .update({
      ...check.value,
      trust: "pending_review",
      // Oldingi ko'rik izohi endi tegishli emas.
      review_note: null,
      reviewed_by: null,
      reviewed_at: null,
    })
    .eq("id", certificateId)
    /*
     * EGALIK SHARTI — asosiy himoya.
     *
     * `certificateId` brauzerdan keladi; sharti bo'lmasa odam boshqa
     * nomzodning sertifikatini o'zgartirardi (§44).
     */
    .eq("candidate_id", resolved.owned.candidateId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[sertifikat] o'zgartirilmadi:", error.message);
    return { ok: false, error: "O'zgarishni saqlab bo'lmadi." };
  }
  /*
   * Topilmadi: yoki yo'q, yoki BOSHQA nomzodga tegishli. Ikkisini
   * ajratib aytmaymiz — "sizga tegishli emas" javobi sertifikatning
   * mavjudligini oshkor qilardi.
   */
  if (!data) return { ok: false, error: "Sertifikat topilmadi." };

  await recordAudit("profile.certificate.updated", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: {
      title: (previous.title as string | null) ?? null,
      trust: (previous.trust as string | null) ?? null,
    },
    after: {
      title: check.value.title ?? null,
      trust: "pending_review",
    },
    metadata: { certificate_id: certificateId },
  });

  return { ok: true };
}

/* ========================================================================= *
 * O'CHIRISH
 * ========================================================================= */

export async function deleteCertificate(
  certificateId: string,
): Promise<CertificateResult> {
  const entitled = await requireEntitlement("profile.certificate_manage");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  /*
   * DALIL FAYLINING YO'LI OLDINDAN OLINADI.
   *
   * `certificate_evidence` qatori sertifikat bilan birga (`cascade`)
   * o'chadi, lekin yopiq bucketdagi fayl o'chmaydi — shaxsiy hujjat
   * egasining roziligisiz bizda qolib ketmasligi uchun uni ham
   * o'chiramiz.
   */
  const evidence = await evidencePathFor(certificateId, resolved.owned.candidateId);
  if (!evidence.ok) return { ok: false, error: "Sertifikatni o'chirib bo'lmadi." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("candidate_certificates")
    .delete()
    .eq("id", certificateId)
    .eq("candidate_id", resolved.owned.candidateId)
    .select("id, title, trust")
    .maybeSingle();

  if (error) {
    console.error("[sertifikat] o'chirilmadi:", error.message);
    return { ok: false, error: "Sertifikatni o'chirib bo'lmadi." };
  }
  if (!data) return { ok: false, error: "Sertifikat topilmadi." };

  if (evidence.path) await removeEvidenceObject(evidence.path);

  await recordAudit("profile.certificate.deleted", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: {
      title: (data.title as string | null) ?? null,
      trust: (data.trust as string | null) ?? null,
    },
    metadata: { certificate_id: certificateId, had_evidence: evidence.path !== null },
  });

  return { ok: true };
}
