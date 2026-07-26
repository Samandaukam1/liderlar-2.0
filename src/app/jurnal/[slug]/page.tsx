import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, BookOpen } from "lucide-react";
import { getJournalBySlug } from "@/lib/data/journals";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LinkButton } from "@/components/ui/button";
import { formatDateUz, gradientFor } from "@/lib/utils";

type JournalArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  sort_order: number;
  authors: {
    author_name: string | null;
    candidate: { full_name: string } | { full_name: string }[] | null;
  }[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const journal = await getJournalBySlug(slug).catch(() => null);
  if (!journal) return { title: "Jurnal soni topilmadi" };
  return {
    title: `${journal.title} — #${journal.issue_number}`,
    description: journal.description ?? undefined,
    openGraph: { images: journal.cover_url ? [{ url: journal.cover_url }] : undefined },
  };
}

export default async function JournalIssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await getJournalBySlug(slug).catch(() => null);
  if (!journal) notFound();

  const gradient = gradientFor(journal.slug);
  const journalArticles = (journal.articles ?? []) as JournalArticleItem[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Liderlar Online", href: "/jurnal" }, { label: `#${journal.issue_number}` }]} />

      <div className="mt-8 grid gap-8 sm:grid-cols-[16rem_1fr]">
        <div className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-card-hover ${gradient}`}>
          {journal.cover_url ? (
            <Image src={journal.cover_url} alt={journal.title} fill sizes="256px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-14 w-14 text-white/80" aria-hidden />
            </div>
          )}
        </div>
        <div>
          <span className="rounded-full bg-liderlar-blue/8 px-3 py-1 font-display text-xs font-bold text-liderlar-blue">
            Son #{journal.issue_number}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">{journal.title}</h1>
          {journal.published_at && <p className="mt-1 text-sm text-ink-soft">{formatDateUz(journal.published_at)}</p>}
          {journal.description && <p className="prose-article mt-4 leading-relaxed text-ink-soft">{journal.description}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            {journal.pdf_url && (
              <LinkButton href={journal.pdf_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" aria-hidden />
                PDF yuklab olish
              </LinkButton>
            )}
          </div>
        </div>
      </div>

      {journalArticles.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-navy">Ushbu sondagi maqolalar</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {journalArticles
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((article) => (
                <Link
                  key={article.id}
                  href={`/jurnal/maqola/${article.slug}`}
                  className="group flex gap-4 rounded-lg border border-brand-soft bg-paper p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  {article.cover_url && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                      <Image src={article.cover_url} alt={article.title} fill sizes="80px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display font-bold text-navy">{article.title}</p>
                    {article.excerpt && <p className="mt-1 truncate text-sm text-ink-soft">{article.excerpt}</p>}
                    {article.authors?.length > 0 && (
                      <p className="mt-1.5 text-xs text-ink-soft">
                        {article.authors
                          .map((a) => {
                            const candidate = Array.isArray(a.candidate) ? a.candidate[0] : a.candidate;
                            return candidate?.full_name ?? a.author_name;
                          })
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
