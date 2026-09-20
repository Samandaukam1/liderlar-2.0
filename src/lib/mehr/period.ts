/**
 * Davr kaliti — SOF MODUL.
 *
 * Jamlanma SQL tomonda 'Asia/Tashkent' bilan yoziladi
 * (`recompute_point_aggregates`). Bu yerda UTC ishlatilsa,
 * oyning birinchi kunida so'rov bo'sh ro'yxat qaytarardi va
 * reyting "yo'qolgandek" ko'rinardi.
 */

export type RankingPeriod = "all" | "year" | "month";

/** Toshkent UTC+5, yozgi vaqtga o'tmaydi. */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export function periodKeyFor(period: RankingPeriod, now: Date = new Date()): string {
  if (period === "all") return "all";

  const tashkent = new Date(now.getTime() + TASHKENT_OFFSET_MS);
  const year = tashkent.getUTCFullYear();
  if (period === "year") return String(year);

  return `${year}-${String(tashkent.getUTCMonth() + 1).padStart(2, "0")}`;
}
