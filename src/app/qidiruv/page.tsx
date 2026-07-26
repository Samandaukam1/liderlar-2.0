import type { Metadata } from "next";
import Link from "next/link";
import { Users, Newspaper, Radio, BookOpen } from "lucide-react";
import { globalSearch } from "@/lib/data/search";
import { HeroSearch } from "@/components/home/hero-search";
import { LeaderCard } from "@/components/cards/leader-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateUz } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Qidiruv",
  description: "Liderlar.uz platformasi bo'ylab liderlar, maqolalar, podcastlar va jurnal materiallarini qidiring.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await globalSearch(query).catch(() => null) : null;
  const hasResults =
    results &&
    (results.candidates.length || results.articles.length || results.podcasts.length || results.journalArticles.length);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">Qidiruv</h1>
      <p className="mt-2 text-ink-soft">Liderlar, biografik maqolalar, podcastlar va jurnal materiallari bo&apos;yicha qidiring.</p>

      <div className="mt-6 max-w-xl">
        <HeroSearch />
      </div>

      {!query && (
        <p className="mt-10 text-center text-ink-soft">Qidiruv uchun yuqoridagi maydonga so&apos;z kiriting.</p>
      )}

      {query && !hasResults && (
        <EmptyState className="mt-10" title={`"${query}" bo'yicha hech narsa topilmadi`} description="Boshqa kalit so'z bilan qayta urinib ko'ring." />
      )}

      {results && results.candidates.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-navy">
            <Users className="h-5 w-5 text-liderlar-blue" aria-hidden /> Liderlar
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.candidates.map((c) => (
              <LeaderCard key={c.id} candidate={c} />
            ))}
          </div>
        </section>
      )}

      {results && results.articles.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-navy">
            <BookOpen className="h-5 w-5 text-liderlar-blue" aria-hidden /> Maqolalar
          </h2>
          <ul className="space-y-2">
            {results.articles.map((a) => (
              <li key={a.id}>
                <Link href={`/maqola/${a.slug}`} className="block rounded-md border border-brand-soft bg-paper px-4 py-3 hover:border-liderlar-blue">
                  <span className="font-semibold text-navy">{a.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results && results.podcasts.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-navy">
            <Radio className="h-5 w-5 text-liderlar-blue" aria-hidden /> Podcastlar
          </h2>
          <ul className="space-y-2">
            {results.podcasts.map((p) => (
              <li key={p.id}>
                <Link href={`/podcastlar/${p.slug}`} className="flex items-center justify-between rounded-md border border-brand-soft bg-paper px-4 py-3 hover:border-liderlar-blue">
                  <span className="font-semibold text-navy">{p.title}</span>
                  <span className="text-xs text-ink-soft">{formatDateUz(p.starts_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results && results.journalArticles.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-navy">
            <Newspaper className="h-5 w-5 text-liderlar-blue" aria-hidden /> Liderlar Online
          </h2>
          <ul className="space-y-2">
            {results.journalArticles.map((a) => (
              <li key={a.id}>
                <Link href={`/jurnal/maqola/${a.slug}`} className="block rounded-md border border-brand-soft bg-paper px-4 py-3 hover:border-liderlar-blue">
                  <span className="font-semibold text-navy">{a.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
