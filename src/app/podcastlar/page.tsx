import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { getAllPodcasts } from "@/lib/data/podcasts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PodcastCard } from "@/components/cards/podcast-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Podcastlar",
  description: "Liderlar.uz podcastlari — yosh liderlar ishtirokidagi suhbatlar va efirlar.",
};

export default async function PodcastsPage() {
  const podcasts = await getAllPodcasts().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Podcastlar" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Podcastlar</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Yosh liderlar ishtirokidagi suhbatlar, efirlar va yozib olingan chiqishlar.
          </p>
        </div>
        <LinkButton href="/podcastlar/taqvim" variant="secondary">
          <CalendarRange className="h-4 w-4" aria-hidden />
          Taqvim ko&apos;rinishi
        </LinkButton>
      </div>

      {podcasts.length === 0 ? (
        <EmptyState className="mt-10" title="Hozircha podcastlar qo'shilmagan" />
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {podcasts.map((p) => (
            <PodcastCard key={p.id} podcast={p} />
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-ink-soft">
        Barcha chiqishlarni <Link href="/podcastlar/taqvim" className="font-semibold text-liderlar-blue">taqvim ko&apos;rinishida</Link> ham ko&apos;rishingiz mumkin.
      </p>
    </div>
  );
}
