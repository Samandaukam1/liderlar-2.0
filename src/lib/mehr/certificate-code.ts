/**
 * Sertifikat kodi — SOF MODUL.
 *
 * Alohida fayl, chunki bu loyihada testlar `@/` aliasini
 * yecha olmaydi: baza mijozini import qiladigan modulni
 * testdan chaqirib bo'lmaydi. Qoidalar shuning uchun
 * kiritish-chiqarishdan ajratiladi.
 */

/*
 * Alifboda I, L, O, U yo'q: I/1 va O/0 qo'lda ko'chirishda
 * chalkashadi. Admin tomondagi generator bilan bir xil.
 */
const BODY_RE = /^[0-9A-HJ-KM-NP-TV-Z]{10}$/;

export const CERTIFICATE_PREFIX = "MEHR";

/**
 * Foydalanuvchi kiritgan kodni tozalaydi.
 *
 * Odam kodni QR'dan emas, qog'ozdan ham ko'chiradi: bo'shliq,
 * kichik harf va tushib qolgan chiziqcha odatiy holat. Ularni
 * rad etish tekshiruvni behuda qiyinlashtirardi.
 */
export function normalizeCode(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
  const body = cleaned.startsWith(CERTIFICATE_PREFIX)
    ? cleaned.slice(CERTIFICATE_PREFIX.length)
    : cleaned;

  return BODY_RE.test(body) ? `${CERTIFICATE_PREFIX}-${body}` : null;
}

export const CERTIFICATE_ROLE_LABEL: Readonly<Record<string, string>> = {
  participant: "Ishtirokchi",
  co_organizer: "Hamkor tashkilotchi",
  organizer: "Tashkilotchi",
};
