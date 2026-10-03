import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import { resolveReferralCode } from "./code-service";
import { advancesStage, type ReferralStage } from "./code";

/**
 * TAVSIYA ATRIBUTSIYASI.
 *
 * "Bu nomzodni kim olib keldi" degan savolning javobi. Javob BIR MARTA
 * yoziladi va keyin osongina o'zgartirilmaydi (§15).
 *
 * BALL BU YERDA BERILMAYDI. Ball alohida xizmatda va u faqat to'lov
 * tasdiqlangan hamda profil chop etilgan holatda ishlaydi.
 */

export type AttributionResult =
  | { ok: true; attributionId: string; ownerProfileId: string }
  | { ok: false; error: string; field?: "promoCode" };

/**
 * Arizaga tavsiya biriktiradi.
 *
 * TARTIB MUHIM: kod yechiladi -> atributsiya yoziladi. Teskarisi
 * bo'lsa, yaroqsiz kod uchun bo'sh qator qolardi.
 */
export async function attributeApplication(input: {
  applicationId: string;
  code: string;
  /**
   * Ariza topshirgan odamning profili — AGAR u tizimda bo'lsa.
   *
   * Ko'pincha `null`: ariza imzosiz topshiriladi va nomzodning
   * akkaunti hali yo'q. O'ziga o'zi tavsiya tekshiruvi shu sababli
   * keyingi bosqichlarda ham qaytariladi.
   */
  applicantProfileId?: string | null;
}): Promise<AttributionResult> {
  const resolution = await resolveReferralCode(input.code);
  if (!resolution.ok) {
    return { ok: false, error: resolution.error, field: "promoCode" };
  }

  /*
   * O'ZIGA O'ZI TAVSIYA — DARHOL RAD ETILADI (§17).
   *
   * Bazada ham `referral_no_self` sharti bor, lekin u faqat
   * `referred_profile_id` to'ldirilganda ishlaydi. Bu yerda esa
   * ariza topshirgan odam allaqachon tizimda bo'lsa, uni erta
   * to'xtatamiz va tushunarli matn beramiz.
   */
  if (
    input.applicantProfileId &&
    input.applicantProfileId === resolution.ownerProfileId
  ) {
    return {
      ok: false,
      error: "O'zingizning promo kodingizni ishlatib bo'lmaydi.",
      field: "promoCode",
    };
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("referral_attributions")
    .insert({
      referrer_profile_id: resolution.ownerProfileId,
      application_id: input.applicationId,
      stage: "application",
    })
    .select("id")
    .single();

  if (error) {
    /*
     * 23505 — bu arizaga allaqachon tavsiya biriktirilgan
     * (`uq_referral_attributions_application`).
     *
     * BIRINCHI ATRIBUTSIYA SAQLANADI (§15): ikkinchisi ustidan
     * yozmaydi. Mavjudini o'qib qaytaramiz — chaqiruvchi uchun bu
     * muvaffaqiyat, chunki ariza tavsiyali holatda.
     */
    if (error.code === "23505") {
      const { data: existing, error: existingError } = await admin
        .from("referral_attributions")
        .select("id, referrer_profile_id")
        .eq("application_id", input.applicationId)
        .maybeSingle();

      if (existingError) {
        console.error("[referral] mavjud atributsiya o'qilmadi:", existingError.message);
        return { ok: false, error: "Promo kodni biriktirib bo'lmadi." };
      }

      if (existing) {
        return {
          ok: true,
          attributionId: existing.id as string,
          ownerProfileId: existing.referrer_profile_id as string,
        };
      }
    }

    console.error("[referral] atributsiya yozilmadi:", error.message);
    return { ok: false, error: "Promo kodni biriktirib bo'lmadi." };
  }

  /*
   * Ariza imzosiz topshiriladi — aktyor yo'q (`null`). Kim tavsiya
   * qilgani va qaysi ariza ekani metadata'da.
   */
  await recordAudit("referral.attribution.created", {
    actorId: input.applicantProfileId ?? null,
    entityId: data.id as string,
    after: { stage: "application" },
    metadata: {
      referrer_profile_id: resolution.ownerProfileId,
      application_id: input.applicationId,
    },
  });

  return {
    ok: true,
    attributionId: data.id as string,
    ownerProfileId: resolution.ownerProfileId,
  };
}

/* ========================================================================= *
 * BOSQICHNI SILJITISH
 * ========================================================================= */

/**
 * Atributsiya bosqichini oldinga siljitadi.
 *
 * FAQAT OLDINGA (§47). Orqaga siljish rad etiladi: to'lov
 * tasdiqlangandan keyin bosqich "ariza"ga qaytsa, ball berilgan
 * atributsiya ball bermaydigan holatga tushib qolardi.
 *
 * To'lov qaytarilgan holat ALOHIDA ish: u teskari ball yozuvi bilan
 * hal qilinadi (§45), bosqichni qaytarish bilan emas.
 */
export async function advanceAttribution(input: {
  attributionId: string;
  nextStage: ReferralStage;
  /** Bosqich bilan birga to'ldiriladigan bog'lanishlar. */
  referredProfileId?: string | null;
  candidateId?: string | null;
}): Promise<{ ok: boolean; advanced: boolean; error?: string }> {
  const admin = createAdminClient();

  const { data: current, error: readError } = await admin
    .from("referral_attributions")
    .select("stage, referrer_profile_id")
    .eq("id", input.attributionId)
    .maybeSingle();

  if (readError || !current) {
    console.error("[referral] atributsiya o'qilmadi:", readError?.message);
    return { ok: false, advanced: false, error: "Atributsiya topilmadi." };
  }

  /*
   * O'ZIGA O'ZI TAVSIYA — SHU YERDA HAM.
   *
   * Ariza imzosiz topshirilgan bo'lsa, o'sha paytda tekshirib
   * bo'lmagan: nomzodning profili hali yo'q edi. Profil biriktirilgan
   * payt — bu tekshiruvning ikkinchi va haqiqiy imkoniyati.
   */
  if (
    input.referredProfileId &&
    input.referredProfileId === current.referrer_profile_id
  ) {
    return {
      ok: false,
      advanced: false,
      error: "O'ziga o'zi tavsiya: atributsiya siljitilmadi.",
    };
  }

  if (!advancesStage(current.stage as ReferralStage, input.nextStage)) {
    /*
     * Siljish yo'q — bu XATO EMAS.
     *
     * Takroriy hodisa (webhook ikki marta kelishi) shu yo'lga tushadi
     * va u hech narsa o'zgartirmasligi KERAK (§61 U-bandi).
     */
    return { ok: true, advanced: false };
  }

  const patch: Record<string, unknown> = { stage: input.nextStage };
  if (input.referredProfileId) patch.referred_profile_id = input.referredProfileId;
  if (input.candidateId) patch.candidate_id = input.candidateId;

  const { data: moved, error } = await admin
    .from("referral_attributions")
    .update(patch)
    /*
     * BOSQICH SHARTI YOZISHDA HAM QAYTARILADI.
     *
     * Yuqoridagi o'qish va bu yozish orasida boshqa so'rov bosqichni
     * siljitgan bo'lishi mumkin. Shart bo'lmasa, kechikkan so'rov
     * yangi bosqichni eskisiga qaytarib qo'yardi.
     */
    .eq("id", input.attributionId)
    .eq("stage", current.stage)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[referral] bosqich siljitilmadi:", error.message);
    return { ok: false, advanced: false, error: "Bosqichni saqlab bo'lmadi." };
  }

  /*
   * HECH NARSA YANGILANMADI — boshqa so'rov bosqichni o'zi siljitgan.
   *
   * Avval bu holat ham "siljidi" deb qaytardi. Bu xato emas (takroriy
   * hodisa), lekin "siljidi" deyish yolg'on edi.
   */
  if (!moved) return { ok: true, advanced: false };

  await recordAudit("referral.attribution.advanced", {
    actorId: null,
    entityId: input.attributionId,
    before: { stage: current.stage as string },
    after: { stage: input.nextStage },
    metadata: {
      referrer_profile_id: current.referrer_profile_id as string,
      candidate_id: input.candidateId ?? null,
    },
  });

  return { ok: true, advanced: true };
}
