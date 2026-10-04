/**
 * MUHARRIR TUGMALARI — MATNNI O'ZGARTIRISH. SOF MODUL.
 *
 * Har funksiya joriy matn va tanlov oladi, YANGI matn va yangi tanlovni
 * qaytaradi. Brauzerga tegmaydi — shuning uchun testlanadi va tugma
 * xatti-harakati (masalan, ikkinchi bosish belgini olib tashlaydi)
 * kafolatlanadi.
 *
 * Belgilar `rich-text.ts` dagi tahlilchi tushunadigan shaklda.
 *
 * Hech narsa import qilinmaydi: testlar `@/` taxallusini yecha olmaydi.
 */

export interface TextSelection {
  start: number;
  end: number;
}

export interface EditResult {
  value: string;
  selection: TextSelection;
}

/* ========================================================================= *
 * QATOR ICHIDA: QALIN, KURSIV
 * ========================================================================= */

/**
 * Tanlangan matnni belgi bilan o'raydi yoki o'ramni olib tashlaydi.
 *
 *   · tanlov bo'sh — namuna matn qo'yiladi va u tanlanadi, odam
 *     darhol ustidan yozadi;
 *   · tanlov allaqachon o'ralgan — o'ram olinadi (ikkinchi bosish
 *     "o'chirish" bo'lishi kutiladi);
 *   · chetdagi bo'sh joy o'ramdan TASHQARIDA qoladi: "**so'z **"
 *     tahlilchida qalin bo'lmasdi.
 */
export function toggleWrap(
  value: string,
  selection: TextSelection,
  marker: "**" | "*",
  placeholder: string,
): EditResult {
  const { start, end } = normalize(value, selection);
  const size = marker.length;

  // Allaqachon o'ralgan: belgilar tanlov tashqarisida turibdi.
  const before = value.slice(start - size, start);
  const after = value.slice(end, end + size);
  const outerBold = marker === "*" && value.slice(start - 2, start) === "**" && value.slice(end, end + 2) === "**";
  if (start !== end && before === marker && after === marker && !outerBold) {
    return {
      value: value.slice(0, start - size) + value.slice(start, end) + value.slice(end + size),
      selection: { start: start - size, end: end - size },
    };
  }

  if (start === end) {
    const next = value.slice(0, start) + marker + placeholder + marker + value.slice(end);
    return {
      value: next,
      selection: { start: start + size, end: start + size + placeholder.length },
    };
  }

  const selected = value.slice(start, end);
  const lead = selected.length - selected.trimStart().length;
  const trail = selected.length - selected.trimEnd().length;
  const core = selected.trim();

  if (core === "") {
    return { value, selection: { start, end } };
  }

  const wrapped = selected.slice(0, lead) + marker + core + marker + selected.slice(selected.length - trail);
  return {
    value: value.slice(0, start) + wrapped + value.slice(end),
    selection: { start: start + lead + size, end: start + lead + size + core.length },
  };
}

/* ========================================================================= *
 * HAVOLA
 * ========================================================================= */

/**
 * `[matn](url)` qo'yadi.
 *
 * URL bu yerda TEKSHIRILMAYDI — chaqiruvchi `isSafeLink` bilan
 * tekshiradi va xatoni odamga aytadi. Bu funksiya faqat matnni
 * yasaydi; xavfsizlikning yakuniy chizig'i esa tahlilchida.
 *
 * Matndagi `[` va `]` qochiriladi: aks holda havola chegarasi
 * buzilardi.
 */
export function insertLink(
  value: string,
  selection: TextSelection,
  url: string,
  fallbackText: string,
): EditResult {
  const { start, end } = normalize(value, selection);
  const text = (value.slice(start, end).trim() || fallbackText).replace(/([[\]\\])/g, "\\$1");
  const markup = `[${text}](${url.trim()})`;
  return {
    value: value.slice(0, start) + markup + value.slice(end),
    selection: { start: start + 1, end: start + 1 + text.length },
  };
}

/* ========================================================================= *
 * QATOR BOSHIDA: IQTIBOS, SARLAVHA, RO'YXAT
 * ========================================================================= */

export type LinePrefix = "> " | "## " | "- ";

/** Qator boshidagi har qanday blok belgisi. Almashtirishda olib tashlanadi. */
const ANY_PREFIX = /^(>\s?|#{1,3}\s+|[-•]\s+)/;

/**
 * Tanlov tegadigan BARCHA qatorlarga belgi qo'yadi yoki olib tashlaydi.
 *
 *   · hamma bo'sh bo'lmagan qatorda shu belgi bor — olinadi;
 *   · aks holda qo'yiladi, boshqa blok belgisi esa ALMASHTIRILADI
 *     ("- band" -> "> band"), ustma-ust "> - " bo'lib qolmaydi.
 *
 * Bo'sh qatorga belgi qo'yilmaydi: u bloklarni ajratib turadi.
 */
export function toggleLinePrefix(
  value: string,
  selection: TextSelection,
  prefix: LinePrefix,
): EditResult {
  const { start, end } = normalize(value, selection);

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const endProbe = end > start && value[end - 1] === "\n" ? end - 1 : end;
  const nextBreak = value.indexOf("\n", endProbe);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;

  const lines = value.slice(lineStart, lineEnd).split("\n");
  const content = lines.filter((line) => line.trim() !== "");
  const allHave = content.length > 0 && content.every((line) => line.startsWith(prefix));

  // Bo'sh joyda bosilgan tugma — belgi qo'yiladi va kursor undan keyin.
  if (content.length === 0) {
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    const caret = lineStart + prefix.length;
    return { value: next, selection: { start: caret, end: caret } };
  }

  const changed = lines.map((line) => {
    if (line.trim() === "") return line;
    if (allHave) return line.slice(prefix.length);
    return prefix + line.replace(ANY_PREFIX, "");
  });

  const replacement = changed.join("\n");
  return {
    value: value.slice(0, lineStart) + replacement + value.slice(lineEnd),
    selection: { start: lineStart, end: lineStart + replacement.length },
  };
}

/* ========================================================================= *
 * YORDAMCHI
 * ========================================================================= */

function normalize(value: string, selection: TextSelection): TextSelection {
  const clamp = (n: number) => Math.max(0, Math.min(value.length, n));
  const a = clamp(selection.start);
  const b = clamp(selection.end);
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}
