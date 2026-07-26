import type { Metadata } from "next";
import { getAllQuotes } from "@/lib/data/quotes";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LeaderQuoteCard } from "@/components/cards/leader-quote-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Liderlar ovozi va iqtiboslar",
  description: "O'zbekistonning yosh liderlaridan motivatsion iqtiboslar va fikrlar.",
};

export default async function QuotesPage() {
  const quotes = await getAllQuotes(60).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Iqtiboslar" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Liderlar ovozi va iqtiboslar</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Yosh liderlarning motivatsion fikrlari va ilhomlantiruvchi iqtiboslari.
      </p>

      {quotes.length === 0 ? (
        <EmptyState className="mt-10" title="Hozircha iqtiboslar qo'shilmagan" />
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => (
            <LeaderQuoteCard key={q.id} quote={q} />
          ))}
        </div>
      )}
    </div>
  );
}
