/**
 * LIDERLAR ONLINE BANNERI — O'LCHAM QOIDALARI. SOF MODUL.
 *
 * NISBAT 16:9 — o'ylab topilgan emas: maqola sahifasidagi banner va
 * kartochkalar `aspect-video` (16:9) bilan, `object-cover` da
 * ko'rsatiladi. Boshqa nisbatdagi rasm qirqiladi (cho'zilmaydi).
 *
 * Hech narsa import qilmaydi — testlar `@/` ni ko'rmaydi.
 */

export const HERO_RATIO = { width: 16, height: 9 } as const;
export const HERO_RECOMMENDED = { width: 1600, height: 900 } as const;
export const HERO_MIN = { width: 1200, height: 675 } as const;
/** `gallery` yuklash qoidasi bilan bir xil (image-rules.ts). */
export const HERO_MAX_BYTES = 8 * 1024 * 1024;
export const HERO_FORMATS = ["JPG", "PNG", "WebP"] as const;

export const HERO_RECOMMENDATION_TEXT =
  `Tavsiya etilgan banner o‘lchami: ${HERO_RECOMMENDED.width} × ${HERO_RECOMMENDED.height} px (16:9). ` +
  `Kamida ${HERO_MIN.width} × ${HERO_MIN.height} px · ${HERO_FORMATS.join(", ")} · ko‘pi bilan ${HERO_MAX_BYTES / 1024 / 1024} MB.`;

export type HeroCheck =
  | { ok: true; warning: string | null }
  | { ok: false; error: string };

/**
 * Rasm o'lchamini tekshiradi.
 *
 * Kichik rasm — RAD (katta ekranda xira chiqadi). Nisbat 16:9 dan
 * farq qilsa — faqat OGOHLANTIRISH: rasm qirqiladi, cho'zilmaydi.
 */
export function checkHeroDimensions(width: number, height: number): HeroCheck {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { ok: false, error: "Rasm o‘lchamini aniqlab bo‘lmadi." };
  }
  if (width < HERO_MIN.width || height < HERO_MIN.height) {
    return {
      ok: false,
      error: `Rasm juda kichik (${width} × ${height}). Kamida ${HERO_MIN.width} × ${HERO_MIN.height} px kerak.`,
    };
  }
  const ratio = width / height;
  const target = HERO_RATIO.width / HERO_RATIO.height;
  const off = Math.abs(ratio - target) / target;
  return {
    ok: true,
    warning:
      off > 0.08
        ? "Rasm 16:9 emas — maqola sahifasida chetlari qirqiladi. Previewni tekshiring."
        : null,
  };
}

/** Masonry kartochka nisbati: o'lcham ma'lum bo'lmasa — 16:9. */
export function heroAspect(width: number | null, height: number | null): number {
  if (!width || !height || width <= 0 || height <= 0) return HERO_RATIO.width / HERO_RATIO.height;
  // Juda cho'ziq rasmlar lentani buzmasin: 1:2 .. 2.4:1 oralig'ida.
  return Math.min(2.4, Math.max(0.5, width / height));
}

/* ========================================================================= *
 * BANNER MANZILI
 * ========================================================================= */

/**
 * Banner manzili bizning storage'imizdami.
 *
 * YAGONA QOIDA ikki joy uchun:
 *
 *   · yozish (`setArticleHero`) — tashqi rasm Liderlar Online'ga
 *     qo'yilmasin: u keyin o'zgarishi yoki yo'qolishi mumkin;
 *   · o'qish (biografik sahifa) — `next/image` faqat sozlangan
 *     hostlarni qabul qiladi va begona host BUTUN SAHIFANI yiqitadi.
 *     Shuning uchun bazadan kelgan qiymat ham ko'rsatishdan oldin
 *     shu qoidadan o'tadi: eski yoki paneldan kiritilgan noto'g'ri
 *     manzil biografiyani "Nimadir xato ketdi" ga aylantirmasin.
 *
 * `next.config.ts` dagi `*.supabase.co/storage/v1/object/public/**`
 * naqshi bilan mos.
 */
export function isStoredHeroUrl(value: string | null | undefined): value is string {
  return (
    typeof value === "string" &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//.test(value)
  );
}
