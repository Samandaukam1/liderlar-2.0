import { Bodoni_Moda, DM_Sans, Oswald } from "next/font/google";

/**
 * IVORY EDITORIAL TIPOGRAFIYASI — uch rol, uch shrift.
 *
 *   Bodoni Moda — ism, bo'lim sarlavhalari va iqtiboslar. Yuqori
 *                 kontrastli Didone: moda va jurnal muqovalarining tili.
 *   DM Sans     — matn, navigatsiya, metama'lumot, statistika.
 *   Oswald      — muqova ortidagi ULKAN kesilgan harflar (ichida surat).
 *
 * Faqat shu modulda e'lon qilingan: boshqa dizayndagi sahifalar bu
 * fayllarni yuklamaydi.
 */
export const ivSerif = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--iv-serif",
  display: "swap",
  fallback: ["Didot", "Georgia", "serif"],
});

export const ivSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--iv-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const ivGiant = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--iv-giant",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});
