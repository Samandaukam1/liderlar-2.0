/**
 * Davr kaliti — SOF MODUL.
 *
 * Jamlanma SQL tomonda 'Asia/Tashkent' bilan yoziladi
 * (`recompute_point_aggregates`). Bu yerda UTC ishlatilsa,
 * oyning birinchi kunida so'rov bo'sh ro'yxat qaytarardi va
 * reyting "yo'qolgandek" ko'rinardi.
 */

/*
 * Tip `public-types.ts` da — u mijoz tomonida ham ishlatiladi.
 * Bu yerda qayta e'lon qilsak, ikkita bir xil nomli, lekin
 * texnik jihatdan boshqa tip paydo bo'lardi.
 */
import type { RankingPeriod } from "./public-types";

export type { RankingPeriod };

/** Toshkent UTC+5, yozgi vaqtga o'tmaydi. */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export function periodKeyFor(period: RankingPeriod, now: Date = new Date()): string {
  if (period === "all") return "all";

  const tashkent = new Date(now.getTime() + TASHKENT_OFFSET_MS);
  const year = tashkent.getUTCFullYear();
  if (period === "year") return String(year);

  return `${year}-${String(tashkent.getUTCMonth() + 1).padStart(2, "0")}`;
}
