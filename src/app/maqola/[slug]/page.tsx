import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/data/articles";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Avatar } from "@/components/ui/avatar";
import { ArticleBody, readingMinutes } from "@/components/ui/article-body";
import { formatDateUz, splitFullName } from "@/lib/utils";

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

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const candidate = Array.isArray(article.candidate) ? article.candidate[0] : article.candidate;
  const name = candidate?.full_name ?? null;
  const [firstName, lastName] = splitFullName(name);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Ensiklopediya", href: "/liderlar" }, { label: article.title }]} />

      <h1 className="mt-4 font-display text-[1.9rem] font-bold leading-[1.12] text-navy sm:text-4xl">
        {article.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        {candidate && (
          <Link href={`/liderlar/${candidate.slug}`} className="flex items-center gap-2">
            <Avatar src={candidate.avatar_url} firstName={firstName} lastName={lastName} size="sm" />
            <span className="text-sm font-semibold text-navy">{name}</span>
          </Link>
        )}
        {article.published_at && <span className="text-sm text-ink-soft">{formatDateUz(article.published_at)}</span>}
        <span className="text-sm text-ink-soft">{readingMinutes(article.content)} daqiqalik o&apos;qish</span>
      </div>

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
