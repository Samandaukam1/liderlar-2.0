import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isFeatureEnabled } from "@/lib/vip/entitlement-service";
import { getOnlineFeed } from "@/lib/data/liderlar-online";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ArticleCard } from "@/components/online/article-card";

export const metadata: Metadata = {
  title: "Liderlar Online — maqolalar",
  /*
   * SAHIFALANGAN RO'YXAT INDEKSLANMAYDI (§32).
   *
   * Ikkinchi, uchinchi sahifalar qidiruv natijalarida bosh sahifa
   * bilan raqobat qilardi va takroriy mazmun sifatida ko'rinardi.
   */
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function OnlineFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ keyin?: string }>;
}) {
  const enabled = await isFeatureEnabled("liderlar_online.enabled");
  if (!enabled) notFound();

  const { keyin } = await searchParams;
  const feed = await getOnlineFeed(12, keyin ?? null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Liderlar Online", href: "/liderlar-online" },
          { label: "Maqolalar" },
        ]}
      />

      <Link
        href="/liderlar-online"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-liderlar-blue"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Bosh sahifa
      </Link>

      {feed.items.length === 0 ? (
        <p className="py-20 text-center text-sm text-ink-soft">
          Bu yerda boshqa maqola yo&apos;q.
        </p>
      ) : (
        <div className="mt-6 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {feed.items.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {feed.nextCursor && (
        <div className="mt-10 text-center">
          <Link
            href={`/liderlar-online/sahifa?keyin=${encodeURIComponent(feed.nextCursor)}`}
            className="inline-block rounded-md border border-brand-soft px-5 py-2.5 text-sm font-semibold text-liderlar-blue transition hover:bg-ice/50"
          >
            Yana maqolalar
          </Link>
        </div>
      )}
    </div>
  );
}
