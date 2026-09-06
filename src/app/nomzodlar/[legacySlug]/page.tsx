import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getLegacyPostBySlug } from "@/lib/data/legacy-posts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LegacyArticleBody, legacyReadingMinutes } from "@/components/ui/legacy-article-body";
import { formatDateUz } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

/**
 * Liderlar 1.0 maqolasi — ESKI manzilda, YANGI dizaynda.
 *
 * /nomzodlar/<legacy-slug> 1.0 dan qolgan havola. U /liderlar/... ga
 * YO'NALTIRILMAYDI: eski havolalar tashqi saytlarda, ijtimoiy tarmoqlarda va
 * qidiruv indeksida qolgan, va ularning aksariyati uchun 2.0 da mos keluvchi
 * yozuv umuman yo'q. Redirect ularni noto'g'ri odamning sahifasiga olib
 * borardi yoki 404 ga aylanardi, shuning uchun eski manzil o'z kontentini
 * o'zi ko'rsatib turaveradi.
 *
 * Kontent esa eski emas: sahifa 2.0 ning header/footer'i (root layout),
 * tipografiyasi va tarmoqlariga to'liq kiradi. Eski Tilda ko'rinishidan hech
 * narsa qolmaydi — u import bosqichida sanitizatsiya qilib tashlangan.
 */

export const revalidate = 3600;

type Params = { params: Promise<{ legacySlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { legacySlug } = await params;
  const post = await getLegacyPostBySlug(legacySlug).catch(() => null);
  if (!post) return { title: "Sahifa topilmadi" };

  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.summary ?? undefined,
    // Canonical eski manzilning O'ZI: bu sahifa shu yerda yashaydi, boshqa
    // joydagi nusxasi emas.
    alternates: { canonical: `${SITE_URL}${post.legacy_path}` },
    openGraph: {
      type: "article",
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.summary ?? undefined,
      url: `${SITE_URL}${post.legacy_path}`,
      publishedTime: post.legacy_created_at ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
  };
}

export default async function LegacyPostPage({ params }: Params) {
  const { legacySlug } = await params;
  const post = await getLegacyPostBySlug(legacySlug).catch(() => null);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Ensiklopediya", href: "/liderlar" }, { label: post.title }]} />

      <p className="mt-4 inline-flex items-center rounded-full border border-brand-soft bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
        Liderlar 1.0 arxivi
      </p>

      <h1 className="mt-3 font-display text-[1.9rem] font-bold leading-[1.12] text-navy sm:text-4xl">
        {post.title}
      </h1>

      {post.summary && (
        <p className="mt-3 text-[1.05rem] leading-[1.7] text-ink-soft">{post.summary}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-soft">
        {/* Sana faqat manbada BOR bo'lsa ko'rsatiladi. Import sanasi hech qachon
            maqolaning sanasi sifatida chiqmaydi. */}
        {post.legacy_created_at && <span>{formatDateUz(post.legacy_created_at)}</span>}
        <span>{legacyReadingMinutes(post.content_text)} daqiqalik o&apos;qish</span>
        {post.legacy_categories.map((category) => (
          <span key={category} className="rounded-full bg-liderlar-blue/8 px-2.5 py-1 text-xs font-semibold text-liderlar-blue">
            {category}
          </span>
        ))}
      </div>

      {post.cover_image_url && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="768px"
            className="object-cover"
          />
        </div>
      )}

      <div className="-mx-4 mt-7 border-y border-brand-soft bg-paper px-5 py-8 shadow-card sm:mx-0 sm:rounded-2xl sm:border sm:px-9 sm:py-10">
        <LegacyArticleBody html={post.content_html} />
      </div>

      {/* Bu odam 2.0 da ham bor bo'lsa — havola. Avtomatik yo'naltirish emas:
          o'quvchi qaysi sahifada turishini o'zi tanlaydi. */}
      {post.candidate && (
        <Link
          href={`/liderlar/${post.candidate.slug}`}
          className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-brand-soft bg-paper px-5 py-4 shadow-card transition-colors hover:border-liderlar-blue"
        >
          <span className="text-sm text-ink-soft">
            Yangilangan profil:{" "}
            <span className="font-semibold text-navy">{post.candidate.full_name}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-liderlar-blue" aria-hidden />
        </Link>
      )}
    </article>
  );
}
