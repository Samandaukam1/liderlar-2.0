import { Playfair_Display, Space_Grotesk, Unbounded } from "next/font/google";

/**
 * EMERALD LEGACY TIPOGRAFIYASI — uch rol, uch shrift.
 *
 *   Unbounded (800)   — ISM va bo'lim sarlavhalari. Keng, geometrik va
 *                       o'ta qalin: ism sahifaning me'moriy elementi.
 *   Playfair Display  — iqtibos va kirish matni (editorial urg'u).
 *   Space Grotesk     — yorliq, raqam, tugma va asosiy matn.
 *
 * Uchalasi ham `latin-ext` ni qamraydi, ya'ni oʻ/gʻ harflari boshqa
 * shriftga tushib ketmaydi. Faqat shu dizayn modulida e'lon qilingan —
 * boshqa dizayndagi sahifalar bu fayllarni yuklamaydi.
 */
export const elDisplay = Unbounded({
  subsets: ["latin"],
  weight: "variable",
  variable: "--el-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const elSerif = Playfair_Display({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--el-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const elSans = Space_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  variable: "--el-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
