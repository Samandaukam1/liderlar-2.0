/**
 * POSTGREST 1000 QATOR CHEGARASI — TO'LIQ O'QISH.
 *
 * Production PostgREST har javobni serverda 1000 qatorga qirqadi
 * (`db-max-rows`). `.range(0, 19999)` buni YENGMAYDI: javob jimgina
 * 1000 qator bilan keladi, `content-range` esa `0-999/3160` deydi.
 * Shu sababli katalog kartalarining uchdan ikkisida "0 ball" turardi.
 *
 * Bu funksiya sahifama-sahifa o'qiydi va umumiy sonni (`count`) bilan
 * solishtiradi: server chegarasi 1000 dan kichik bo'lsa ham hech narsa
 * tushib qolmaydi. Ro'yxatni to'liq yig'a olmasa XATO otadi — qirqilgan
 * ro'yxatni to'liq deb qaytarishdan ko'ra yiqilgan yaxshi.
 *
 * Toza modul (I/O yo'q, `@/` import yo'q) — testdan to'g'ridan-to'g'ri
 * chaqiriladi.
 */

export const POSTGREST_MAX_ROWS = 1000;

export type RowsPage<T> = {
  data: T[] | null;
  error: unknown;
  /** `{ count: "exact" }` bilan so'ralganda keladi. */
  count?: number | null;
};

/**
 * `fetchPage(from, to)` — bitta `.range(from, to)` so'rovi. U BARQAROR
 * tartib bilan (`.order("id")` kabi noyob ustun) va `count: "exact"`
 * bilan yuborilishi kerak: tartibsiz sahifalashda qatorlar takrorlanishi
 * yoki tushib qolishi mumkin.
 */
export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<RowsPage<T>>,
  { pageSize = POSTGREST_MAX_ROWS, maxPages = 50 }: { pageSize?: number; maxPages?: number } = {},
): Promise<T[]> {
  const rows: T[] = [];
  let total: number | null = null;

  for (let page = 0; page < maxPages; page++) {
    const from = rows.length;
    const { data, error, count } = await fetchPage(from, from + pageSize - 1);
    if (error) throw error;
    if (page === 0) total = typeof count === "number" ? count : null;

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length === 0) return rows;
    // Umumiy son ma'lum bo'lsa — unga yetguncha; aks holda chala sahifa oxir.
    if (total !== null ? rows.length >= total : batch.length < pageSize) return rows;
  }

  throw new Error(`fetchAllRows: ${maxPages} sahifadan oshdi — ro'yxat to'liq o'qilmadi`);
}
