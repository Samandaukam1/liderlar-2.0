/**
 * KATALOG TARTIBI — TOZA QOIDALAR (I/O yo'q, `@/` import yo'q).
 *
 * "Reyting" saralashi (standart) bazada bajarilmaydi: ball `ranking_scores`
 * da, ism esa `candidates` da, ustiga ballari teng nomzodlar ism bo'yicha
 * `localeCompare("uz")` bilan tartiblanadi — Postgres collation'i buni xuddi
 * shunday qilmaydi. Shuning uchun tartib avvalgidek xotirada quriladi, lekin
 * endi YENGIL qatorlardan (`id`, `full_name`) va natija keshlanadi; sahifaga
 * faqat 12 ta karta so'raladi.
 */

export type CatalogOrderRow = { id: string; full_name: string };

/**
 * Avvalgi `items.sort(...)` bilan aynan bir xil qoida: ball kamayishi,
 * teng bo'lsa ism (`uz`). `Array.prototype.sort` barqaror, ya'ni ism ham
 * teng bo'lsa kirish tartibi (yangilari oldinda) saqlanadi. Reyting qatori
 * yo'q nomzodning bali 0 — bu HALOL qiymat, taxmin emas.
 */
export function orderByRanking(
  rows: readonly CatalogOrderRow[],
  scores: ReadonlyMap<string, number>,
): string[] {
  return rows
    .map((row) => ({ ...row, score: scores.get(row.id) ?? 0 }))
    .sort((a, b) => b.score - a.score || a.full_name.localeCompare(b.full_name, "uz"))
    .map((row) => row.id);
}

/** 1 dan boshlanadigan sahifa uchun `.range(from, to)` chegaralari. */
export function pageRange(page: number, perPage: number) {
  const from = (Math.max(1, page) - 1) * perPage;
  return { from, to: from + perPage - 1 };
}

export function totalPagesFor(total: number, perPage: number) {
  return Math.max(1, Math.ceil(total / perPage));
}
