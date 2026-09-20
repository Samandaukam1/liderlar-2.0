/**
 * MEHR 365+ brend ranglari — SOF MODUL.
 *
 * MUHIM: bu ranglar FAQAT /mehr365 ichida amal qiladi.
 *
 * Ular global CSS o'zgaruvchilariga yozilmaydi — aks holda
 * butun Liderlar ensiklopediyasi rangini o'zgartirib yuborardi.
 * Buning o'rniga `MehrShell` ularni o'z konteyneriga qo'yadi
 * va tashqarida hech nima o'zgarmaydi.
 *
 * Qiymatlar rasmiy logotipdagi oqimlardan olingan: yuqori
 * chapda ko'k/moviy, o'ngda yashil, pastda to'q sariq/sariq.
 */

export const MEHR_COLORS = {
  blue: "#1C8FE8",
  cyan: "#22C1E4",
  green: "#22B573",
  lime: "#8DD13F",
  orange: "#F5871F",
  amber: "#FBB13C",

  ink: "#0F2B3D",
  inkSoft: "#5A7183",
  surface: "#FFFFFF",
  surfaceSoft: "#F6FAFC",
  border: "rgba(15, 43, 61, 0.10)",
} as const;

/**
 * Logotipdagi oqimni takrorlaydigan gradient.
 *
 * Faqat URG'U uchun — katta yuzalarga yoyilmaydi. Butun sahifani
 * gradientga bo'yash "arzon shablon" taassurotini beradi va
 * matnni o'qishni qiyinlashtiradi.
 */
export const MEHR_GRADIENT =
  `linear-gradient(120deg, ${MEHR_COLORS.blue} 0%, ${MEHR_COLORS.cyan} 22%, ` +
  `${MEHR_COLORS.green} 48%, ${MEHR_COLORS.lime} 66%, ${MEHR_COLORS.amber} 84%, ${MEHR_COLORS.orange} 100%)`;

/** MEHR bo'limining ichki navigatsiyasi. */
export const MEHR_NAV = [
  { href: "/mehr365", label: "Bosh sahifa" },
  { href: "/mehr365/ezgulik-ishlari", label: "Ezgulik ishlari" },
  { href: "/mehr365/volontyorlar", label: "Volontyorlar" },
  { href: "/mehr365/reyting", label: "Reyting" },
  { href: "/mehr365/haqida", label: "MEHR haqida" },
] as const;

/**
 * MEHR atamalari — BIR XIL ISHLATILADI.
 *
 * Bir joyda "ishtirokchi", boshqasida "qatnashuvchi" deyilsa,
 * foydalanuvchi ularni boshqa-boshqa narsa deb o'ylaydi.
 */
export const MEHR_TERMS = {
  participant: "Ishtirokchi",
  coOrganizer: "Hamtashkilotchi",
  organizer: "Tashkilotchi",
  activity: "Ezgulik ishi",
  activities: "Ezgulik ishlari",
  volunteer: "Volontyor",
  points: "Ball",
  certificate: "Sertifikat",
  ranking: "Reyting",
} as const;

export const MEHR_ROLE_LABEL: Readonly<Record<string, string>> = {
  participant: MEHR_TERMS.participant,
  co_organizer: MEHR_TERMS.coOrganizer,
  organizer: MEHR_TERMS.organizer,
};
