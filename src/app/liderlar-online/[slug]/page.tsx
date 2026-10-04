import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/vip/entitlement-service";
import { getMoreFromAuthor, getOnlineArticle } from "@/lib/data/liderlar-online";
import { resolveSiteUrl } from "@/lib/site-url";
import { formatDateUz } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RichArticleBody } from "@/components/ui/rich-article-body";
import { ArticleCard } from "@/components/online/article-card";

export const dynamic = "force-dynamic";

/**
 * MAQOLA SAHIFASI (§31, §32).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getOnlineArticle(slug).catch(() => null);
  if (!article) return { title: "Maqola topilmadi" };

  const siteUrl = await resolveSiteUrl();
  const url = `${siteUrl}/liderlar-online/${article.slug}`;

  const title = article.seoTitle?.trim() || article.title;
  const description =
    article.seoDescription?.trim() || article.excerpt?.trim() || article.subtitle?.trim() || undefined;

  return {
    title,
    description,
    /*
     * KANONIK MANZIL ANIQ BERILADI (§32).
     *
     * Maqola keyin AdabiyotX ga ham uzatiladi va ikki joyda bir xil
     * matn turadi. Kanonik manzilsiz qidiruv tizimi ularni takroriy
     * mazmun deb hisoblardi va ikkisini ham pastga tushirardi.
     */
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: [{ url: article.heroUrl, alt: article.heroAlt ?? article.title }],
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.heroUrl],
    },
  };
}

export default async function OnlineArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const enabled = await isFeatureEnabled("liderlar_online.enabled");
  if (!enabled) notFound();

  const { slug } = await params;
  const article = await getOnlineArticle(slug).catch(() => null);
  if (!article) notFound();

  const [siteUrl, more] = await Promise.all([
    resolveSiteUrl(),
    getMoreFromAuthor(article.author.slug, article.slug).catch(() => []),
  ]);

  const url = `${siteUrl}/liderlar-online/${article.slug}`;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Liderlar Online", href: "/liderlar-online" },
          { label: article.title },
        ]}
      />

      <header className="mt-4">
        <h1 className="font-display text-3xl font-bold leading-tight text-navy text-balance sm:text-4xl">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">{article.subtitle}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-brand-soft py-3">
          {/* MUALLIF O'Z PROFILIGA HAVOLA QILADI (§26, §31). */}
          <Link href={`/liderlar/${article.author.slug}`} className="flex items-center gap-2">
            {article.author.avatarUrl && (
              <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full bg-paper">
                <Image
                  src={article.author.avatarUrl}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </span>
            )}
            <span className="text-sm font-semibold text-navy">{article.author.name}</span>
          </Link>

          <span className="text-xs text-ink-soft">{formatDateUz(article.publishedAt)}</span>

          {/*
            O'QISH VAQTI FAQAT HISOBLANGANDA (§31).

            Qisqa matn uchun `null` qaytadi va hech narsa
            ko'rsatilmaydi — "1 daqiqa" degan yozuv 50 so'z uchun
            ma'nosiz.
          */}
          {article.readingMinutes !== null && (
            <span className="text-xs text-ink-soft">
              {article.readingMinutes} daqiqa o&apos;qish
            </span>
          )}
        </div>
      </header>

      <figure className="mt-6">
        <span className="relative block aspect-video overflow-hidden rounded-xl bg-paper">
          <Image
            src={article.heroUrl}
            alt={article.heroAlt ?? ""}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            priority
            className="object-cover"
          />
        </span>
        {article.heroAlt && (
          <figcaption className="mt-2 text-center text-xs text-ink-soft">
            {article.heroAlt}
          </figcaption>
        )}
      </figure>

      {/*
        MAZMUN `RichArticleBody` ORQALI.

        Muallif muharrirda qalin, kursiv, havola, iqtibos, sarlavha va
        ro'yxat qo'yadi. Matn tahlil qilinib JSX sifatida chiqadi —
        `dangerouslySetInnerHTML` yo'q, ya'ni saqlangan XSS imkonsiz
        (§58). Belgisiz eski matn avvalgidek abzatslar bo'lib chiqadi.
      */}
      <div className="mt-8">
        <RichArticleBody content={article.content} dropCap />
      </div>

      <footer className="mt-12 border-t border-brand-soft pt-6">
        <Link
          href={`/liderlar/${article.author.slug}`}
          className="flex items-center gap-3 rounded-lg border border-brand-soft bg-paper p-4 transition hover:border-liderlar-blue/40"
        >
          {article.author.avatarUrl && (
            <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white">
              <Image
                src={article.author.avatarUrl}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-xs text-ink-soft">Muallif</span>
            <span className="block font-semibold text-navy">{article.author.name}</span>
            <span className="mt-0.5 block text-xs text-liderlar-blue">
              Profilni ko&apos;rish
            </span>
          </span>
        </Link>
      </footer>

      {more.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Shu muallifning boshqa maqolalari
          </h2>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}

      {/*
        TUZILGAN MA'LUMOT (§32).

        `JSON.stringify` XSS xavfini tug'dirmaydi, chunki qiymatlar
        bazadan keladi va `<` belgisi JSON'da `<` bo'lib
        kodlanadi — lekin ehtiyot uchun `</script>` ketma-ketligi
        alohida almashtiriladi.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            image: [article.heroUrl],
            datePublished: article.publishedAt,
            author: {
              "@type": "Person",
              name: article.author.name,
              url: `${siteUrl}/liderlar/${article.author.slug}`,
            },
            publisher: { "@type": "Organization", name: "Liderlar.uz" },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
          }).replace(/</g, "\\u003c"),
        }}
      />
    </article>
  );
}
