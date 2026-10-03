/**
 * DIZAYNLAR UCHUN UMUMIY MA'LUMOT SHAKLLARI.
 *
 * §11: barcha dizaynlar BIR XIL ma'lumotni oladi. Ma'lumotni
 * shaklga keltirish ham bir xil bo'lishi kerak — aks holda har
 * dizayn `date_from` ni o'zicha o'qib, biri yilni, boshqasi to'liq
 * sanani ko'rsatardi.
 *
 * KO'RINISH BU YERDA YO'Q: faqat shakl. Rang, tipografiya va
 * joylashuv har dizaynning o'zida qoladi.
 *
 * Hech narsa import qilinmaydi: testlar `@/` taxallusini yecha
 * olmaydi.
 */

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  from: string | null;
  to: string | null;
  url: string | null;
}

/**
 * Yozuv qatorlarini bir xil shaklga keltiradi.
 *
 * Oltita jadval (`education`, `work_experiences`, …) bir xil
 * ustunlarga ega, shuning uchun bitta funksiya hammasiga yetadi.
 */
export function toTimeline(rows: readonly Record<string, unknown>[]): TimelineItem[] {
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    subtitle: (row.subtitle as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    from: (row.date_from as string | null) ?? null,
    to: (row.date_to as string | null) ?? null,
    url: (row.url as string | null) ?? null,
  }));
}

/** Sanadan faqat yil. Ro'yxatda kun ortiqcha shovqin. */
export function year(value: string | null): string {
  return value ? value.slice(0, 4) : "";
}

/**
 * Vaqt oralig'i matni.
 *
 * Tugash sanasi yo'q bo'lsa "hozirgacha" — bo'sh qoldirish
 * "tugagan, lekin qachonligi noma'lum" degan boshqa ma'no berardi.
 */
export function range(from: string | null, to: string | null): string {
  const start = year(from);
  if (!start) return "";
  return to ? `${start} — ${year(to)}` : `${start} — hozirgacha`;
}

/**
 * Havola xavfsizmi.
 *
 * Foydalanuvchi kiritgan havola ommaviy sahifada `href` bo'lib
 * chiqadi. `javascript:` sxemasi saqlangan XSS bo'lardi (§58).
 *
 * Yozuvlar saqlanishda ham tekshiriladi, lekin dizayn shunga
 * TAYANMAYDI: eski ma'lumot tekshiruvdan oldin kiritilgan bo'lishi
 * mumkin.
 */
export function safeUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Sertifikat ishonch belgisi.
 *
 * §8: "Foydalanuvchi kiritgan" va "Tasdiqlangan" farqi o'quvchiga
 * aytilishi SHART — dizayn chiroyliligi uchun yashirish o'quvchini
 * chalg'itardi. Shuning uchun matn umumiy modulda: har dizayn uni
 * o'zicha yozsa, bittasida "Tasdiqlangan" deb yozib qo'yilishi
 * mumkin edi.
 */
export function trustLabel(trust: unknown): string {
  return trust === "verified" ? "Tasdiqlangan" : "Foydalanuvchi kiritgan";
}

export function isVerified(trust: unknown): boolean {
  return trust === "verified";
}
