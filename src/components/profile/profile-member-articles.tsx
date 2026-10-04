import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDateUz } from "@/lib/utils";

export interface ProfileArticleCard {
  id: string;
  href: string;
  title: string;
  excerpt: string | null;
  subtitle: string | null;
  heroUrl: string | null;
  heroAlt: string | null;
  publishedAt: string | null;
}

/**
 * NOMZODNING O'Z MAQOLALARI — STANDART BIOGRAFIK SAHIFADA.
 *
 * Kartalar Liderlar Online'dagi maqolaga olib boradi. Bo'lim faqat
 * ko'rsatiladigan maqola bo'lganda chiziladi (`show_on_profile`):
 * bo'sh sarlavha "maqolasi yo'q" degan ma'nosiz xabar bo'lardi.
 */
export function ProfileMemberArticles({ articles }: { articles: readonly ProfileArticleCard[] }) {
  if (articles.length === 0) return null;

  return (
    <section id="maqolalari" className="scroll-mt-20">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-bold text-navy">Maqolalari</h2>
        <span className="rounded-full bg-liderlar-blue/8 px-2 py-0.5 text-[11px] font-semibold text-liderlar-blue">
          {articles.length}
        </span>
      </div>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={article.href}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-brand-soft bg-white shadow-card transition hover:-translate-y-0.5 hover:border-liderlar-blue/40"
            >
              {article.heroUrl ? (
                <span className="relative block aspect-[16/9] overflow-hidden bg-paper">
                  <Image
                    src={article.heroUrl}
                    alt={article.heroAlt ?? ""}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </span>
              ) : null}

              <span className="flex flex-1 flex-col p-4">
                <span className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-liderlar-blue">
                  Liderlar Online
                  {article.publishedAt ? ` · ${formatDateUz(article.publishedAt)}` : ""}
                </span>
                <span className="mt-1.5 font-display text-base font-bold leading-snug text-navy">
                  {article.title}
                </span>
                {(article.excerpt || article.subtitle) && (
                  <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {article.excerpt || article.subtitle}
                  </span>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-liderlar-blue">
                  O&apos;qish
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
