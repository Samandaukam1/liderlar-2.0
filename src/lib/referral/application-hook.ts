import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isFeatureEnabled } from "@/lib/vip/entitlement-service";
import { normalizeCode } from "./code";
import { resolveReferralCode } from "./code-service";
import { attributeApplication } from "./attribution-service";

/**
 * ARIZA OQIMIGA TAVSIYA KODINI ULASH.
 *
 * IKKI YUBORISH YO'LI BOR (`/api/application/submit` va
 * `ariza/actions.ts`) va ikkisi BIR XIL tekshiruvdan o'tishi kerak.
 * Shuning uchun mantiq shu yerda: har ikkisiga alohida yozilsa,
 * ular vaqt o'tib ajralib ketardi.
 *
 * ENG MUHIM QOIDA: PROMO KODNING IKKI TURI ARALASHMAYDI.
 *
 *   - KOORDINATOR kodi — lidni o'sha koordinatorga biriktiradi va
 *     nomzodni TEKINGA chiqaradi.
 *   - NOMZODNING shaxsiy tavsiya kodi — faqat atributsiya beradi,
 *     tekin qabul BERMAYDI va lid marshrutiga tegmaydi.
 *
 * Ikkisi bitta maydonga yozilsa ham, bu modul turini aniqlaydi va
 * shaxsiy kod hech qachon tekin qabul yo'liga tushmaydi.
 */

/**
 * `unavailable` — kodni tekshirib bo'lmadi (baza xatosi). `unknown` dan
 * ATAYLAB ajratilgan: majburiy rejimda "bunday kod topilmadi" deyish
 * to'g'ri kodli odamni ham qaytarib yuborardi.
 */
export type PromoKind = "personal" | "coordinator" | "registry" | "unknown" | "unavailable";

export interface PromoClassification {
  kind: PromoKind;
  /** Faqat `personal` uchun to'ldiriladi. */
  ownerProfileId: string | null;
}

/**
 * Kod turini aniqlaydi.
 *
 * TARTIB MUHIM: shaxsiy kod BIRINCHI tekshiriladi. Teskarisi bo'lsa,
 * koordinator kodiga o'xshab ketgan shaxsiy kod tekin qabul yo'liga
 * tushib ketishi mumkin edi.
 */
export async function classifyPromoCode(
  input: string | null | undefined,
): Promise<PromoClassification> {
  const code = normalizeCode(input);
  if (code === "") return { kind: "unknown", ownerProfileId: null };

  const personal = await resolveReferralCode(code);
  if (personal.ok) {
    return { kind: "personal", ownerProfileId: personal.ownerProfileId };
  }
  if (personal.unavailable) return { kind: "unavailable", ownerProfileId: null };

  const admin = createAdminClient();

  /*
   * KOORDINATOR KODI.
   *
   * Solishtirish `upper()` bo'yicha — bazadagi
   * `uq_coordinator_promo_code_active` indeksi ham shunday. Boshqa
   * usul ishlatsak, indeks topgan kodni biz topmay qolardik.
   */
  const { data: coordinator, error: coordinatorError } = await admin
    .from("coordinators")
    .select("id")
    .eq("is_active", true)
    .ilike("promo_code", code)
    .maybeSingle();

  if (coordinatorError) {
    console.error("[referral] koordinator kodi tekshirilmadi:", coordinatorError.message);
    return { kind: "unavailable", ownerProfileId: null };
  }
  if (coordinator) return { kind: "coordinator", ownerProfileId: null };

  const { data: registry, error: registryError } = await admin
    .from("promo_codes")
    .select("id")
    .eq("is_active", true)
    .eq("code", code)
    .maybeSingle();

  if (registryError) {
    console.error("[referral] promo kod reyestri tekshirilmadi:", registryError.message);
    return { kind: "unavailable", ownerProfileId: null };
  }
  if (registry) return { kind: "registry", ownerProfileId: null };

  return { kind: "unknown", ownerProfileId: null };
}

/* ========================================================================= *
 * MAJBURIYLIK
 * ========================================================================= */

export interface PromoRequirement {
  required: boolean;
}

/**
 * Promo kod majburiymi.
 *
 * FLAG OSTIDA. Majburiy qilish ishlayotgan ommaviy oqimni
 * o'zgartiradi va arizalar sonini kamaytirishi mumkin — shuning
 * uchun u ongli ravishda yoqilishi kerak, deploy bilan birga
 * o'z-o'zidan emas.
 */
export async function loadPromoRequirement(): Promise<PromoRequirement> {
  return { required: await isFeatureEnabled("vip.referrals_enabled") };
}

export type PromoGateResult = { ok: true } | { ok: false; error: string; field: "promoCode" };

/**
 * Yuborishdan OLDIN kodni tekshiradi.
 *
 * Flag o'chiq bo'lsa, HOZIRGI xatti-harakat aynan saqlanadi: kod
 * ixtiyoriy va noma'lum kod to'silmaydi. Bu ataylab — mavjud
 * koordinator va kampaniya kodlari oqimi buzilmasligi kerak.
 */
export async function checkPromoGate(
  input: string | null | undefined,
  classification: PromoClassification,
): Promise<PromoGateResult> {
  const { required } = await loadPromoRequirement();
  if (!required) return { ok: true };

  const code = normalizeCode(input);
  if (code === "") {
    return {
      ok: false,
      error: "Promo kod majburiy. Sizni taklif qilgan odamning kodini kiriting.",
      field: "promoCode",
    };
  }

  /*
   * MAJBURIY HOLATDA NOMA'LUM KOD RAD ETILADI.
   *
   * Aks holda "majburiy" shunchaki bo'sh bo'lmaslikni talab qilardi
   * va istalgan harflar to'plami o'tib ketardi — ya'ni qoida
   * ko'rinishda bor, amalda yo'q.
   */
  if (classification.kind === "unknown") {
    return { ok: false, error: "Bunday promo kod topilmadi.", field: "promoCode" };
  }

  /*
   * TEKSHIRIB BO'LMADI — "topilmadi" EMAS.
   *
   * Majburiy rejimda kodni tasdiqlamay ariza qabul qilinmaydi, lekin
   * odamga haqiqat aytiladi: kod to'g'ri bo'lishi mumkin, xato bizda.
   */
  if (classification.kind === "unavailable") {
    return {
      ok: false,
      error: "Promo kodni hozir tekshirib bo'lmadi. Birozdan keyin qayta urinib ko'ring.",
      field: "promoCode",
    };
  }

  return { ok: true };
}

/* ========================================================================= *
 * ATRIBUTSIYA
 * ========================================================================= */

/**
 * Ariza saqlangandan KEYIN atributsiyani yozadi.
 *
 * KEYIN, chunki atributsiya `application_id` ga bog'lanadi.
 *
 * XATO ARIZANI YIQITMAYDI. Ariza allaqachon saqlangan va uni
 * atributsiya tufayli rad etish nomzodni jazolash bo'lardi —
 * holbuki u hech narsa qilmagan. Nosozlik LOGDA qoladi va
 * atributsiya keyin qo'lda tiklanishi mumkin.
 */
export async function recordApplicationReferral(input: {
  applicationId: string;
  code: string | null | undefined;
  classification: PromoClassification;
}): Promise<void> {
  // Faqat SHAXSIY kod atributsiya beradi.
  if (input.classification.kind !== "personal") return;

  const result = await attributeApplication({
    applicationId: input.applicationId,
    code: normalizeCode(input.code),
  });

  if (!result.ok) {
    console.error("[referral] ariza atributsiyasi yozilmadi:", {
      applicationId: input.applicationId,
      error: result.error,
    });
  }
}
