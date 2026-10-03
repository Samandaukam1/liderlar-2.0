/**
 * PROFIL RASMLARI — QOIDALAR. SOF MODUL.
 *
 * Hech narsa import qilinmaydi: testlar `@/` taxallusini yecha
 * olmaydi.
 *
 * EGRESS HAQIDA. §7 ishlab chiqarishdagi yuqori Supabase Cached
 * Egress muammosini ta'kidlaydi. Yechim UCH qismdan iborat va
 * ularning ikkitasi shu yerda:
 *
 *   1. `next.config` da uzun kesh muddati — optimizator aslini
 *      qayta-qayta yuklab olmaydi.
 *   2. Yuklashdan OLDIN brauzerda kichraytirish — 8 MB telefon
 *      surati 2000px gacha kichrayadi, ya'ni saqlanadigan ham,
 *      optimizator yuklab oladigan ham kichik bo'ladi.
 *   3. Har yuklash YANGI MANZIL yasaydi — URL o'zgargani uchun
 *      uzun kesh xavfsiz bo'ladi.
 *
 * O'Z DERIVATIV QUVURIMIZ YO'Q: Next optimizatori o'lcham
 * variantlarini o'zi yasaydi va ularni keshlaydi. Qo'lda yasash
 * o'sha ishni takrorlab, saqlash hajmini ikki baravar qilardi.
 */

/* ========================================================================= *
 * TURLAR
 * ========================================================================= */

export const IMAGE_KINDS = ["avatar", "gallery"] as const;
export type ImageKind = (typeof IMAGE_KINDS)[number];

export interface ImageKindRule {
  bucket: string;
  label: string;
  maxBytes: number;
  /** Kichraytirishdan keyingi eng katta tomoni. */
  maxDimension: number;
  /** Shundan kichik rasm qabul qilinmaydi. */
  minDimension: number;
  /** Bu turda nechta rasm bo'lishi mumkin. */
  maxCount: number;
}

export const IMAGE_RULES: Readonly<Record<ImageKind, ImageKindRule>> = {
  avatar: {
    bucket: "candidate-avatars",
    label: "Profil rasmi",
    /*
     * 4 MB — mavjud bucket qoidasi bilan bir xil
     * (`upload-rules.ts`). Kichikroq qilish brauzerda
     * kichraytirilgan faylni rad etish xavfini tug'dirardi.
     */
    maxBytes: 4 * 1024 * 1024,
    maxDimension: 1200,
    /*
     * PORTRET KAMIDA 400px.
     *
     * Kichikroq rasm profil sahifasida cho'zilib, sifatsiz
     * ko'rinardi — §7 "no low-resolution originals rendered huge"
     * deydi.
     */
    minDimension: 400,
    maxCount: 1,
  },
  gallery: {
    bucket: "candidate-gallery",
    label: "Rasmlar",
    maxBytes: 8 * 1024 * 1024,
    maxDimension: 2000,
    minDimension: 600,
    maxCount: 12,
  },
};

/**
 * PROFIL RASMINI ALMASHTIRISH — KUNLIK CHEGARA.
 *
 * Profil rasmi BITTA o'rin: yangisi eskisining o'rnini egallaydi
 * ("Almashtirish"). Shuning uchun uning uchun "o'rin tugadi" tekshiruvi
 * ishlatilmaydi — u bir marta rasm qo'ygan odamni boshqa hech qachon
 * almashtira olmaydigan qilib qo'yardi (eski rasmni o'chirish tugmasi
 * ham yo'q).
 *
 * Eski rasmlar tarix sifatida saqlanadi, ya'ni har almashtirish joy
 * egallaydi. Cheksiz almashtirish xotirani to'ldirish vositasiga
 * aylanmasligi uchun 24 soatda shuncha marta.
 */
export const AVATAR_CHANGES_PER_DAY = 5;

export const AVATAR_LIMIT_TEXT =
  "Profil rasmini bugun ko'p marta almashtirdingiz. Ertaga yana urinib ko'ring.";

/**
 * Qabul qilinadigan turlar.
 *
 * `image/svg+xml` RO'YXATDA YO'Q — ataylab. SVG ichida skript
 * bo'lishi mumkin va u ommaviy sahifada ko'rsatilsa, saqlangan XSS
 * bo'lardi (§58). Mavjud `upload-rules.ts` ham nomzod bucketlariga
 * SVG bermaydi.
 */
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAcceptedMime(value: unknown): boolean {
  return typeof value === "string" && (ACCEPTED_MIME as readonly string[]).includes(value);
}

export function isImageKind(value: unknown): value is ImageKind {
  return typeof value === "string" && Object.hasOwn(IMAGE_RULES, value);
}

/* ========================================================================= *
 * TEKSHIRUV
 * ========================================================================= */

export type ImageProblem =
  | "kind"
  | "mime"
  | "empty"
  | "too_large"
  | "too_small_dimension"
  | "too_many";

export const IMAGE_PROBLEM_TEXT: Record<ImageProblem, string> = {
  kind: "Rasm turi tanlanmagan.",
  mime: "Faqat JPG, PNG yoki WebP rasm yuklash mumkin.",
  empty: "Fayl bo'sh.",
  too_large: "Rasm juda katta.",
  too_small_dimension: "Rasm o'lchami juda kichik.",
  too_many: "Bu bo'limda rasm o'rni tugadi. Avval birini o'chiring.",
};

export interface ImageCheck {
  ok: boolean;
  problem?: ImageProblem;
  /** Foydalanuvchiga ko'rsatiladigan aniq matn. */
  error?: string;
}

/**
 * Fayl metama'lumotini tekshiradi.
 *
 * O'LCHAM (piksel) BU YERDA TEKSHIRILMAYDI: u faylning ichida va
 * faqat rasmni o'qigandan keyin bilinadi. Serverda imzolash paytida
 * bizda faqat MIME va bayt soni bor.
 *
 * Piksel tekshiruvi brauzerda, yuklashdan oldin bajariladi
 * (`checkDimensions`) — bu ham tezroq, ham foydali: odam katta
 * faylni yuklab bo'lgandan keyin rad etilmaydi.
 */
export function checkImageMeta(input: {
  kind: unknown;
  mimeType: unknown;
  size: unknown;
  /** Shu turda allaqachon nechta rasm bor. */
  existingCount: number;
}): ImageCheck {
  if (!isImageKind(input.kind)) {
    return { ok: false, problem: "kind", error: IMAGE_PROBLEM_TEXT.kind };
  }
  const rule = IMAGE_RULES[input.kind];

  if (!isAcceptedMime(input.mimeType)) {
    return { ok: false, problem: "mime", error: IMAGE_PROBLEM_TEXT.mime };
  }

  const size = Number(input.size);
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, problem: "empty", error: IMAGE_PROBLEM_TEXT.empty };
  }
  if (size > rule.maxBytes) {
    return {
      ok: false,
      problem: "too_large",
      error: `${rule.label}: ${Math.round(rule.maxBytes / 1024 / 1024)} MB dan oshmasin.`,
    };
  }

  /*
   * O'RIN SONI SERVERDA TEKSHIRILADI.
   *
   * Brauzerdagi tekshiruv faqat qulaylik: ikki oyna ochib, ikkisidan
   * ham yuklash mumkin bo'lardi.
   */
  if (input.existingCount >= rule.maxCount) {
    return { ok: false, problem: "too_many", error: IMAGE_PROBLEM_TEXT.too_many };
  }

  return { ok: true };
}

/**
 * Piksel o'lchamini tekshiradi.
 *
 * Brauzerda chaqiriladi: u yerda rasm allaqachon o'qilgan va
 * o'lchami ma'lum.
 */
export function checkDimensions(
  kind: ImageKind,
  width: number,
  height: number,
): ImageCheck {
  const rule = IMAGE_RULES[kind];
  const smallest = Math.min(width, height);

  if (!Number.isFinite(smallest) || smallest <= 0) {
    return { ok: false, problem: "empty", error: IMAGE_PROBLEM_TEXT.empty };
  }
  if (smallest < rule.minDimension) {
    return {
      ok: false,
      problem: "too_small_dimension",
      error: `${rule.label}: kamida ${rule.minDimension}×${rule.minDimension} piksel bo'lsin.`,
    };
  }
  return { ok: true };
}

/* ========================================================================= *
 * KICHRAYTIRISH HISOBI
 * ========================================================================= */

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Kichraytirishdan keyingi o'lchamni hisoblaydi.
 *
 * NISBAT SAQLANADI va rasm KATTALASHTIRILMAYDI: kichik rasmni
 * cho'zish sifatni oshirmaydi, faqat fayl hajmini oshiradi.
 */
export function scaledSize(kind: ImageKind, source: Dimensions): Dimensions {
  const max = IMAGE_RULES[kind].maxDimension;
  const longest = Math.max(source.width, source.height);

  if (longest <= max) return { width: source.width, height: source.height };

  const ratio = max / longest;
  return {
    // `round` emas, `floor`: yarim piksel bo'lmaydi va natija max dan oshmaydi.
    width: Math.max(1, Math.floor(source.width * ratio)),
    height: Math.max(1, Math.floor(source.height * ratio)),
  };
}

/* ========================================================================= *
 * ALT MATN
 * ========================================================================= */

export const ALT_MAX_LENGTH = 200;

/**
 * Alt matnni tozalaydi (§7, §52).
 *
 * Bo'sh bo'lishi MUMKIN: majburiy qilish odamni ma'nosiz matn
 * yozishga undaydi ("rasm", "foto") va bu ekran o'quvchisi uchun
 * jim qolishdan ham yomon.
 */
export function cleanAltText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed === "") return null;
  /*
   * BELGI BO'YICHA KESILADI, UTF-16 BIRLIGI BO'YICHA EMAS.
   *
   * `slice(0, 200)` emojini yarmidan kesib, juftsiz surrogat qoldirardi —
   * baza bunday matnni rad etadi va saqlash "sababsiz" yiqilardi.
   * Bazadagi CHECK ham `char_length` (belgi soni) bilan o'lchaydi.
   */
  const chars = Array.from(trimmed);
  if (chars.length <= ALT_MAX_LENGTH) return trimmed;
  return chars.slice(0, ALT_MAX_LENGTH).join("").trimEnd();
}
