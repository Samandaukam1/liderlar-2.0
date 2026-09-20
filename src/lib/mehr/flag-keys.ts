/**
 * MEHR bayroqlarining KALITLARI — SOF MODUL.
 *
 * Admin ilovasidagi `src/lib/mehr/flag-keys.ts` bilan AYNAN
 * bir xil bo'lishi kerak: ikkala ilova bitta `site_settings`
 * jadvalini o'qiydi va kalitlar mos kelmasa, bayroq bir
 * ilovada yoqilib, ikkinchisida o'chiq ko'rinardi.
 *
 * Bu fayl `server-only` EMAS: mijoz komponentlari undan tip
 * import qilishi mumkin.
 */

export const MEHR_FLAG_KEYS = {
  publicEnabled: "mehr.public_enabled",
  activityCreationEnabled: "mehr.activity_creation_enabled",
  qrCheckinEnabled: "mehr.qr_checkin_enabled",
  pointsEnabled: "mehr.points_enabled",
  certificatesEnabled: "mehr.certificates_enabled",
  memberAuthEnabled: "member.auth_enabled",
  memberBotEnabled: "member.bot_enabled",
  accountActivationEnabled: "member.account_activation_enabled",
  referralPointsEnabled: "referral.points_enabled",
} as const;

export type MehrFlags = Record<keyof typeof MEHR_FLAG_KEYS, boolean>;

export const ALL_FLAGS_OFF: MehrFlags = {
  publicEnabled: false,
  activityCreationEnabled: false,
  qrCheckinEnabled: false,
  pointsEnabled: false,
  certificatesEnabled: false,
  memberAuthEnabled: false,
  memberBotEnabled: false,
  accountActivationEnabled: false,
  referralPointsEnabled: false,
};
