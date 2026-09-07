import type { Metadata } from "next";
import {
  LegacyPostPage,
  generateLegacyPostMetadata,
} from "@/components/legacy/legacy-post-page";

/**
 * Tilda'ning o'z post yo'li — 1.0 da har bir maqola shu yerda ham ochilgan.
 *
 * Eksport faylida `tpost` so'zi umuman uchramaydi, ya'ni buni ma'lumotdan
 * bilib bo'lmasdi; bu yo'l Tilda platformasining standarti va bunday havolalar
 * qidiruv indeksida hamda tashqi saytlarda qolgan. Shuning uchun u ham 200
 * qaytaradi — `/nomzodlar/` ga YO'NALTIRILMAYDI, chunki eski manzil bevosita
 * ishlashi kerak.
 *
 * Kanonik manzil esa `/nomzodlar/<slug>`: `generateLegacyPostMetadata` shu
 * yerda ham o'sha canonical'ni beradi va sitemapga faqat o'sha kiradi, aks
 * holda bitta maqola qidiruvda ikki manzil bo'lib o'ziga o'zi raqobat qilardi.
 */

export const revalidate = 3600;

type Params = { params: Promise<{ legacySlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { legacySlug } = await params;
  return generateLegacyPostMetadata(legacySlug);
}

export default async function Page({ params }: Params) {
  const { legacySlug } = await params;
  return <LegacyPostPage legacySlug={legacySlug} />;
}
