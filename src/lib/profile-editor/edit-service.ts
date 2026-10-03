import "server-only";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEntitlement } from "@/lib/vip/entitlement-service";
import { recordAudit, type AuditScalar } from "@/lib/vip/audit-log";
import {
  CANDIDATE_FIELDS,
  filterCandidateChanges,
  saveMessage,
  type FilterResult,
} from "./field-policy";

/**
 * PROFILNI O'ZI TAHRIRLASH — BAZAGA TEGADIGAN QISM.
 *
 * Siyosat `field-policy.ts` da va u testlangan. Bu yerda: shaxsni
 * aniqlash, egalikni tekshirish, o'zgarishni yozish.
 */

/* ========================================================================= *
 * EGALIK — §44
 * ========================================================================= */

export interface OwnedCandidate {
  candidateId: string;
  profileId: string;
}

/**
 * Joriy foydalanuvchining nomzod profilini topadi.
 *
 * `candidate_id` BRAUZERDAN OLINMAYDI (§44). Agar olinganida, har kim
 * boshqa odamning id sini yuborib, uning profilini tahrirlashi mumkin
 * bo'lardi — ruxsat ro'yxati ham bunga to'sqinlik qilmasdi, chunki u
 * MAYDONLARNI tekshiradi, egalikni emas.
 *
 * Zanjir: auth.users -> candidates.user_id. Oraliqda hech narsa
 * qabul qilinmaydi.
 */
export async function resolveOwnCandidate(): Promise<
  { ok: true; owned: OwnedCandidate } | { ok: false; error: string }
> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Avval tizimga kiring." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("candidates")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[profil] nomzod topilmadi:", error.message);
    return { ok: false, error: "Profilni o'qib bo'lmadi." };
  }
  if (!data) {
    return {
      ok: false,
      error: "Sizda ensiklopediya profili yo'q. Tahririyatga murojaat qiling.",
    };
  }

  return { ok: true, owned: { candidateId: data.id as string, profileId: user.id } };
}

/* ========================================================================= *
 * SAQLASH
 * ========================================================================= */

export interface SaveOutcome {
  ok: boolean;
  message: string;
  /** Ruxsat ro'yxatidan o'tmagan maydonlar — chaqiruvchiga aytiladi. */
  rejected: string[];
  invalid: Array<{ field: string; error: string }>;
}

/**
 * Profil maydonlarini saqlaydi.
 *
 * TARTIB: huquq -> egalik -> siyosat -> yozish. Har bir qadam
 * oldingisiga tayanadi va biri o'tkazib yuborilsa, keyingisi
 * ma'nosiz bo'ladi.
 */
export async function saveProfileFields(
  patch: Readonly<Record<string, unknown>>,
): Promise<SaveOutcome> {
  /*
   * HUQUQ — ENG AVVAL.
   *
   * Frontendda tugmani yashirish avtorizatsiya emas (§3): bu funksiya
   * server amali orqali to'g'ridan-to'g'ri chaqirilishi mumkin.
   */
  const entitled = await requireEntitlement("profile.self_edit");
  if (!entitled.ok) {
    return { ok: false, message: entitled.error, rejected: [], invalid: [] };
  }

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) {
    return { ok: false, message: resolved.error, rejected: [], invalid: [] };
  }

  const { candidateId, profileId } = resolved.owned;
  const admin = createAdminClient();

  /*
   * HOZIRGI QIYMATLAR O'QILADI.
   *
   * Ular ikki narsa uchun kerak: o'zgarmagan maydonni yozmaslik va
   * adminga "eski -> yangi" juftligini ko'rsatish (§6).
   */
  /*
   * USTUNLAR RO'YXATI QO'LDA YOZILGAN, `Object.keys` dan EMAS.
   *
   * Dinamik qatorda Supabase tiplari natijani aniqlay olmaydi va
   * javob `GenericStringError` bo'lib chiqadi — ya'ni tip tekshiruvi
   * butunlay yo'qoladi.
   *
   * Ro'yxat `CANDIDATE_FIELDS` bilan mos bo'lishini test qo'riqlaydi
   * (`profile-field-policy.test.ts`).
   */
  const { data: current, error: readError } = await admin
    .from("candidates")
    .select("short_bio, birth_date, region_id, category_id, phone, email")
    .eq("id", candidateId)
    .single();

  if (readError || !current) {
    console.error("[profil] hozirgi qiymatlar o'qilmadi:", readError?.message);
    return { ok: false, message: "Profilni o'qib bo'lmadi.", rejected: [], invalid: [] };
  }

  const result = filterCandidateChanges(patch, current as Record<string, unknown>);

  if (result.invalid.length > 0) {
    /*
     * YAROQSIZ QIYMAT BO'LSA, HECH NARSA YOZILMAYDI.
     *
     * Qismini yozib qismini rad etish foydalanuvchini "nimasi
     * saqlandi" degan savol oldida qoldirardi.
     */
    return {
      ok: false,
      message: result.invalid[0]!.error,
      rejected: result.rejected,
      invalid: result.invalid,
    };
  }

  if (result.rejected.length > 0) {
    /*
     * RUXSAT RO'YXATIDAN O'TMAGAN MAYDON — LOGGA.
     *
     * Odatiy foydalanuvchi bunday so'rov yubormaydi: forma faqat
     * ruxsat etilgan maydonlarni ko'rsatadi. Ya'ni bu yerga tushish
     * yoki xato, yoki ataylab urinish — ikkisi ham ko'rinishi kerak.
     */
    console.warn("[profil] ruxsatsiz maydonlar rad etildi:", {
      candidateId,
      fields: result.rejected,
    });
  }

  const direct = await writeDirect(candidateId, profileId, result);
  if (!direct.ok) {
    return { ok: false, message: direct.error, rejected: result.rejected, invalid: [] };
  }

  const queued = await queueForReview(candidateId, profileId, result);
  if (!queued.ok) {
    /*
     * Darhol yozilganlar allaqachon saqlangan.
     *
     * Ularni qaytarib olmaymiz: foydalanuvchiga nima saqlanganini
     * aytish qaytarishdan ko'ra halolroq, va qaytarish ham xuddi
     * shu tarzda yiqilishi mumkin.
     */
    return {
      ok: false,
      message:
        "Bir qism o'zgarish saqlandi, lekin tekshiruvga yuborishda xatolik bo'ldi. Qaytadan urinib ko'ring.",
      rejected: result.rejected,
      invalid: [],
    };
  }

  return {
    ok: true,
    message: saveMessage(result),
    rejected: result.rejected,
    invalid: [],
  };
}

/**
 * Jurnal uchun qiymat.
 *
 * Maydon qiymati `unknown` (sana, uuid, matn, `null`). Jurnalga faqat
 * oddiy qiymat tushadi — obyekt kelsa, matnga aylantiriladi.
 */
function auditScalar(value: unknown): AuditScalar {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return String(value);
}

/** Darhol nashr bo'ladigan maydonlarni yozadi. */
async function writeDirect(
  candidateId: string,
  profileId: string,
  result: FilterResult,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (result.direct.length === 0) return { ok: true };

  const patch: Record<string, unknown> = {};
  for (const change of result.direct) patch[change.field] = change.after;

  /*
   * `last_updated_at` HAM YANGILANADI.
   *
   * Tizim "profil qachon yangilangan" degan sanani yuritadi va u
   * yangilanish eslatmalariga tayanadi. Yozmasak, odam profilini
   * yangilagan bo'lsa ham tizim uni eskirgan deb hisoblardi.
   */
  patch.last_updated_at = new Date().toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from("candidates").update(patch).eq("id", candidateId);

  if (error) {
    console.error("[profil] o'zgarish yozilmadi:", error.message);
    return { ok: false, error: "O'zgarishni saqlab bo'lmadi." };
  }

  /*
   * DARHOL NASHR BO'LGAN O'ZGARISH HAM TARIXDA QOLADI (§6, §56).
   *
   * Bu maydonlar ko'rik navbatiga tushmaydi, ya'ni `candidate_profile_edits`
   * da iz qoldirmaydi. Jurnal bo'lmasa, admin "qisqa ma'lumotni kim va
   * qachon o'zgartirgan, oldin nima edi" degan savolga javob topa
   * olmasdi. Faqat HAQIQATAN o'zgargan maydonlar yoziladi.
   */
  const before: Record<string, AuditScalar> = {};
  const after: Record<string, AuditScalar> = {};
  for (const change of result.direct) {
    before[change.field] = auditScalar(change.before);
    after[change.field] = auditScalar(change.after);
  }
  await recordAudit("profile.fields.updated", {
    actorId: profileId,
    entityId: candidateId,
    before,
    after,
    metadata: { fields: result.direct.map((change) => change.field) },
  });

  return { ok: true };
}

/** Ko'rik talab qiladigan maydonlarni navbatga qo'yadi. */
async function queueForReview(
  candidateId: string,
  profileId: string,
  result: FilterResult,
): Promise<{ ok: boolean }> {
  if (result.review.length === 0) return { ok: true };

  const admin = createAdminClient();
  const queuedFields: string[] = [];

  for (const change of result.review) {
    /*
     * BITTA MAYDON — BITTA KUTAYOTGAN YOZUV.
     *
     * Avval kutayotganini `rejected` qilib yopamiz, keyin yangisini
     * qo'shamiz. Bazadagi qismiy unikal indeks shuni talab qiladi va
     * admin uchun ham to'g'ri: u faqat eng oxirgi niyatni ko'radi.
     *
     * Eski yozuv O'CHIRILMAYDI — u tarix (§6 revision history).
     */
    const { error: closeError } = await admin
      .from("candidate_profile_edits")
      .update({
        state: "rejected",
        review_note: "Foydalanuvchi yangi o'zgarish yubordi.",
      })
      .eq("candidate_id", candidateId)
      .eq("field", change.field)
      .eq("state", "pending_review");

    if (closeError) {
      /*
       * Eski yozuv yopilmasa, yangisi qismiy unikal indeksga uriladi.
       * Xabar aniq bo'lsin — "nega saqlanmadi" degan savol qolmasin.
       */
      console.error("[profil] kutayotgan yozuv yopilmadi:", {
        field: change.field,
        message: closeError.message,
      });
      return { ok: false };
    }

    const { error } = await admin.from("candidate_profile_edits").insert({
      candidate_id: candidateId,
      profile_id: profileId,
      field: change.field,
      before_value: change.before === null ? null : String(change.before),
      after_value: change.after === null ? null : String(change.after),
      state: "pending_review",
    });

    if (error) {
      console.error("[profil] navbatga qo'yilmadi:", {
        field: change.field,
        message: error.message,
      });
      return { ok: false };
    }
    queuedFields.push(change.field);
  }

  if (queuedFields.length > 0) {
    const proposed: Record<string, AuditScalar> = {};
    for (const change of result.review) proposed[change.field] = auditScalar(change.after);

    await recordAudit("profile.edit.submitted", {
      actorId: profileId,
      entityId: candidateId,
      after: proposed,
      metadata: { fields: queuedFields },
    });
  }

  return { ok: true };
}

/* ========================================================================= *
 * KUTAYOTGAN O'ZGARISHLAR
 * ========================================================================= */

export interface PendingEdit {
  field: string;
  label: string;
  afterValue: string | null;
  createdAt: string;
}

/**
 * Foydalanuvchining kutayotgan o'zgarishlari.
 *
 * Formada ko'rsatiladi: aks holda odam o'zgarish yuborganini bilmay,
 * qayta-qayta yuborardi va har safar "nega hali ham eski" deb
 * o'ylardi.
 */
export async function loadPendingEdits(candidateId: string): Promise<PendingEdit[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("candidate_profile_edits")
    .select("field, after_value, created_at")
    .eq("candidate_id", candidateId)
    .eq("state", "pending_review")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[profil] kutayotganlar o'qilmadi:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const field = row.field as string;
    return {
      field,
      // Texnik ustun nomi foydalanuvchiga ko'rsatilmaydi (§5).
      label: CANDIDATE_FIELDS[field]?.label ?? field,
      afterValue: (row.after_value as string | null) ?? null,
      createdAt: row.created_at as string,
    };
  });
}
