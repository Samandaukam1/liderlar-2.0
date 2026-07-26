import { Suspense } from "react";
import type { Metadata } from "next";
import { getCandidates, type CandidateFilters } from "@/lib/data/candidates";
import { getRegions, getDirections } from "@/lib/data/reference";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { LeaderCard } from "@/components/cards/leader-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Liderlar katalogi",
  description:
    "O'zbekistonning faol, iqtidorli va yetakchi yoshlari katalogi. Hudud, yo'nalish va reyting bo'yicha qidiring.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function toStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const SORT_MAP: Record<string, CandidateFilters["sort"]> = {
  reyting: "reyting",
  "eng-yangi": "eng-yangi",
  "eng-kop-oqilgan": "eng-kop-oqilgan",
  alifbo: "alifbo",
};

export default async function LiderlarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(toStr(sp.page) ?? "1") || 1;

  const filters: CandidateFilters = {
    q: toStr(sp.q),
    regionSlug: toStr(sp.hudud),
    directionSlug: toStr(sp.yonalish),
    birthYear: toStr(sp.tugilgan_yil) ? Number(toStr(sp.tugilgan_yil)) : undefined,
    sort: SORT_MAP[toStr(sp.saralash) ?? "reyting"],
    page,
    perPage: 12,
  };

  const [{ items, totalPages }, regions, directions] = await Promise.all([
    getCandidates(filters).catch(() => ({ items: [], total: 0, page: 1, perPage: 12, totalPages: 1 })),
    getRegions().catch(() => []),
    getDirections().catch(() => []),
  ]);

  function buildHref(p: number) {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, Array.isArray(v) ? v[0] : v);
    });
    params.set("page", String(p));
    return `/liderlar?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Liderlar" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Liderlar katalogi</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        O&apos;zbekistonning faol, iqtidorli va yetakchi yoshlari — hudud, yo&apos;nalish va reyting bo&apos;yicha qidiring.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="mb-8 h-24 animate-pulse rounded-lg bg-navy/5" />}>
          <CatalogFilters
            regions={regions.map((r) => ({ value: r.slug, label: r.name }))}
            directions={directions.map((d) => ({ value: d.slug, label: d.name }))}
          />
        </Suspense>

        {items.length === 0 ? (
          <EmptyState
            title="Hech narsa topilmadi"
            description="Filtrlarni o'zgartirib ko'ring yoki Supabase ma'lumotlar bazasi hali to'ldirilmagan bo'lishi mumkin."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((c) => (
              <LeaderCard key={c.id} candidate={c} />
            ))}
          </div>
        )}

        <div className="mt-10">
          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}
