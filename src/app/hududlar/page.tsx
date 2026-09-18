import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PublicRegionMap } from "@/components/map/public-region-map";
import { getRegionsWithCoordinatorFlag } from "@/lib/data/regions-public";

export const metadata: Metadata = {
  title: "Hududlar",
  description:
    "O‘zbekiston hududlari bo‘yicha Liderlar.uz vakillari va hudud liderlari.",
};

export const dynamic = "force-dynamic";

export default async function RegionsPage() {
  const regions = await getRegionsWithCoordinatorFlag();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Hududlar" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Hududlar</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Xaritadan hududni tanlang — hududiy vakil va o‘sha hududdan chiqqan
        liderlar bilan tanishing.
      </p>

      <div className="mt-8">
        <PublicRegionMap regions={regions} />
      </div>
    </div>
  );
}
