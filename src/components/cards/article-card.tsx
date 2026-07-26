import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { ArticleCardData } from "@/lib/types";
import { formatDateUz, gradientFor, truncate } from "@/lib/utils";

export function ArticleCard({ article }: { article: ArticleCardData }) {
  const gradient = gradientFor(article.slug);

  return (
    <Link
      href={`/maqola/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-soft bg-paper shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {article.cover_url ? (
          <Image
            src={article.cover_url}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${gradient}`}>
            <Newspaper className="h-8 w-8 text-white/80" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-xl font-semibold leading-none text-navy">{article.title}</h3>
        {article.excerpt && <p className="text-sm text-ink-soft">{truncate(article.excerpt, 110)}</p>}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-soft">
          {article.candidate && <span>{article.candidate.full_name}</span>}
          {article.published_at && <span>{formatDateUz(article.published_at)}</span>}
        </div>
      </div>
    </Link>
  );
}
