import type { getCandidateBySlug } from "@/lib/data/candidates";
import type { getCandidateJournalArticles, getCandidatePodcasts } from "@/lib/data/profile-extra";
import type { PortraitCutout } from "@/lib/themes/portrait-cutout";

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
 * Ba'zi dizaynlarga qo'shimcha ma'lumot.
 *
 * Profilning o'zida yo'q, lekin mavjud tizimlarda allaqachon bor narsalar
 * (Post Studio portreti, jurnal materiallari, …). Ular FAQAT shu dizayn
 * tanlanganda yuklanadi (`themeExtrasFor`), ya'ni boshqa dizaynlardagi
 * profillar ortiqcha so'rov qilmaydi. Maydon yo'q bo'lsa — dizayn uni
 * ko'rsatmaydi, xato bermaydi.
 */
export interface ThemeExtras {
  portraitCutout?: PortraitCutout | null;
  promoCode?: string | null;
  journalArticles?: Awaited<ReturnType<typeof getCandidateJournalArticles>>;
  podcasts?: Awaited<ReturnType<typeof getCandidatePodcasts>>;
}

/**
 * Har bir dizayn qabul qiladigan proplar.
 *
 * Dizayn o'zi so'rov qilmasligi kerak (§49 — har bo'lim uchun alohida
 * so'rov qilinmasin): hammasi sahifada yuklanib, shu yerdan keladi.
 */
export interface ThemeProps {
  profile: ThemeProfile;
  extras?: ThemeExtras;
}
