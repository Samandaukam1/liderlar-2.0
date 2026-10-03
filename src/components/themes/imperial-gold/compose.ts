/**
 * IMPERIAL GOLD — KOMPOZITSIYA QOIDALARI (sof modul).
 *
 * Ko'rinish emas, QAROR: ism qanday qatorlarga bo'linadi, reyting qaysi
 * holatda qanday aytiladi, galereyadan nima chiqarib tashlanadi. Alohida
 * modulda, chunki bu qoidalar testlanadi.
 *
 * Hech narsa import qilinmaydi: testlar `@/` taxallusini yecha olmaydi.
 */

/* ========================================================================= *
 * ISM
 * ========================================================================= */

export interface NameLines {
  /** Katta serif qatorlar — familiya va ism. */
  primary: string[];
  /** Kichik kursiv qator — otasining ismi ("… o‘g‘li", "… qizi", "-ovich"). */
  secondary: string | null;
  /** Eng uzun so'z sig'masligi mumkin — o'lchamni kichraytirish belgisi. */
  long: boolean;
}

/**
 * To'liq ismni editorial qatorlarga bo'ladi.
 *
 * Birinchi IKKI so'z katta, qolgani bitta kichik kursiv qator. O'zbek
 * ismlari odatda "Familiya Ism Otasining-ismi qizi/o‘g‘li" tartibida va
 * ota ismini kichik berish nashrlarda qabul qilingan ierarxiya. Matn
 * o'zgarmaydi — faqat qatorlarga taqsimlanadi, `h1` ichida ism to'liq.
 */
export function splitName(fullName: string): NameLines {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const primary = words.slice(0, 2);
  const rest = words.slice(2);
  const longest = primary.reduce((max, word) => Math.max(max, word.length), 0);
  return {
    primary,
    secondary: rest.length > 0 ? rest.join(" ") : null,
    long: longest > 11,
  };
}

/** Rasm umuman yo'q bo'lganda ravoq ichidagi monogramma. */
export function monogram(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

/* ========================================================================= *
 * REYTING — HALOL HOLAT
 * ========================================================================= */

export type RankingView =
  | { kind: "position"; value: string }
  | { kind: "pending" }
  | { kind: "forming" };

/**
 * Standart sahifadagi qoida bilan BIR XIL (§ "halol holat, jimgina 0 emas"):
 *
 *   · o'rin bor va ball > 0 -> "N-o‘rin";
 *   · o'rin hali yo'q       -> "hisoblanmoqda" (keyingi soatlik hisob);
 *   · ball 0                -> "hali shakllanmagan" (nollar orasidagi
 *                              tartib raqami hech narsani anglatmaydi).
 */
export function rankingView(position: number | null, totalScore: number): RankingView {
  if (position === null) return { kind: "pending" };
  if (!(totalScore > 0)) return { kind: "forming" };
  return { kind: "position", value: new Intl.NumberFormat("uz-UZ").format(position) };
}

/** Ball kasr bo'lishi mumkin (ko'rishlardan): 0,07 "0" bo'lib ko'rinmasin. */
export function scoreText(totalScore: number): string {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 }).format(totalScore);
}

/* ========================================================================= *
 * GALEREYA
 * ========================================================================= */

function withoutQuery(value: string): string {
  return value.split("?")[0];
}

/**
 * Hero'dagi portret galereyada TAKRORLANMASIN.
 *
 * Profil rasmi `candidate_media` da ham turadi (`candidate-avatars`
 * bucketi). Hero allaqachon shu suratni (yoki uning fonsiz nusxasini)
 * ko'rsatadi — galereyada yana chiqsa, bitta yuz ikki marta bo'ladi.
 */
export function withoutPortrait<T extends { url: string }>(
  media: readonly T[],
  avatarUrl: string | null,
): T[] {
  if (!avatarUrl) return [...media];
  const avatar = withoutQuery(avatarUrl);
  return media.filter((item) => withoutQuery(item.url) !== avatar);
}

/* ========================================================================= *
 * RAQAMLAR
 * ========================================================================= */

/** Bob raqami: 1 -> "01". */
export function chapterNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

const ROMAN: readonly [number, string][] = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** Biografiya bo'limlari uchun rim raqami (1..39). */
export function roman(value: number): string {
  let rest = Math.max(0, Math.floor(value));
  let out = "";
  for (const [size, glyph] of ROMAN) {
    while (rest >= size) {
      out += glyph;
      rest -= size;
    }
  }
  return out;
}
