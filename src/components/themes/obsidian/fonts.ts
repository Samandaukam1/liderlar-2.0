import { Anton, Instrument_Serif, Inter_Tight } from "next/font/google";

/**
 * OBSIDIAN TIPOGRAFIYASI — uch rol, uch shrift.
 *
 *   Anton            — ulkan ism va bo'lim sarlavhalari. Qalin, tor
 *                      neo-grotesk: plakat va moda jurnali muqovasi tili.
 *   Inter Tight      — interfeys va matn. Zich, neytral, Anton bilan
 *                      ritmda — sarlavha baqiradi, matn tinch gapiradi.
 *   Instrument Serif — faqat iqtibos (kursiv). Yagona "inson ovozi".
 *
 * Faqat shu modulda e'lon qilingan: boshqa dizayndagi sahifalar bu
 * fayllarni yuklamaydi.
 */
export const obDisplay = Anton({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--ob-display",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

export const obSans = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--ob-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const obSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--ob-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
