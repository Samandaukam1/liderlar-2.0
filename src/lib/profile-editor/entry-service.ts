import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { resolveOwnCandidate } from "./edit-service";
import {
  checkEntry,
  ENTRY_RULES,
  type EntryInput,
  type EntryKind,
} from "./field-policy";

/**
 * TUZILGAN YOZUVLAR — TA'LIM, ISH TAJRIBASI, YUTUQLAR…
 *
 * Mavjud jadvallar ustida ishlaydi (`education`, `work_experiences`,
 * `achievements`, `events`, `books_read`, `social_links`) — hammasi
 * bir xil shaklda.
 *
 * KO'RIK HOLATI QATORNING O'ZIDA (`review_state`), alohida navbat
 * jadvalida emas: bu yerda ko'rilayotgan narsa qatorning o'zi va uni
 * boshqa jadvalga nusxalash ikki joyda bir xil ma'lumot hosil
 * qilardi.
 */

export interface EntryRow {
  id: string;
  kind: EntryKind;
  title: string;
  subtitle: string | null;
  description: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  url: string | null;
  reviewState: "pending_review" | "published" | "rejected";
  reviewNote: string | null;
}

export type EntryResult = { ok: true } | { ok: false; error: string };

/**
 * Tur nomini tekshiradi.
 *
 * BRAUZERDAN KELGAN QIYMAT JADVAL NOMIGA AYLANADI, shuning uchun u
 * ro'yxatdan o'tishi SHART. Tekshirmasak, `kind` ixtiyoriy jadval
 * nomi bo'lib, boshqa jadvalga yozish imkoni paydo bo'lardi.
 */
function isEntryKind(value: unknown): value is EntryKind {
  return typeof value === "string" && Object.hasOwn(ENTRY_RULES, value);
}

/* ========================================================================= *
 * O'QISH
 * ========================================================================= */

/**
 * Foydalanuvchining barcha yozuvlari — tekshiruvdagilar ham.
 *
 * Kutayotgan yozuv KO'RSATILADI: aks holda odam yuborganidan keyin
 * uni muharrirda ko'rmay, yo'qolib ketdi deb o'ylardi va qaytadan
 * kiritardi.
 */
export async function loadOwnEntries(
  candidateId: string,
  kind: EntryKind,
): Promise<EntryRow[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from(kind)
    .select(
      "id, title, subtitle, description, date_from, date_to, url, review_state, review_note",
    )
    .eq("candidate_id", candidateId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[profil] yozuvlar o'qilmadi:", { kind, message: error.message });
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    kind,
    title: (row.title as string) ?? "",
    subtitle: (row.subtitle as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    dateFrom: (row.date_from as string | null) ?? null,
    dateTo: (row.date_to as string | null) ?? null,
    url: (row.url as string | null) ?? null,
    reviewState: row.review_state as EntryRow["reviewState"],
    reviewNote: (row.review_note as string | null) ?? null,
  }));
}

/* ========================================================================= *
 * QO'SHISH
 * ========================================================================= */

export async function createEntry(
  kindInput: unknown,
  input: EntryInput,
): Promise<EntryResult & { reviewNeeded?: boolean }> {
  if (!isEntryKind(kindInput)) {
    return { ok: false, error: "Bo'lim tanlanmagan." };
  }
  const kind = kindInput;

  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const check = checkEntry(kind, input);
  if (!check.ok) return { ok: false, error: check.errors[0]! };

  /*
   * KO'RIK KERAKMI — SIYOSAT HAL QILADI, foydalanuvchi emas.
   *
   * Brauzerdan `review_state` qabul qilinsa, odam o'z yutug'ini
   * darhol `published` qilib yuborardi (§43).
   */
  const rule = ENTRY_RULES[kind];
  const reviewState = rule.policy === "review" ? "pending_review" : "published";

  const admin = createAdminClient();
  const { data: inserted, error } = await admin
    .from(kind)
    .insert({
      ...check.value,
      candidate_id: resolved.owned.candidateId,
      submitted_by: resolved.owned.profileId,
      review_state: reviewState,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[profil] yozuv qo'shilmadi:", { kind, message: error.message });
    return { ok: false, error: "Yozuvni saqlab bo'lmadi." };
  }

  await recordAudit("profile.entry.created", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    after: { title: check.value.title ?? null, review_state: reviewState },
    metadata: { kind, entry_id: (inserted?.id as string | undefined) ?? null },
  });

  return { ok: true, reviewNeeded: reviewState === "pending_review" };
}

/* ========================================================================= *
 * O'ZGARTIRISH
 * ========================================================================= */

export async function updateEntry(
  kindInput: unknown,
  entryId: string,
  input: EntryInput,
): Promise<EntryResult & { reviewNeeded?: boolean }> {
  if (!isEntryKind(kindInput)) return { ok: false, error: "Bo'lim tanlanmagan." };
  const kind = kindInput;

  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const check = checkEntry(kind, input);
  if (!check.ok) return { ok: false, error: check.errors[0]! };

  const rule = ENTRY_RULES[kind];

  /*
   * TASDIQLANGAN YOZUVNI O'ZGARTIRISH TASDIQNI BEKOR QILADI (§6).
   *
   * "If a user changes a verified fact, do not silently destroy
   * verification." Shuning uchun o'zgartirilgan yozuv qaytadan
   * ko'rikka boradi va ommaviy profildan VAQTINCHA chiqadi.
   *
   * Muqobil yo'l — eski qiymatni ko'rsatib turish va yangisini
   * ko'rikda kutish — ikki qiymatni bir qatorda saqlashni talab
   * qilardi; bu jadvallarda esa bitta qiymat bor.
   */
  const reviewState = rule.policy === "review" ? "pending_review" : "published";

  const admin = createAdminClient();

  /*
   * ESKI SARLAVHA VA HOLAT — jurnal uchun.
   *
   * Egalik sharti bilan o'qiladi: begona yozuvning sarlavhasi hatto
   * jurnalga ham tushmasligi kerak.
   */
  const { data: previous, error: previousError } = await admin
    .from(kind)
    .select("title, review_state")
    .eq("id", entryId)
    .eq("candidate_id", resolved.owned.candidateId)
    .maybeSingle();

  if (previousError) {
    console.error("[profil] yozuv o'qilmadi:", { kind, message: previousError.message });
    return { ok: false, error: "O'zgarishni saqlab bo'lmadi." };
  }
  if (!previous) return { ok: false, error: "Yozuv topilmadi." };

  const { data, error } = await admin
    .from(kind)
    .update({
      ...check.value,
      review_state: reviewState,
      // Qaytadan ko'rikka ketdi: oldingi ko'rik izohi endi tegishli emas.
      review_note: null,
      reviewed_by: null,
      reviewed_at: null,
    })
    .eq("id", entryId)
    /*
     * EGALIK SHARTI YOZISHDA — bu asosiy himoya.
     *
     * `entryId` brauzerdan keladi. Egalik tekshirilmasa, odam boshqa
     * nomzodning yozuvini o'zgartirishi mumkin bo'lardi (§44).
     */
    .eq("candidate_id", resolved.owned.candidateId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[profil] yozuv o'zgartirilmadi:", { kind, message: error.message });
    return { ok: false, error: "O'zgarishni saqlab bo'lmadi." };
  }
  if (!data) {
    /*
     * Qator topilmadi: yoki yo'q, yoki BOSHQA nomzodga tegishli.
     * Ikkisini ajratib aytmaymiz — "sizga tegishli emas" degan javob
     * yozuvning mavjudligini oshkor qilardi.
     */
    return { ok: false, error: "Yozuv topilmadi." };
  }

  await recordAudit("profile.entry.updated", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: {
      title: (previous.title as string | null) ?? null,
      review_state: (previous.review_state as string | null) ?? null,
    },
    after: { title: check.value.title ?? null, review_state: reviewState },
    metadata: { kind, entry_id: entryId },
  });

  return { ok: true, reviewNeeded: reviewState === "pending_review" };
}

/* ========================================================================= *
 * O'CHIRISH
 * ========================================================================= */

export async function deleteEntry(
  kindInput: unknown,
  entryId: string,
): Promise<EntryResult> {
  if (!isEntryKind(kindInput)) return { ok: false, error: "Bo'lim tanlanmagan." };
  const kind = kindInput;

  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from(kind)
    .delete()
    .eq("id", entryId)
    // Egalik sharti — o'chirishda ham.
    .eq("candidate_id", resolved.owned.candidateId)
    .select("id, title, review_state")
    .maybeSingle();

  if (error) {
    console.error("[profil] yozuv o'chirilmadi:", { kind, message: error.message });
    return { ok: false, error: "Yozuvni o'chirib bo'lmadi." };
  }
  if (!data) return { ok: false, error: "Yozuv topilmadi." };

  /*
   * O'CHIRILGAN YOZUV MAZMUNI JURNALDA QOLADI.
   *
   * Qator bazadan butunlay ketadi; tahririyat tasdiqlagan yutuq
   * yo'qolganda "nima edi" degan savolga javob faqat shu yerda.
   */
  await recordAudit("profile.entry.deleted", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: {
      title: (data.title as string | null) ?? null,
      review_state: (data.review_state as string | null) ?? null,
    },
    metadata: { kind, entry_id: entryId },
  });

  return { ok: true };
}

/* ========================================================================= *
 * TARTIB
 * ========================================================================= */

/**
 * Yozuvlar tartibini o'zgartiradi.
 *
 * ALOHIDA AMAL: oddiy saqlash bilan birga qabul qilinsa, foydalanuvchi
 * boshqa yozuvlarning tartibini bilmasdan o'zgartirib qo'yardi.
 *
 * TARTIB KO'RIKKA BORMAYDI: u mazmun emas, ko'rinish. Yutuqlarni
 * qayta tartiblash uchun tahririyat tasdig'ini kutish ma'nosiz
 * bo'lardi.
 */
export async function reorderEntries(
  kindInput: unknown,
  orderedIds: readonly string[],
): Promise<EntryResult> {
  if (!isEntryKind(kindInput)) return { ok: false, error: "Bo'lim tanlanmagan." };
  const kind = kindInput;

  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  if (orderedIds.length === 0) return { ok: true };
  if (orderedIds.length > 200) {
    return { ok: false, error: "Juda ko'p yozuv." };
  }

  const admin = createAdminClient();

  /*
   * HAR BIR QATOR ALOHIDA YANGILANADI.
   *
   * Bitta `upsert` qulayroq bo'lardi, lekin u egalik shartini
   * qo'llay olmaydi — ya'ni boshqa nomzodning qatorini ham
   * yangilab yuborardi. Egalik muhimroq.
   */
  for (let index = 0; index < orderedIds.length; index += 1) {
    const { error } = await admin
      .from(kind)
      .update({ sort_order: index })
      .eq("id", orderedIds[index]!)
      .eq("candidate_id", resolved.owned.candidateId);

    if (error) {
      console.error("[profil] tartib saqlanmadi:", { kind, message: error.message });
      return { ok: false, error: "Tartibni saqlab bo'lmadi." };
    }
  }

  return { ok: true };
}
