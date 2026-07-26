import { Suspense } from "react";
import type { Metadata } from "next";
import { Info } from "lucide-react";
import { getRankingCategories, getPeriodForFilter, getRankingLeaderboard, getRankingWeights, type PeriodFilter } from "@/lib/data/ranking";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RankingCategoryTabs, RankingPeriodTabs } from "@/components/ranking/ranking-filters";
import { Podium } from "@/components/ranking/podium";
import { RankingCard } from "@/components/cards/ranking-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Reyting",
  description:
    "Liderlar.uz reyting tizimi — yutuqlar, oylik faollik va faol liderlik ko'rsatkichlari asosida shakllanadigan ochiq va izohlanadigan reyting.",
};

type SearchParams = Record<string, string | string[] | undefined>;
function toStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function RankingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const categories = await getRankingCategories().catch(() => []);
  const categoryCode = toStr(sp.kategoriya) ?? categories[0]?.slug ?? "overall";
  const periodFilter = (toStr(sp.davr) ?? "barcha-vaqt") as PeriodFilter;

  const period = await getPeriodForFilter(periodFilter).catch(() => null);
  const weights = period ? await getRankingWeights(period.id).catch(() => null) : null;

  const rows = period ? await getRankingLeaderboard(categoryCode, period.id, 100).catch(() => []) : [];
  const podiumRows = rows.slice(0, 3);
  const restRows = rows.slice(3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Reyting" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Reyting</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Reyting ochiq va izohlanadigan formula asosida hisoblanadi: yutuqlar, oylik faollik va faol liderlik
        ko&apos;rsatkichlari admin panel orqali belgilangan og&apos;irliklar bilan birlashtiriladi.
      </p>

      {weights && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-brand-soft bg-liderlar-blue/5 p-4 text-sm text-ink-soft">
          <Info className="h-4 w-4 shrink-0 text-liderlar-blue" aria-hidden />
          {[
            `Yutuqlar: ${weights.achievements}%`,
            `Oylik faollik: ${weights.monthly_activity}%`,
            `Faol liderlik: ${weights.active_leadership}%`,
          ].join(" · ")}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={<div className="h-11 w-72 animate-pulse rounded-full bg-navy/5" />}>
          <RankingCategoryTabs categories={categories} />
        </Suspense>
        <Suspense fallback={<div className="h-11 w-72 animate-pulse rounded-full bg-navy/5" />}>
          <RankingPeriodTabs />
        </Suspense>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="Bu davr uchun reyting ma'lumotlari yo'q"
          description="Supabase migratsiyalari qo'llanilib, recalculate_rankings() funksiyasi ishga tushirilgach, bu yerda natijalar ko'rinadi."
        />
      ) : (
        <>
          <div className="mt-12">
            <Podium rows={podiumRows} />
          </div>
          {restRows.length > 0 && (
            <div className="mt-12 space-y-3">
              {restRows.map((row) => (
                <RankingCard key={row.candidate_id} row={row} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
