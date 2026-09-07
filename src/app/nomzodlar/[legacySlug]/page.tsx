import type { Metadata } from "next";
import {
  LegacyPostPage,
  generateLegacyPostMetadata,
} from "@/components/legacy/legacy-post-page";

/**
 * Liderlar 1.0 arxivi — KANONIK eski manzil.
 *
 * Bir xil maqola `/tpost/<slug>` da ham ochiladi (1.0 da ikkalasi ham
 * ishlagan), lekin canonical va sitemap shu yerni ko'rsatadi.
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
