/**
 * PREMIUM DIZAYNLAR — KOMPOZITSIYA QOIDALARI (sof modul).
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
 *   · qator yo'q            -> "hisoblanmoqda" (keyingi soatlik hisob);
 *   · qator bor, ball 0     -> "hali shakllanmagan" (nollar orasidagi
 *                              tartib raqami hech narsani anglatmaydi).
 */
export function rankingView(
  position: number | null,
  totalScore: number,
  /**
   * Reyting qatori umuman bormi.
   *
   * `position === null` ikki xil ma'noga ega va ular ARALASHTIRILMASLIGI
   * kerak: qator yo'q — hisob hali o'tmagan ("hisoblanmoqda"); qator bor,
   * lekin ball 0 — hisobga kirgan, o'rin hali ma'nosiz ("shakllanmagan").
   * Standart `false` — eski chaqiruvlar xatti-harakatini saqlaydi.
   */
  hasRow = false,
): RankingView {
  if (position === null) return hasRow ? { kind: "forming" } : { kind: "pending" };
  if (!(totalScore > 0)) return { kind: "forming" };
  return { kind: "position", value: new Intl.NumberFormat("uz-UZ").format(position) };
}

/**
 * Ball matni — BITTA KASR XONA.
 *
 * Maxraj 100 ("/ 100 ball"), shuning uchun bir xona o'qishga qulay.
 * Kasrni butunlab tashlasak, ko'rishlardan yig'ilgan 0,4 "0" bo'lib
 * ko'rinardi; nol esa "0.0" bo'lib ko'rinadi — ya'ni ball yo'qligi
 * ham RAQAM bilan aytiladi, bo'sh joy bilan emas.
 */
export function scoreText(totalScore: number): string {
  return (Number.isFinite(totalScore) ? totalScore : 0).toFixed(1);
}

/* ------------------------------------------------------------------ *
 * UMUMIY REYTING — BARCHA DIZAYNLAR UCHUN BIR XIL MATN
 * ------------------------------------------------------------------ */

export interface RankingDisplay {
  /**
   * Ball. HAR DOIM bor — `0` ham haqiqiy qiymat va "0.0" bo'lib
   * ko'rsatiladi. Nolni yashirish nomzodga "reyting yo'q" degan
   * yolg'on taassurot berardi, holbuki u hisobda turadi.
   */
  score: string;
  /** Maxraj: ball 100 ballik shkalada. */
  scoreUnit: string;
  /** "#24" — o'rin bor va ball > 0 bo'lganda. */
  rank: string | null;
  /** O'rin ko'rsatilmasa — SABABI, jim bo'shliq emas (§22). */
  rankNote: string | null;
  /** Yorliqlar — har dizayn o'zicha yozmasin. */
  label: string;
  rankLabel: string;
}

export const RANKING_SCORE_UNIT = "/ 100 ball";

/**
 * Reyting blokining matni — O'NTA DIZAYN UCHUN BITTA.
 *
 * NEGA UMUMIY MODULDA: har dizayn bu matnni o'zicha yozsa, biri nolni
 * yashirib qo'yardi, boshqasi ball 0 bo'lganda ham o'rin ko'rsatardi
 * (nollar orasidagi tartib raqami hech narsani anglatmaydi). Qoida
 * `rankingView` da va u testlangan — bu funksiya faqat uni MATNGA
 * aylantiradi.
 */
export function rankingDisplay(
  position: number | null,
  totalScore: number,
  hasRow: boolean,
): RankingDisplay {
  const view = rankingView(position, totalScore, hasRow);

  return {
    score: scoreText(totalScore),
    scoreUnit: RANKING_SCORE_UNIT,
    rank: view.kind === "position" ? `#${view.value}` : null,
    rankNote:
      view.kind === "position"
        ? null
        : view.kind === "pending"
          ? "Reyting hisoblanmoqda"
          : "O‘rin hali shakllanmagan",
    label: "Umumiy reyting",
    rankLabel: "Umumiy reytingda",
  };
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
