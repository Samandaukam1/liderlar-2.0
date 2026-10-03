import { Suspense } from "react";
import type { Metadata } from "next";
import { getRankingCategories, getPeriodForFilter, getRankingLeaderboard, getRankingRegions, getRankingRules, type PeriodFilter } from "@/lib/data/ranking";
import { getChallengeHistory, getChallengeToday, tashkentDate } from "@/lib/data/daily-challenge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RankingCategoryTabs, RankingPeriodTabs } from "@/components/ranking/ranking-filters";
import { RankingExplainer } from "@/components/ranking/ranking-explainer";
import { DailyChallengeSection } from "@/components/ranking/daily-challenge-section";
import { Podium } from "@/components/ranking/podium";
import { RankingCard } from "@/components/cards/ranking-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Reytinglar",
  description:
    "Liderlar.uz reytingi: tasdiqlangan faoliyat va natijalar asosida. Qoidalar, umumiy reyting va Kunlik Premium Challenge.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function toStr(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * REYTINGLAR — SHAFFOF REYTING MARKAZI.
 *
 *   1. Reyting qanday shakllanadi (haqiqiy qoidalar, bazadan);
 *   2. Umumiy reyting (yagona dvigatel: `recalculate_rankings`);
 *   3. Kunlik Premium Challenge (alohida bellashuv — reyting balli bermaydi).
 *
 * Barcha bloklar PARALLEL yuklanadi.
 */
export default async function RankingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const now = new Date();
  const today = tashkentDate(now);
  const periodFilter = (toStr(sp.davr) ?? "barcha-vaqt") as PeriodFilter;
  const regionId = toStr(sp.hudud) ?? null;

  const [categories, period, rules, regions, challengeToday, challengeHistory] = await Promise.all([
    getRankingCategories().catch(() => []),
    getPeriodForFilter(periodFilter).catch(() => null),
    getRankingRules(),
    getRankingRegions().catch(() => []),
    getChallengeToday(now).catch(() => null),
    getChallengeHistory(today, 7).catch(() => []),
  ]);

  const categoryCode = toStr(sp.kategoriya) ?? categories[0]?.slug ?? "overall";
  const validRegion = regionId && regions.some((r) => r.id === regionId) ? regionId : null;
  const rows = period
    ? await getRankingLeaderboard(categoryCode, period.id, 100, validRegion).catch(() => [])
    : [];
  const podiumRows = validRegion ? [] : rows.slice(0, 3);
  const restRows = validRegion ? rows : rows.slice(3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Reytinglar" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Reytinglar</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Liderlar.uz reytingi platformadagi tasdiqlangan faoliyat va natijalar asosida shakllanadi.
      </p>

      <div className="mt-6">
        <RankingExplainer rules={rules} todayIso={today} />
      </div>

      <section className="mt-10" aria-labelledby="umumiy-reyting">
        <h2 id="umumiy-reyting" className="font-display text-2xl font-bold text-navy">Umumiy reyting</h2>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Suspense fallback={<div className="h-11 w-72 animate-pulse rounded-full bg-navy/5" />}>
            <RankingCategoryTabs categories={categories} />
          </Suspense>
          <Suspense fallback={<div className="h-11 w-72 animate-pulse rounded-full bg-navy/5" />}>
            <RankingPeriodTabs />
          </Suspense>
        </div>

        {regions.length > 0 && (
          <form method="get" className="mt-3 flex flex-wrap items-center gap-2">
            {toStr(sp.kategoriya) && <input type="hidden" name="kategoriya" value={toStr(sp.kategoriya)} />}
            {toStr(sp.davr) && <input type="hidden" name="davr" value={toStr(sp.davr)} />}
            <label htmlFor="hudud" className="text-sm text-ink-soft">
              Hudud:
            </label>
            <select
              id="hudud"
              name="hudud"
              defaultValue={validRegion ?? ""}
              className="h-10 min-w-0 flex-1 rounded-full border border-brand-soft bg-white px-4 text-sm text-navy sm:flex-none"
            >
              <option value="">Barcha hududlar</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 rounded-full bg-liderlar-blue px-4 text-sm font-semibold text-white transition hover:bg-electric-blue"
            >
              Ko‘rsatish
            </button>
          </form>
        )}
        {validRegion && (
          <p className="mt-2 text-xs text-ink-soft">O‘rinlar — umumiy reytingdagi o‘rni (hudud bo‘yicha alohida hisob yo‘q).</p>
        )}

        {rows.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="Reyting hali shakllanmagan"
            description="Bu tanlov bo‘yicha natija yo‘q. Reyting har soatda qayta hisoblanadi."
          />
        ) : (
          <>
            {podiumRows.length > 0 && (
              <div className="mt-10">
                <Podium rows={podiumRows} />
              </div>
            )}
            {restRows.length > 0 && (
              <div className="mt-8 space-y-3">
                {restRows.map((row) => (
                  <RankingCard key={row.candidate_id} row={row} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <div className="mt-12" id="premium-challenge">
        <DailyChallengeSection today={challengeToday} history={challengeHistory} />
      </div>
    </div>
  );
}
