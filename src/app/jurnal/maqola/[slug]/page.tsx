import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJournalArticleBySlug } from "@/lib/data/journals";
import { resolveSiteUrl } from "@/lib/site-url";
import { shouldDropCapText } from "@/lib/articles/reading";
import { ArticleBody, readingMinutes, toParagraphs } from "@/components/ui/article-body";
import { ArticleReader } from "@/components/reader/article-reader";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getJournalArticleBySlug(slug).catch(() => null);
  if (!article) return { title: "Maqola topilmadi" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: { images: article.cover_url ? [{ url: article.cover_url }] : undefined },
  };
}

/**
 * JURNAL MAQOLASI — umumiy o'qish oynasida (`ArticleReader`).
 *
 * Avval matn `whitespace-pre-wrap` bilan xom chiqardi; endi u
 * tahririyat maqolasi kabi abzatslarga ajraladi (`ArticleBody`) —
 * belgilash talqin qilinmaydi, faqat tipografiya.
 */
export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getJournalArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const journal = Array.isArray(article.journal) ? article.journal[0] : article.journal;
  const siteUrl = await resolveSiteUrl();

  const authors = (article.authors ?? [])
    .map((author) => {
      const candidate = Array.isArray(author.candidate) ? author.candidate[0] : author.candidate;
      return candidate?.full_name
        ? { name: candidate.full_name, href: `/liderlar/${candidate.slug}`, avatarUrl: candidate.avatar_url }
        : author.author_name
          ? { name: author.author_name }
          : null;
    })
    .filter((author): author is NonNullable<typeof author> => author !== null);

  return (
    <article>
      <ArticleReader
        crumbs={[
          { label: "Liderlar Online", href: "/jurnal" },
          ...(journal ? [{ label: `#${journal.issue_number}`, href: `/jurnal/${journal.slug}` }] : []),
          { label: article.title },
        ]}
        kicker={journal ? `Jurnal · ${journal.issue_number}-son` : "Jurnal"}
        title={article.title}
        dek={article.excerpt}
        authors={authors}
        readingMinutes={readingMinutes(article.content)}
        cover={article.cover_url ? { url: article.cover_url, alt: article.title } : null}
        shareUrl={`${siteUrl}/jurnal/maqola/${article.slug}`}
      >
        <ArticleBody
          content={article.content}
          className="max-w-none"
          dropCap={shouldDropCapText(toParagraphs(article.content)[0])}
          lead
        />
      </ArticleReader>
    </article>
  );
}
