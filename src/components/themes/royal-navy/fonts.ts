import { Archivo, Geist, Geist_Mono } from "next/font/google";

/**
 * ROYAL NAVY TIPOGRAFIYASI — uch rol, uch shrift.
 *
 *   Archivo (kengaytirilgan, wdth 125) — ISM, sarlavhalar va katta raqamlar.
 *                    Keng, qat'iy grotesk: aerokosmik va mudofaa
 *                    brendlari tili — jiddiy va zamonaviy, bezaksiz.
 *   Geist          — asosiy matn, tugma, rol. Toza, neytral, ekran uchun.
 *   Geist Mono     — yorliq, sana, indeks. Texnik "panel" ritmi.
 *
 * Saytning o'zi Manrope va Cormorant ishlatadi — bu dizayn ataylab
 * ulardan boshqa, ya'ni sahifa umumiy saytdan darhol ajralib turadi.
 * Faqat shu modulda e'lon qilingan: boshqa dizayndagi sahifalar bu
 * fayllarni yuklamaydi.
 */
export const rnDisplay = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--rn-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const rnSans = Geist({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--rn-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const rnMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--rn-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

