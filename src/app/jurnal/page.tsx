import type { Metadata } from "next";
import { getJournals } from "@/lib/data/journals";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JournalCard } from "@/components/cards/journal-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Liderlar Online jurnali",
  description: "Liderlar Online — Liderlar.uz platformasining rasmiy raqamli jurnali arxivi.",
};

export default async function JournalListPage() {
  const journals = await getJournals().catch(() => []);
  const [featured, ...rest] = journals;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Liderlar Online" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Liderlar Online jurnali</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Yosh liderlar hayoti, yutuqlari va tashabbuslariga bag&apos;ishlangan rasmiy raqamli jurnalimiz arxivi.
      </p>

      {journals.length === 0 ? (
        <EmptyState className="mt-10" title="Hozircha nashr etilgan son yo'q" />
      ) : (
        <div className="mt-10 space-y-10">
          {featured && (
            <div className="max-w-xl">
              <span className="mb-3 inline-block font-display text-xs font-semibold uppercase tracking-wide text-liderlar-blue">
                So&apos;nggi son
              </span>
              <JournalCard journal={featured} featured />
            </div>
          )}
          {rest.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-xl font-bold text-navy">Arxiv</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4">
                {rest.map((j) => (
                  <div key={j.id} className="w-40 shrink-0 sm:w-auto">
                    <JournalCard journal={j} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
