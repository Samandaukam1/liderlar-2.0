/**
 * Oylik davr kaliti — SOF MODUL.
 *
 * Admin ilovasidagi `periodKey` bilan AYNAN bir xil bo'lishi
 * kerak: cron admin tomonda yozadi, kabinet web tomonda
 * o'qiydi. Kalit mos kelmasa, yaratilgan havola kabinetda
 * jimgina ko'rinmay qolardi.
 *
 * Toshkent vaqti (UTC+5, yozgi vaqtga o'tmaydi): oyning
 * birinchi kuni UTC bilan hisoblansa, 5 soatlik farq tufayli
 * havola o'tgan oyga tushib qolardi.
 */

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export function periodKey(now: Date = new Date()): string {
  const tashkent = new Date(now.getTime() + TASHKENT_OFFSET_MS);
  const month = String(tashkent.getUTCMonth() + 1).padStart(2, "0");
  return `${tashkent.getUTCFullYear()}-${month}`;
}

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

export function periodLabel(key: string): string {
  const [year, month] = key.split("-");
  const index = Number(month) - 1;
  return index >= 0 && index < 12 ? `${MONTHS[index]} ${year}` : key;
}

export type MonthlyLinkStatus = "active" | "used" | "revoked" | "expired";

export interface MonthlyLinkRow {
  period: string;
  periodLabel: string;
  status: MonthlyLinkStatus;
  expiresAt: string | null;
  openedAt: string | null;
  usedAt: string | null;
}

/**
 * Holatni AUTHORITATIV maydonlardan chiqaradi.
 *
 * Alohida "expired" statusi bazada yo'q — muddat `expires_at`
 * da. Uni ustun sifatida saqlash ikkinchi haqiqat manbai
 * yaratardi va ular bir kun kelib kelishmay qolardi.
 */
export function deriveStatus(
  status: string,
  expiresAt: string | null,
  now: Date = new Date(),
): MonthlyLinkStatus {
  if (status === "used") return "used";
  if (status === "revoked") return "revoked";

  if (expiresAt) {
    const expires = new Date(expiresAt);
    if (Number.isFinite(expires.getTime()) && expires <= now) return "expired";
  }

  return "active";
}

export const MONTHLY_STATUS_LABEL: Readonly<Record<MonthlyLinkStatus, string>> = {
  active: "Ochish mumkin",
  used: "Yuborilgan",
  revoked: "Bekor qilingan",
  expired: "Muddati tugagan",
};
