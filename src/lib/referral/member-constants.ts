/**
 * Kabinet tavsiya paneli konstantalari — SOF MODUL.
 *
 * Alohida fayl: `member-data.ts` da `import "server-only"` bor va mijoz
 * komponenti undan QIYMAT import qilsa, `npm run build` yiqiladi (tsc va
 * lint buni ko'rmaydi).
 */

export type ReferralStatus = "applied" | "reviewing" | "published";

export const REFERRAL_STATUS_LABEL: Record<ReferralStatus, string> = {
  applied: "Ariza yuborildi",
  reviewing: "Tekshiruvda",
  published: "Maqola chop etildi",
};

/** Promo-kod VIP kampaniyasi: har chop etilgan tavsiya +10 kun, ko'pi bilan 30. */
export const REFERRAL_VIP_CAP_DAYS = 30;
export const REFERRAL_VIP_STEP_DAYS = 10;
