import { Jost, Noto_Serif_Display } from "next/font/google";

/**
 * IMPERIAL GOLD TIPOGRAFIYASI.
 *
 * Juftlik ATAYLAB: yuqori kontrastli editorial serif (Didone ruhida) va
 * geometrik sans — hashamatli nashrlarning klassik "Didot + Futura"
 * juftligi. Ikkalasi ham lotin, kengaytirilgan lotin va kirill
 * harflarini qamraydi, ya'ni o‘/g‘ va kirillcha matn boshqa shriftga
 * tushib qolmaydi.
 *
 *   Noto Serif Display — ism, bob sarlavhalari, iqtiboslar, raqamlar.
 *   Jost               — navigatsiya, tugmalar, metama'lumot, matn.
 *
 * Shriftlar FAQAT shu dizayn modulida e'lon qilingan: modul dinamik
 * yuklanadi, ya'ni boshqa dizayndagi sahifalar bu fayllarni yuklamaydi.
 *
 * `subsets: ["latin"]` — faqat shu qism OLDINDAN yuklanadi (preload).
 * Boshqa qismlar (kirill, kengaytirilgan lotin) ham ulangan, lekin
 * matnda uchraganda yuklanadi.
 */

export const igSerif = Noto_Serif_Display({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--ig-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const igSans = Jost({
  subsets: ["latin"],
  weight: "variable",
  variable: "--ig-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
