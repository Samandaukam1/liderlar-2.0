import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { resolveOwnCandidate } from "./edit-service";
import { checkSection, type SectionInput } from "./field-policy";

/**
 * BIOGRAFIYANING MATNLI BO'LIMLARI — A'ZONING O'ZI TAHRIRLAYDI.
 *
 * Ommaviy biografiyadagi uzun matn `candidate_sections` da turadi va
 * sahifa aynan shu jadvaldan o'qiydi (`getCandidateBySlug`). Shuning
 * uchun muharrir ham SHU jadvalga yozadi — parallel biografiya
 * yaratilmaydi, aks holda ikki matn ajralib ketardi va qaysi biri
 * ommada turganini hech kim bilmasdi.
 *
 * MATN DARHOL NASHR BO'LADI — KO'RIK YO'Q (2026-10-04, egasining
 * qarori): "ma'lumot to'g'riligiga nomzodning o'zi javobgar".
 *
 * Bu O'ZINI TAQDIM ETISH matni, tekshirib bo'ladigan da'volar emas:
 * mukofot, lavozim va sertifikat alohida jadvallarda qoladi va
 * ULAR hamon ko'rikdan o'tadi (`entry-service.ts`,
 * `certificate-service.ts`). Ya'ni platformaning tasdig'i hech
 * qayerda bepul tarqalmaydi.
 *
 * `review_state` ustuni SAQLANADI va `published` yoziladi: ommaviy
 * so'rov ham, RLS ham shu shartni tekshiradi, ya'ni ustunni olib
 * tashlash ikkala joyni ham buzardi. Qoladigan foydasi — kerak
 * bo'lsa ko'rikni qaytarish bitta qatorlik o'zgarish bo'ladi, va
 * eski `pending_review` qatorlar (bo'lsa) ommaga chiqib ketmaydi.
 *
 * Qoidalar `field-policy.ts` da va ular testlangan. Bu yerda: huquq,
 * egalik, yozish.
 */

export interface SectionRow {
  id: string;
  title: string;
  content: string;
  reviewState: "pending_review" | "published" | "rejected";
  reviewNote: string | null;
  /**
   * Matnni tahririyat yozganmi.
   *
   * A'zoga aytiladi: tahririyat tayyorlagan, fakt-tekshiruvidan
   * o'tgan matnni o'zgartirish uni QAYTA ko'rikka yuboradi va
   * ommaviy sahifadan vaqtincha chiqaradi (§6).
   */
  fromEditorial: boolean;
}

export type SectionResult = { ok: true } | { ok: false; error: string };

/** Bitta profildagi bo'limlar soni chegarasi. */
export const SECTION_LIMIT = 30;

/* ========================================================================= *
 * O'QISH
 * ========================================================================= */

/**
 * A'zoning barcha bo'limlari — tekshiruvdagilar ham.
 *
 * Kutayotgani KO'RSATILADI: aks holda odam yuborganidan keyin uni
 * muharrirda ko'rmay, yo'qolib ketdi deb o'ylardi.
 */
export async function loadOwnSections(candidateId: string): Promise<SectionRow[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("candidate_sections")
    .select("id, title, content, review_state, review_note, submitted_by")
    .eq("candidate_id", candidateId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[profil] bo'limlar o'qilmadi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? "",
    content: (row.content as string) ?? "",
    reviewState: row.review_state as SectionRow["reviewState"],
    reviewNote: (row.review_note as string | null) ?? null,
    // `submitted_by = null` — tahririyat kiritgan (eski va panel orqali).
    fromEditorial: row.submitted_by === null,
  }));
}

/* ========================================================================= *
 * QO'SHISH
 * ========================================================================= */

export async function createSection(input: SectionInput): Promise<SectionResult> {
  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const check = checkSection(input);
  if (!check.ok) return { ok: false, error: check.errors[0]! };

  const admin = createAdminClient();

  /*
   * KO'P BO'LIM YASASHGA CHEK.
   *
   * Cheklovsiz bitta profil yuzlab bo'lim yasab, ko'rik navbatini
   * ko'mib tashlashi va ommaviy sahifani cho'zib yuborishi mumkin edi.
   */
  const { count, error: countError } = await admin
    .from("candidate_sections")
    .select("id", { head: true, count: "exact" })
    .eq("candidate_id", resolved.owned.candidateId);

  if (countError) {
    console.error("[profil] bo'limlar soni o'qilmadi:", countError.message);
    return { ok: false, error: "Bo'limni saqlab bo'lmadi." };
  }
  if ((count ?? 0) >= SECTION_LIMIT) {
    return { ok: false, error: `Ko'pi bilan ${SECTION_LIMIT} ta bo'lim bo'lishi mumkin.` };
  }

  /*
   * HOLAT O'ZGARMAS QIYMAT — brauzerdan QABUL QILINMAYDI (§43).
   *
   * Hozir u har doim `published`, lekin baribir shu yerda yoziladi:
   * kiritmadan olinsa, kelajakda ko'rik qaytarilganda uni chetlab
   * o'tish yo'li ochiq qolardi.
   */
  const reviewState = "published";

  const { data: inserted, error } = await admin
    .from("candidate_sections")
    .insert({
      candidate_id: resolved.owned.candidateId,
      title: check.value.title,
      content: check.value.content,
      submitted_by: resolved.owned.profileId,
      review_state: reviewState,
      // Yangi bo'lim oxiriga tushadi; tartib alohida amal bilan o'zgaradi.
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[profil] bo'lim qo'shilmadi:", error.message);
    return { ok: false, error: "Bo'limni saqlab bo'lmadi." };
  }

  await recordAudit("profile.section.created", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    after: { title: check.value.title, review_state: reviewState },
    metadata: { section_id: (inserted?.id as string | undefined) ?? null },
  });

  return { ok: true };
}

/* ========================================================================= *
 * O'ZGARTIRISH
 * ========================================================================= */

export async function updateSection(
  sectionId: string,
  input: SectionInput,
): Promise<SectionResult> {
  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const check = checkSection(input);
  if (!check.ok) return { ok: false, error: check.errors[0]! };

  const admin = createAdminClient();

  /*
   * ESKI QIYMAT — jurnal uchun va "nima o'zgardi" savoliga javob.
   *
   * Egalik sharti bilan o'qiladi: begona matn hatto jurnalga ham
   * tushmasligi kerak.
   */
  const { data: previous, error: previousError } = await admin
    .from("candidate_sections")
    .select("title, review_state")
    .eq("id", sectionId)
    .eq("candidate_id", resolved.owned.candidateId)
    .maybeSingle();

  if (previousError) {
    console.error("[profil] bo'lim o'qilmadi:", previousError.message);
    return { ok: false, error: "O'zgarishni saqlab bo'lmadi." };
  }
  if (!previous) return { ok: false, error: "Bo'lim topilmadi." };

  /*
   * O'ZGARISH DARHOL OMMAVIY SAHIFADA.
   *
   * Tahririyat tayyorlagan matnni o'zgartirganda ham kutish yo'q:
   * matn egasiniki va u uchun javobgar ham o'zi. Eski qiymat
   * JURNALDA qoladi (quyida) — ya'ni "nima o'zgardi, kim
   * o'zgartirdi" savoliga javob bor.
   */
  const reviewState = "published";

  const { data, error } = await admin
    .from("candidate_sections")
    .update({
      title: check.value.title,
      content: check.value.content,
      review_state: reviewState,
      // Qaytadan ko'rikka ketdi: oldingi izoh endi tegishli emas.
      review_note: null,
      reviewed_by: null,
      reviewed_at: null,
      submitted_by: resolved.owned.profileId,
    })
    .eq("id", sectionId)
    /*
     * EGALIK SHARTI YOZISHDA — asosiy himoya.
     *
     * `sectionId` brauzerdan keladi. Tekshirilmasa, VIP a'zo BOSHQA
     * nomzodning biografiyasini o'zgartirishi mumkin bo'lardi (§44).
     */
    .eq("candidate_id", resolved.owned.candidateId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[profil] bo'lim o'zgartirilmadi:", error.message);
    return { ok: false, error: "O'zgarishni saqlab bo'lmadi." };
  }
  /*
   * Qator topilmadi: yoki yo'q, yoki BOSHQA nomzodga tegishli.
   * Ikkisini ajratib aytmaymiz — "sizga tegishli emas" degan javob
   * bo'limning mavjudligini oshkor qilardi.
   */
  if (!data) return { ok: false, error: "Bo'lim topilmadi." };

  await recordAudit("profile.section.updated", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: {
      title: (previous.title as string | null) ?? null,
      review_state: (previous.review_state as string | null) ?? null,
    },
    after: { title: check.value.title, review_state: reviewState },
    metadata: { section_id: sectionId },
  });

  return { ok: true };
}

/* ========================================================================= *
 * O'CHIRISH
 * ========================================================================= */

export async function deleteSection(sectionId: string): Promise<SectionResult> {
  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("candidate_sections")
    .delete()
    .eq("id", sectionId)
    // Egalik sharti — o'chirishda ham.
    .eq("candidate_id", resolved.owned.candidateId)
    .select("id, title, content, review_state")
    .maybeSingle();

  if (error) {
    console.error("[profil] bo'lim o'chirilmadi:", error.message);
    return { ok: false, error: "Bo'limni o'chirib bo'lmadi." };
  }
  if (!data) return { ok: false, error: "Bo'lim topilmadi." };

  /*
   * O'CHIRILGAN MATN JURNALDA QOLADI.
   *
   * Qator bazadan butunlay ketadi; tahririyat tayyorlagan biografiya
   * yo'qolganda "nima edi" degan savolga javob faqat shu yerda.
   * Matn uzun bo'lishi mumkin — jurnalga boshi yoziladi.
   */
  await recordAudit("profile.section.deleted", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: {
      title: (data.title as string | null) ?? null,
      content: ((data.content as string | null) ?? "").slice(0, 2000),
      review_state: (data.review_state as string | null) ?? null,
    },
    metadata: { section_id: sectionId },
  });

  return { ok: true };
}

/* ========================================================================= *
 * TARTIB
 * ========================================================================= */

/**
 * Bo'limlar tartibini o'zgartiradi.
 *
 * TARTIB KO'RIKKA BORMAYDI: u mazmun emas, ko'rinish — yozuvlardagi
 * bilan bir xil qoida (`reorderEntries`).
 */
export async function reorderSections(orderedIds: readonly string[]): Promise<SectionResult> {
  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  if (orderedIds.length === 0) return { ok: true };
  if (orderedIds.length > SECTION_LIMIT) return { ok: false, error: "Juda ko'p bo'lim." };

  const admin = createAdminClient();

  /*
   * HAR BIR QATOR ALOHIDA YANGILANADI.
   *
   * Bitta `upsert` qulayroq bo'lardi, lekin u egalik shartini qo'llay
   * olmaydi — ya'ni boshqa nomzodning qatorini ham yangilab yuborardi.
   */
  for (let index = 0; index < orderedIds.length; index += 1) {
    const { error } = await admin
      .from("candidate_sections")
      .update({ sort_order: index })
      .eq("id", orderedIds[index]!)
      .eq("candidate_id", resolved.owned.candidateId);

    if (error) {
      console.error("[profil] bo'lim tartibi saqlanmadi:", error.message);
      return { ok: false, error: "Tartibni saqlab bo'lmadi." };
    }
  }

  return { ok: true };
}
