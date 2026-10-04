import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/data/articles";
import { resolveSiteUrl } from "@/lib/site-url";
import { toShortBioItems } from "@/lib/candidates/text";
import { shouldDropCapText } from "@/lib/articles/reading";
import { ArticleBody, readingMinutes, toParagraphs } from "@/components/ui/article-body";
import { ArticleReader, ReaderAuthorCard } from "@/components/reader/article-reader";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return { title: "Maqola topilmadi" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: { images: article.cover_url ? [{ url: article.cover_url }] : undefined },
  };
}

/**
 * TAHRIRIYAT MAQOLASI — umumiy o'qish oynasida (`ArticleReader`).
 *
 * Matn ODDIY MATN sifatida chiziladi (`ArticleBody`): bu maqolalarni
 * tahririyat yozadi va ularda "*" belgisi kursiv emas, oddiy belgi
 * bo'lishi mumkin.
 */
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const candidate = Array.isArray(article.candidate) ? article.candidate[0] : article.candidate;
  const siteUrl = await resolveSiteUrl();
  const authorHref = candidate?.slug ? `/liderlar/${candidate.slug}` : null;
  const firstParagraph = toParagraphs(article.content)[0];

  return (
    <article>
      <ArticleReader
        crumbs={[{ label: "Ensiklopediya", href: "/liderlar" }, { label: article.title }]}
        kicker="Ensiklopediya"
        title={article.title}
        /*
         * Tavsif ko'pincha teglar ro'yxati ("Pedagog | Kitobxon"); Manrope
         * shriftida "|" "I" harfiga o'xshab qoladi — nuqta bilan ajratamiz.
         */
        dek={article.excerpt?.replace(/\s*\|\s*/g, " · ") ?? null}
        authors={
          candidate?.full_name
            ? [{ name: candidate.full_name, href: authorHref, avatarUrl: candidate.avatar_url }]
            : []
        }
        publishedAt={article.published_at}
        readingMinutes={readingMinutes(article.content)}
        cover={article.cover_url ? { url: article.cover_url, alt: article.title } : null}
        shareUrl={`${siteUrl}/maqola/${article.slug}`}
        footer={
          candidate?.full_name && authorHref ? (
            <ReaderAuthorCard
              name={candidate.full_name}
              href={authorHref}
              avatarUrl={candidate.avatar_url}
              about={toShortBioItems(candidate.short_bio).join(" · ") || null}
            />
          ) : null
        }
      >
        <ArticleBody
          content={article.content}
          className="max-w-none"
          dropCap={shouldDropCapText(firstParagraph)}
          lead
        />
      </ArticleReader>
    </article>
  );
}
