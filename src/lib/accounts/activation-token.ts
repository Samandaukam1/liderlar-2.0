import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Faollashtirish tokeni — SOF MODUL (web tomoni).
 *
 * IKKI ILOVA O'RTASIDAGI SHARTNOMA.
 *
 * Tokenni ADMIN ilovasi yaratadi, nomzod esa uni SHU ilovada
 * (liderlar.uz) ishlatadi. Ular bir-birining kodini ko'rmaydi —
 * yagona umumiy narsa bazadagi hash:
 *
 *     candidate_activations.token_hash = sha256(token), hex
 *
 * Shuning uchun bu yerda murakkab mantiq YO'Q: qancha kam
 * kelishuv bo'lsa, ikki ilova shuncha kam ajralib ketadi.
 */

export function hashActivationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(presented: string, storedHash: string): boolean {
  const a = Buffer.from(hashActivationToken(presented));
  const b = Buffer.from(storedHash);
  // Doimiy vaqtda: javob tezligi prefiksni topishga yordam bermasin.
  return a.length === b.length && timingSafeEqual(a, b);
}

export type ActivationFailure =
  | "not_found"
  | "consumed"
  | "revoked"
  | "expired"
  | "already_linked"
  | "user_already_linked"
  | "email_taken"
  | "needs_reconcile"
  | "disabled"
  | "error";

/**
 * Foydalanuvchiga ko'rsatiladigan matn.
 *
 * Har bir holat BOSHQACHA javob beradi: "muddati tugagan" va
 * "allaqachon ishlatilgan" odam uchun butunlay boshqa ma'no —
 * birinchisida yangi havola so'rash kifoya, ikkinchisida esa
 * u allaqachon hisob ochgan bo'lishi mumkin.
 */
export const ACTIVATION_FAILURE_TEXT: Readonly<Record<ActivationFailure, string>> = {
  not_found: "Havola tanilmadi. Administratordan yangi havola so'rang.",
  consumed:
    "Bu havola allaqachon ishlatilgan. Agar hisobingiz yaratilgan bo'lsa, oddiy tarzda kiring.",
  revoked: "Bu havola bekor qilingan. Administratordan yangi havola so'rang.",
  expired: "Havolaning muddati tugagan. Administratordan yangi havola so'rang.",
  already_linked: "Bu profil allaqachon boshqa hisobga bog'langan.",
  user_already_linked:
    "Sizning hisobingiz allaqachon boshqa profilga bog'langan. Administratorga murojaat qiling.",
  email_taken:
    "Bu email allaqachon ro'yxatdan o'tgan. Avval kiring, keyin havolani qaytadan oching.",
  needs_reconcile:
    "Hisob yaratildi, lekin profilga bog'lanmadi. Administratorga murojaat qiling — ma'lumotlaringiz saqlangan.",
  disabled: "Faollashtirish hozircha yopiq. Keyinroq urinib ko'ring.",
  error: "Kutilmagan xatolik. Qaytadan urinib ko'ring.",
};
