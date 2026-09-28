import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EXPIRED_PROMO_MESSAGE,
  findExpiredPromo,
  type ExpiredPromoCode,
} from "./code-match";

/**
 * MUDDATI TUGAGAN PROMO KODNI TO'SISH.
 *
 * Tekshiruv FAQAT SERVERDA bo'ladi: brauzerdagi sxema bazani
 * ko'rmaydi, ko'rsa ham foydalanuvchi uni chetlab o'tishi mumkin.
 * Ikkala yuborish yo'li — server action va API route — shu
 * funksiyadan o'tadi.
 *
 * XIZMAT ISHLAMASA ARIZA YO'QOLMAYDI. So'rov yiqilsa yoki
 * jadval bo'sh bo'lsa, ariza odatdagidek qabul qilinadi: bir
 * nechta eskirgan kod o'tib ketgani nomzodni butunlay yo'qotishdan
 * arzonroq. Xato jurnalga yoziladi.
 */

export interface PromoCheckResult {
  /** `null` — muammo yo'q. */
  error: string | null;
}

export async function checkPromoCodeUsable(
  promoCode: string | null | undefined,
): Promise<PromoCheckResult> {
  const input = (promoCode ?? "").trim();
  if (input === "") return { error: null };

  try {
    const admin = createAdminClient();
    /*
     * FAQAT MUDDATI TUGAGANLARI o'qiladi.
     *
     * Amal qilayotgan kodlar ro'yxati bu yerda kerak emas —
     * ular baribir o'tkaziladi. Kamroq ma'lumot so'rash
     * xavfsizroq va tezroq.
     */
    const { data, error } = await admin
      .from("promo_codes")
      .select("code, raw_code, expires_at")
      .eq("is_active", true)
      .not("expires_at", "is", null)
      .lte("expires_at", new Date().toISOString())
      .limit(500);

    if (error) {
      console.error("[promo] muddat tekshiruvi o‘qilmadi:", error.message);
      return { error: null };
    }

    const expired: ExpiredPromoCode[] = (data ?? []).map((row) => ({
      code: (row.code as string) ?? "",
      rawCode: (row.raw_code as string) ?? "",
      expiresAt: (row.expires_at as string | null) ?? null,
    }));

    const match = findExpiredPromo(input, expired);
    if (!match) return { error: null };

    /*
     * XABAR NOMZOD YOZGANIGA EMAS, RO'YXATDAGI KODGA ISHORA
     * QILADI — u holda odam "men boshqa narsa yozdim-ku" deb
     * chalkashmaydi.
     */
    return {
      error: match.exact
        ? EXPIRED_PROMO_MESSAGE
        : `${EXPIRED_PROMO_MESSAGE} («${match.code.rawCode}» kodining ko‘rinishi)`,
    };
  } catch (err) {
    console.error(
      "[promo] muddat tekshiruvi yiqildi:",
      err instanceof Error ? err.message : String(err),
    );
    return { error: null };
  }
}
