import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * SILVER EXECUTIVE TIPOGRAFIYASI — bitta kuchli zamonaviy sans oilasi.
 *
 * Plus Jakarta Sans: geometrik, korporativ, sarlavhada qat'iy (700–800),
 * matnda o'qishli (400), metama'lumotda o'rta (500–600). Bitta oila —
 * ierarxiya og'irlik, o'lcham va harf oralig'i bilan quriladi.
 * Faqat shu dizayn modulida e'lon qilingan (dinamik yuklanadi).
 */
export const seSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--se-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
