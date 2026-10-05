import { Figtree, Sora } from "next/font/google";

/**
 * AURORA GLASS TIPOGRAFIYASI — ikki rol, ikki shrift.
 *
 *   Sora    — ism, sarlavhalar va raqamlar. Geometrik, keng ochiq
 *             shakllar: havodor va zamonaviy, lekin jiddiy.
 *   Figtree — matn, navigatsiya, metama'lumot. Yumshoq va juda o'qiluvchan.
 *
 * Faqat shu modulda e'lon qilingan: boshqa dizayndagi sahifalar bu
 * fayllarni yuklamaydi.
 */
export const auDisplay = Sora({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--au-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const auSans = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--au-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
