/**
 * JURNALGA KIRISH QOIDALARI — SOF MODUL.
 *
 * §33 jurnal obunasini VIP huquqi sifatida talab qiladi va UCH
 * TUSHUNCHANI AJRATISHNI aytadi: raqamli kirish, obuna huquqi,
 * jismoniy yetkazib berish.
 *
 * BU LOYIHADA FAQAT RAQAMLI KIRISH BOR. Jismoniy yetkazib berish
 * amalga oshirilmagan va u haqda hech narsa aytilmaydi — §33
 * "do NOT falsely claim physical delivery" deydi.
 *
 * Hech narsa import qilinmaydi: testlar `@/` taxallusini yecha
 * olmaydi.
 */

export type JournalAccess =
  /** Hamma ko'rishi mumkin — flag o'chiq, ya'ni avvalgi tartib. */
  | "open"
  /** Huquq bor — yuklab olish mumkin. */
  | "granted"
  /** Huquq yo'q — obuna taklif qilinadi. */
  | "locked";

export interface AccessInput {
  /** `vip.magazine_enabled` flagi. */
  gatingEnabled: boolean;
  /** Foydalanuvchida `magazine.subscription` huquqi bormi. */
  hasEntitlement: boolean;
}

/**
 * Jurnal PDF'iga kirish holatini aniqlaydi.
 *
 * FLAG O'CHIQ BO'LSA — "open".
 *
 * Bu ataylab: jurnal sonlari hozirgacha TEKIN berilgan va ularni
 * to'satdan yopish mavjud o'quvchilarni yo'qotardi. Yopish ongli
 * tijoriy qaror bo'lishi kerak, deploy bilan birga o'z-o'zidan
 * emas (§41, §67).
 */
export function journalAccess(input: AccessInput): JournalAccess {
  if (!input.gatingEnabled) return "open";
  return input.hasEntitlement ? "granted" : "locked";
}

export function canDownload(access: JournalAccess): boolean {
  return access === "open" || access === "granted";
}

/* ========================================================================= *
 * MATNLAR
 * ========================================================================= */

export const ACCESS_TEXT: Record<JournalAccess, string> = {
  open: "PDF'ni yuklab olish",
  granted: "PDF'ni yuklab olish",
  locked: "Liderlar VIP obunasi bilan ochiladi",
};

/**
 * Obuna holati matni — VIP kabinetida ko'rsatiladi.
 *
 * JISMONIY YETKAZIB BERISH HAQIDA HECH NARSA AYTILMAYDI (§33).
 * "Jurnalni pochta orqali olasiz" degan gap bajarilmaydigan va'da
 * bo'lardi.
 */
export function subscriptionStatusText(hasEntitlement: boolean): string {
  return hasEntitlement
    ? "Jurnal sonlarini raqamli ko'rinishda yuklab olishingiz mumkin."
    : "Jurnalning raqamli nusxasi Liderlar VIP obunasi bilan ochiladi.";
}
