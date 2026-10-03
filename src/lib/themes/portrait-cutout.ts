/**
 * POST STUDIO KESIB OLGAN PORTRET — SOF QOIDALAR.
 *
 * Fon olib tashlangan shaffof portret admin panelning Post Studio
 * tizimida ALLAQACHON yasalgan va `candidate-post-assets` bucketida
 * saqlanadi (`candidate_social_posts.portrait_processed_url`). Sayt
 * uni QAYTA YASAMAYDI — faqat tayyorini topib ko'rsatadi.
 *
 * Bu modul faqat qaror qiladi: qaysi qator yaroqli, portret hali
 * dolzarbmi, o'lchami qancha. So'rov `lib/data/portrait-cutout.ts` da.
 *
 * Hech narsa import qilinmaydi: testlar `@/` taxallusini yecha olmaydi.
 */

export interface PortraitCutout {
  /** Ommaviy URL, `?v=` kesh kaliti bilan — rasm yangilansa URL ham o'zgaradi. */
  url: string;
  width: number | null;
  height: number | null;
}

export interface PortraitCutoutRow {
  portrait_processed_url: unknown;
  portrait_source_url: unknown;
  status: unknown;
  metadata: unknown;
}

const CUTOUT_PATH = "/storage/v1/object/public/candidate-post-assets/";

/**
 * Faqat Supabase ommaviy bucketidagi PNG.
 *
 * `next/image` faqat ruxsat etilgan hostdan rasm oladi; boshqa manzil
 * kelsa (eski yoki qo'lda yozilgan qiymat) sahifa rasm xatosi bilan
 * chiqardi. Shuning uchun shubhali URL umuman ishlatilmaydi.
 */
export function isCutoutUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith(CUTOUT_PATH)
    );
  } catch {
    return false;
  }
}

function withoutQuery(value: string): string {
  return value.split("?")[0];
}

/**
 * Portret hali nomzodning HOZIRGI rasmidanmi.
 *
 * Post Studio manbani `portrait_source_url` ga yozadi. Ikki xil qiymat bor:
 *
 *   - `https://…/candidate-avatars/…` — profil rasmi. Nomzod rasmini
 *     almashtirsa, bu manzil eskiradi va eski portret ko'rsatilmaydi;
 *   - `supabase-storage://candidate-intake-files/…` — ariza rasmi. Profil
 *     rasmi nashrda shu fayldan ko'chirilgan, URL'lar farq qilsa ham surat
 *     bitta. Bunda solishtirib bo'lmaydi, portret ishonchli deb olinadi.
 */
export function isCutoutCurrent(sourceUrl: unknown, avatarUrl: string): boolean {
  if (typeof sourceUrl !== "string" || !/^https?:\/\//i.test(sourceUrl)) return true;
  return withoutQuery(sourceUrl) === withoutQuery(avatarUrl);
}

function dimension(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 10000
    ? value
    : null;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Saqlangan PNG o'lchami — `next/image` nisbatni shundan biladi. */
export function cutoutDimensions(metadata: unknown): { width: number | null; height: number | null } {
  const portrait = record(record(metadata).portrait);
  const bounds = record(portrait.personBounds);
  const width = dimension(portrait.width) ?? dimension(bounds.imageWidth);
  const height = dimension(portrait.height) ?? dimension(bounds.imageHeight);
  return width && height ? { width, height } : { width: null, height: null };
}

/**
 * Yaroqli portretni tanlaydi.
 *
 * PROFIL RASMI YO'Q BO'LSA — PORTRET HAM YO'Q. Nomzod rasmini olib
 * tashlagan bo'lsa, uning ariza suratidan yasalgan portretni ommaviy
 * sahifaga chiqarish uning qaroriga zid bo'lardi.
 *
 * `failed` holatidagi post ham portretga ega bo'lishi mumkin (xato
 * keyingi bosqichda bo'lgan), lekin faol post bo'lsa, o'shanisi afzal.
 * Qatorlar `updated_at` bo'yicha yangisidan keladi deb olinadi.
 */
export function pickPortraitCutout(
  rows: readonly PortraitCutoutRow[],
  avatarUrl: string | null,
): PortraitCutout | null {
  if (!avatarUrl) return null;

  const ordered = [
    ...rows.filter((row) => row.status !== "failed"),
    ...rows.filter((row) => row.status === "failed"),
  ];

  for (const row of ordered) {
    const url = row.portrait_processed_url;
    if (!isCutoutUrl(url)) continue;
    if (!isCutoutCurrent(row.portrait_source_url, avatarUrl)) continue;
    return { url, ...cutoutDimensions(row.metadata) };
  }
  return null;
}
