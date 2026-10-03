import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
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
 * ATAYLAB ajratilgan: tekshirib bo'lmagan kod "noma'lum" emas.
 *
 * Tur ARIZANI TO'XTATMAYDI (egasining qarori, 2026-10-03: promo kod
 * ixtiyoriy va istalgan kod qabul qilinadi). U faqat atributsiyani
 * hal qiladi.
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
