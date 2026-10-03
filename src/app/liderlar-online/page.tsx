import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/vip/entitlement-service";
import { getOnlineFeed } from "@/lib/data/liderlar-online";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MasonryFeed } from "@/components/online/masonry-feed";

export const metadata: Metadata = {
  title: "Liderlar Online",
  description: "Yangi avlod fikri, tajribasi va tashabbuslari.",
};

export const dynamic = "force-dynamic";

/**
 * LIDERLAR ONLINE — OMMAVIY NASHR (§28, §29).
 *
 * BO'LIM FLAG OSTIDA. `liderlar_online.enabled` o'chiq bo'lsa,
 * sahifa 404 qaytaradi — "tez kunda" sahifasi emas: bo'sh bo'lim
 * qidiruv tizimlariga ham, odamlarga ham keraksiz.
 */
export default async function LiderlarOnlinePage() {
  const enabled = await isFeatureEnabled("liderlar_online.enabled");
  if (!enabled) notFound();

  /*
   * BIRINCHI SAHIFA SERVERDA (tez ko'rinadi, qidiruvga ochiq), keyingilari
   * kursor bilan pastga aylantirilganda. Butun jadval hech qachon yuklanmaydi.
   */
  const feed = await getOnlineFeed(24);

  return (
    <div className="mx-auto max-w-[1800px] px-3 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Liderlar Online" }]} />

      <header className="mt-4 pb-6">
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">Liderlar Online</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">Yangi avlod fikri, tajribasi va tashabbuslari.</p>
      </header>

      {feed.items.length === 0 ? (
        /*
         * HALOL BO'SH HOLAT (§54, §71) — soxta maqola yo'q.
         */
        <div className="py-20 text-center">
          <p className="font-semibold text-navy">Hali maqola nashr qilinmagan.</p>
          <p className="mt-1 text-sm text-ink-soft">Birinchi maqolalar tez orada shu yerda chiqadi.</p>
        </div>
      ) : (
        <>
          <MasonryFeed initial={feed.items} initialCursor={feed.nextCursor} />
          {feed.nextCursor && (
            <noscript>
              <div className="mt-10 text-center">
                <Link
                  href={`/liderlar-online/sahifa?keyin=${encodeURIComponent(feed.nextCursor)}`}
                  className="inline-block rounded-md border border-brand-soft px-5 py-2.5 text-sm font-semibold text-liderlar-blue"
                >
                  Yana maqolalar
                </Link>
              </div>
            </noscript>
          )}
        </>
      )}
    </div>
  );
}
