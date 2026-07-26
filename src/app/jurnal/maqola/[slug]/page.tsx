import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalArticleBySlug } from "@/lib/data/journals";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ArticleBody } from "@/components/ui/article-body";

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

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getJournalArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const journal = Array.isArray(article.journal) ? article.journal[0] : article.journal;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Liderlar Online", href: "/jurnal" },
          ...(journal ? [{ label: `#${journal.issue_number}`, href: `/jurnal/${journal.slug}` }] : []),
          { label: article.title },
        ]}
      />

      <h1 className="mt-4 font-display text-[1.9rem] font-bold leading-[1.12] text-navy sm:text-4xl">
        {article.title}
      </h1>

      {article.authors?.length > 0 && (
        <p className="mt-3 text-sm text-ink-soft">
          Muallif(lar):{" "}
          {article.authors
            .map((a) => {
              const candidate = Array.isArray(a.candidate) ? a.candidate[0] : a.candidate;
              return candidate ? (
                <Link key={a.id} href={`/liderlar/${candidate.slug}`} className="font-semibold text-liderlar-blue">
                  {candidate.full_name}
                </Link>
              ) : (
                <span key={a.id}>{a.author_name}</span>
              );
            })
            .reduce<ReactNode[]>((acc, cur, i) => (i === 0 ? [cur] : [...acc, ", ", cur]), [])}
        </p>
      )}

      {article.cover_url && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl">
          <Image src={article.cover_url} alt={article.title} fill sizes="768px" className="object-cover" />
        </div>
      )}

      <div className="-mx-4 mt-7 border-y border-brand-soft bg-paper px-5 py-8 shadow-card sm:mx-0 sm:rounded-2xl sm:border sm:px-9 sm:py-10">
        <ArticleBody content={article.content} dropCap lead />
      </div>
    </article>
  );
}
