import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { recordAudit } from "@/lib/vip/audit-log";
import { resolveOwnCandidate } from "./edit-service";
import {
  EVIDENCE_BUCKET,
  EVIDENCE_LINK_SECONDS,
  EVIDENCE_TYPE_ERROR,
  buildEvidencePath,
  evidenceDownloadName,
  evidenceExtension,
  isUuid,
  matchesEvidenceBytes,
  validEvidenceMeta,
  validEvidencePath,
} from "./evidence-rules";

/**
 * SERTIFIKAT DALILI — BAZAGA VA STORAGE'GA TEGADIGAN QISM (§8).
 *
 * YUKLASH IKKI QADAM (rasm yuklash bilan bir xil yo'l):
 *
 *   sign   — server huquq, egalik, tur va hajmni tekshiradi va
 *            BITTA yo'lga BITTA yuklash huquqini beradi;
 *   commit — server faylni storage'dan o'zi o'qiydi: hajm, tur va
 *            BAYTLAR (sehrli belgi) mos bo'lsagina sertifikatga
 *            bog'laydi. Mos kelmasa, fayl o'chiriladi.
 *
 * Baytlar Vercel orqali o'tmaydi — brauzer to'g'ridan-to'g'ri
 * Supabase'ga yuklaydi (10 MB PDF Vercel'ning ~4.5 MB so'rov
 * chegarasiga sig'masdi).
 *
 * KO'RISH: yo'l hech qachon brauzerga chiqmaydi. Egasi
 * `/api/profile/certificate-evidence/<id>` ga boradi, server egalikni
 * tekshirib, 60 soniyalik imzolangan havolaga yo'naltiradi.
 */

export type EvidenceResult =
  | { ok: true }
  | { ok: false; error: string };

export type EvidenceSignResult =
  | { ok: true; bucket: string; path: string; token: string }
  | { ok: false; error: string };

const NOT_FOUND = "Sertifikat topilmadi.";

/**
 * Sertifikat shu odamnikimi.
 *
 * `certificateId` brauzerdan keladi; egalik tekshirilmasa, odam
 * boshqa nomzodning sertifikatiga fayl biriktirardi (§44). "Topilmadi"
 * va "sizniki emas" ajratib aytilmaydi — sertifikat borligini oshkor
 * qilmaslik uchun.
 */
async function ownCertificate(
  certificateId: unknown,
): Promise<
  | { ok: true; candidateId: string; profileId: string; certificateId: string; title: string }
  | { ok: false; error: string }
> {
  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };
  if (!isUuid(certificateId)) return { ok: false, error: NOT_FOUND };

  const { candidateId, profileId } = resolved.owned;
  const { data, error } = await createAdminClient()
    .from("candidate_certificates")
    .select("id, title")
    .eq("id", certificateId)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (error) {
    console.error("[dalil] sertifikat o'qilmadi:", error.message);
    return { ok: false, error: "Hozir saqlab bo'lmadi. Keyinroq urinib ko'ring." };
  }
  if (!data) return { ok: false, error: NOT_FOUND };

  return {
    ok: true,
    candidateId,
    profileId,
    certificateId: certificateId.toLowerCase(),
    title: (data.title as string) ?? "",
  };
}

/** Storage'dagi faylni o'chiradi; xato faqat logga (fayl allaqachon yo'q bo'lishi mumkin). */
async function removeObject(path: string, why: string): Promise<void> {
  const { error } = await createAdminClient().storage.from(EVIDENCE_BUCKET).remove([path]);
  if (error) console.error(`[dalil] fayl o'chirilmadi (${why}):`, { path, message: error.message });
}

/* ========================================================================= *
 * 1. IMZO
 * ========================================================================= */

export async function signEvidenceUpload(input: {
  certificateId: unknown;
  mimeType: unknown;
  size: unknown;
}): Promise<EvidenceSignResult> {
  // HUQUQ — eng avval; imzo storage'da yozish huquqini ochadi.
  const entitled = await requireEntitlement("profile.certificate_manage");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const owned = await ownCertificate(input.certificateId);
  if (!owned.ok) return owned;

  if (!validEvidenceMeta(input.mimeType, input.size)) {
    return { ok: false, error: EVIDENCE_TYPE_ERROR };
  }

  const path = buildEvidencePath(
    owned.candidateId,
    owned.certificateId,
    randomUUID(),
    input.mimeType as string,
  );
  if (!path) return { ok: false, error: EVIDENCE_TYPE_ERROR };

  const { data, error } = await createAdminClient()
    .storage.from(EVIDENCE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("[dalil] imzo berilmadi:", error?.message);
    return { ok: false, error: "Yuklashni boshlab bo'lmadi. Keyinroq urinib ko'ring." };
  }

  return { ok: true, bucket: EVIDENCE_BUCKET, path, token: data.token };
}

/* ========================================================================= *
 * 2. TASDIQLASH
 * ========================================================================= */

export async function commitEvidenceUpload(input: {
  certificateId: unknown;
  path: unknown;
}): Promise<EvidenceResult> {
  const entitled = await requireEntitlement("profile.certificate_manage");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const owned = await ownCertificate(input.certificateId);
  if (!owned.ok) return owned;

  /*
   * YO'L AYNAN SHU NOMZOD VA SHU SERTIFIKATNIKI BO'LISHI SHART.
   *
   * Aks holda begona papkadagi fayl shu sertifikatga bog'lanardi.
   */
  if (!validEvidencePath(input.path, owned.candidateId, owned.certificateId)) {
    console.warn("[dalil] begona yo'l rad etildi:", { candidateId: owned.candidateId });
    return { ok: false, error: "Fayl manzili noto'g'ri." };
  }
  const path = input.path;

  const storage = createAdminClient().storage.from(EVIDENCE_BUCKET);
  const folder = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);

  const { data: listed, error: listError } = await storage.list(folder, { search: name, limit: 5 });
  if (listError) {
    console.error("[dalil] fayl tekshirilmadi:", listError.message);
    return { ok: false, error: "Faylni tekshirib bo'lmadi. Qaytadan urinib ko'ring." };
  }

  const object = listed?.find((item: { name: string }) => item.name === name);
  if (!object) return { ok: false, error: "Yuklangan fayl topilmadi. Qaytadan yuklang." };

  /*
   * TUR VA HAJM STORAGE'DAN — brauzerdan EMAS.
   *
   * Imzo yo'lga beriladi, mazmunga emas: brauzer imzodan keyin boshqa
   * fayl yuborishi mumkin edi.
   */
  const mime = String(object.metadata?.mimetype ?? "");
  const size = Number(object.metadata?.size ?? 0);

  if (!validEvidenceMeta(mime, size) || !path.endsWith(`.${evidenceExtension(mime)}`)) {
    await removeObject(path, "tur yoki hajm mos emas");
    return { ok: false, error: EVIDENCE_TYPE_ERROR };
  }

  const { data: blob, error: downloadError } = await storage.download(path);
  if (downloadError || !blob) {
    console.error("[dalil] fayl o'qilmadi:", downloadError?.message);
    return { ok: false, error: "Faylni tekshirib bo'lmadi. Qaytadan urinib ko'ring." };
  }

  const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  if (blob.size !== size || !matchesEvidenceBytes(head, mime)) {
    /*
     * MAZMUN TURGA MOS EMAS — FAYL O'CHIRILADI.
     *
     * Masalan HTML sahifa `.pdf` deb yuklangan. U bucketda qolsa,
     * keyin tahririyat xodimi uni ochganda brauzerda ishga tushishi
     * mumkin edi.
     */
    await removeObject(path, "mazmun turga mos emas");
    return { ok: false, error: "Fayl mazmuni tanlangan turga mos emas." };
  }

  /*
   * BOG'LASH VA ISHONCHNI QAYTA KO'RIKKA YUBORISH — BITTA TRANZAKSIYADA.
   *
   * Funksiya almashtirilgan eski faylning yo'lini qaytaradi.
   */
  const { data: oldPath, error: attachError } = await createAdminClient().rpc(
    "attach_certificate_evidence",
    {
      p_certificate_id: owned.certificateId,
      p_candidate_id: owned.candidateId,
      p_profile_id: owned.profileId,
      p_path: path,
      p_mime: mime,
      p_size: size,
    },
  );

  if (attachError) {
    console.error("[dalil] biriktirilmadi:", attachError.message);
    // Bog'lanmagan fayl egasiz qolmasin.
    await removeObject(path, "biriktirish yiqildi");
    return { ok: false, error: "Dalilni saqlab bo'lmadi." };
  }

  if (typeof oldPath === "string" && oldPath && oldPath !== path) {
    await removeObject(oldPath, "almashtirildi");
  }

  await recordAudit("profile.certificate.evidence_attached", {
    actorId: owned.profileId,
    entityId: owned.candidateId,
    after: { mime_type: mime, size_bytes: size },
    metadata: {
      certificate_id: owned.certificateId,
      title: owned.title,
      replaced: typeof oldPath === "string" && oldPath !== "",
    },
  });

  return { ok: true };
}

/* ========================================================================= *
 * 3. OLIB TASHLASH
 * ========================================================================= */

export async function removeCertificateEvidence(certificateId: unknown): Promise<EvidenceResult> {
  /*
   * HUQUQ TALAB QILINMAYDI — faqat egalik.
   *
   * Obunasi tugagan odam ham o'z shaxsiy hujjatini olib tashlay
   * olishi kerak: aks holda u bizda uning roziligisiz qolardi.
   */
  const owned = await ownCertificate(certificateId);
  if (!owned.ok) return owned;

  const { data: path, error } = await createAdminClient().rpc("detach_certificate_evidence", {
    p_certificate_id: owned.certificateId,
    p_candidate_id: owned.candidateId,
  });

  if (error) {
    console.error("[dalil] olib tashlanmadi:", error.message);
    return { ok: false, error: "Dalilni o'chirib bo'lmadi." };
  }
  if (typeof path !== "string" || !path) return { ok: false, error: "Dalil topilmadi." };

  await removeObject(path, "egasi o'chirdi");

  await recordAudit("profile.certificate.evidence_removed", {
    actorId: owned.profileId,
    entityId: owned.candidateId,
    metadata: { certificate_id: owned.certificateId, title: owned.title },
  });

  return { ok: true };
}

/* ========================================================================= *
 * 4. KO'RISH — EGASI
 * ========================================================================= */

/**
 * Egasiga qisqa muddatli havola.
 *
 * Huquq talab qilinmaydi — faqat egalik (§35: obuna tugashi mazmunni
 * egasidan yashirmasligi kerak).
 */
export async function ownEvidenceLink(certificateId: unknown): Promise<string | null> {
  const resolved = await resolveOwnCandidate();
  if (!resolved.ok || !isUuid(certificateId)) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("certificate_evidence")
    .select("path, mime_type")
    .eq("certificate_id", certificateId.toLowerCase())
    .eq("candidate_id", resolved.owned.candidateId)
    .maybeSingle();

  if (error) {
    console.error("[dalil] o'qilmadi:", error.message);
    return null;
  }
  if (!data) return null;

  const { data: signed, error: signError } = await admin.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(data.path as string, EVIDENCE_LINK_SECONDS, {
      download: evidenceDownloadName(data.mime_type as string),
    });

  if (signError || !signed) {
    console.error("[dalil] havola berilmadi:", signError?.message);
    return null;
  }
  return signed.signedUrl;
}

/* ========================================================================= *
 * 5. SERTIFIKAT O'CHIRILGANDA
 * ========================================================================= */

/**
 * Sertifikat o'chirilishidan OLDIN dalil yo'lini oladi.
 *
 * Jadvaldagi qator `on delete cascade` bilan o'zi o'chadi, lekin
 * storage'dagi fayl o'chmaydi — uni yo'lni oldindan bilib, keyin
 * o'chirish kerak.
 */
export async function evidencePathFor(
  certificateId: string,
  candidateId: string,
): Promise<{ ok: true; path: string | null } | { ok: false }> {
  const { data, error } = await createAdminClient()
    .from("certificate_evidence")
    .select("path")
    .eq("certificate_id", certificateId)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (error) {
    console.error("[dalil] yo'l o'qilmadi:", error.message);
    return { ok: false };
  }
  return { ok: true, path: (data?.path as string | undefined) ?? null };
}

export async function removeEvidenceObject(path: string): Promise<void> {
  await removeObject(path, "sertifikat o'chirildi");
}
