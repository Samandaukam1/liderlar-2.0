import type { getCandidateBySlug } from "@/lib/data/candidates";

/**
 * MAVZU SHARTNOMASI.
 *
 * §11: barcha dizaynlar BIR XIL ma'lumotni oladi. Shuning uchun
 * shartnoma qo'lda yozilmaydi — u mavjud yuklash funksiyasining
 * natijasidan KELTIRIB CHIQARILADI.
 *
 * Nega shunday: qo'lda yozilgan tip yuklash funksiyasidan ajralib
 * ketardi va dizayn kutgan maydon kelmay qolardi. Bu usulda
 * yuklashga maydon qo'shilsa, u barcha dizaynlarga o'zidan ochiladi.
 *
 * `import type` — tip o'chib ketadi, ya'ni server moduli mijoz
 * paketiga tortilmaydi.
 */
export type ThemeProfile = NonNullable<Awaited<ReturnType<typeof getCandidateBySlug>>>;

/**
 * Har bir dizayn qabul qiladigan proplar.
 *
 * `profile` dan boshqa hech narsa YO'Q: dizayn o'zi so'rov qilmasligi
 * kerak (§49 — har bo'lim uchun alohida so'rov qilinmasin).
 */
export interface ThemeProps {
  profile: ThemeProfile;
}
