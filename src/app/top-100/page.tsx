import type { Metadata } from "next";
import { getPeriodForFilter, getRankingLeaderboard } from "@/lib/data/ranking";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Podium } from "@/components/ranking/podium";
import { RankingCard } from "@/components/cards/ranking-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "TOP 100 lider",
  description: "O'zbekistonning eng yuqori umumiy reytingdagi 100 nafar yosh lideri.",
};

export const dynamic = "force-dynamic";

export default async function Top100Page() {
  const period = await getPeriodForFilter("barcha-vaqt").catch(() => null);
  const rows = period ? await getRankingLeaderboard("overall", period.id, 100).catch(() => []) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "TOP 100" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">TOP 100 lider</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Barcha vaqt davomidagi umumiy reyting bo&apos;yicha eng yuqori 100 nafar tasdiqlangan yosh lider.
      </p>

      {rows.length === 0 ? (
        <EmptyState className="mt-10" title="Hozircha TOP 100 ro'yxati bo'sh" />
      ) : (
        <>
          <div className="mt-12">
            <Podium rows={rows.slice(0, 3)} />
          </div>
          <div className="mt-12 space-y-3">
            {rows.slice(3).map((row) => (
              <RankingCard key={row.candidate_id} row={row} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
