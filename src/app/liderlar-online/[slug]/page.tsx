import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/vip/entitlement-service";
import { getMoreFromAuthor, getOnlineArticle } from "@/lib/data/liderlar-online";
import { resolveSiteUrl } from "@/lib/site-url";
import { parseRichText } from "@/lib/articles/rich-text";
import { articleOutline } from "@/lib/articles/reading";
import { RichArticleBody } from "@/components/ui/rich-article-body";
import { ArticleCard } from "@/components/online/article-card";
import { ArticleReader, ReaderAuthorCard } from "@/components/reader/article-reader";

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
  const authorHref = `/liderlar/${article.author.slug}`;
  // Mundarija — matndagi sarlavhalardan (kamida ikkita bo'lsa).
  const outline = articleOutline(parseRichText(article.content));

  return (
    <article>
      <ArticleReader
        crumbs={[
          { label: "Liderlar Online", href: "/liderlar-online" },
          { label: article.title },
        ]}
        kicker="Liderlar Online"
        title={article.title}
        dek={article.subtitle}
        authors={[{ name: article.author.name, href: authorHref, avatarUrl: article.author.avatarUrl }]}
        publishedAt={article.publishedAt}
        readingMinutes={article.readingMinutes}
        cover={{ url: article.heroUrl, alt: article.heroAlt, caption: article.heroAlt }}
        shareUrl={url}
        outline={outline}
        footer={
          <>
            {/* MUALLIF O'Z PROFILIGA HAVOLA QILADI (§26, §31). */}
            <ReaderAuthorCard
              name={article.author.name}
              href={authorHref}
              avatarUrl={article.author.avatarUrl}
              about={article.authorAbout}
              moreHref={`${authorHref}#maqolalari`}
            />

            {more.length > 0 && (
              <section className="mt-14">
                <div className="mb-6 flex items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-navy">Shu muallifning boshqa maqolalari</h2>
                  <span aria-hidden className="h-px flex-1 bg-border-soft" />
                </div>
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
                  {more.map((item) => (
                    <ArticleCard key={item.id} article={item} />
                  ))}
                </div>
              </section>
            )}
          </>
        }
      >
        {/*
          MAZMUN `RichArticleBody` ORQALI.

          Muallif muharrirda qalin, kursiv, havola, iqtibos, sarlavha va
          ro'yxat qo'yadi. Matn tahlil qilinib JSX sifatida chiqadi —
          `dangerouslySetInnerHTML` yo'q, ya'ni saqlangan XSS imkonsiz
          (§58). Belgisiz eski matn avvalgidek abzatslar bo'lib chiqadi.
        */}
        <RichArticleBody content={article.content} className="max-w-none" dropCap lead />
      </ArticleReader>

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
