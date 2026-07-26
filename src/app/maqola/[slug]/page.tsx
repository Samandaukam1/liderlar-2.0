import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/data/articles";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Avatar } from "@/components/ui/avatar";
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

      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">{article.title}</h1>

      <div className="mt-4 flex items-center gap-3">
        {candidate && (
          <Link href={`/liderlar/${candidate.slug}`} className="flex items-center gap-2">
            <Avatar src={candidate.avatar_url} firstName={firstName} lastName={lastName} size="sm" />
            <span className="text-sm font-semibold text-navy">{name}</span>
          </Link>
        )}
        {article.published_at && <span className="text-sm text-ink-soft">{formatDateUz(article.published_at)}</span>}
      </div>

      {article.cover_url && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl">
          <Image src={article.cover_url} alt={article.title} fill sizes="768px" className="object-cover" />
        </div>
      )}

      <div className="prose-article mx-auto mt-8 whitespace-pre-wrap text-[1.05rem] leading-[1.75] text-ink">
        {article.content}
      </div>
    </article>
  );
}
