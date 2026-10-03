import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/vip/entitlement-service";
import { getOnlineFeed } from "@/lib/data/liderlar-online";
import { formatDateUz } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ArticleCard } from "@/components/online/article-card";

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

  const feed = await getOnlineFeed(13);

  const [featured, ...rest] = feed.items;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Liderlar Online" }]} />

      <header className="mt-4 border-b border-brand-soft pb-6">
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
          Liderlar Online
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Yangi avlod fikri, tajribasi va tashabbuslari.
        </p>
      </header>

      {!featured ? (
        /*
         * HALOL BO'SH HOLAT (§54, §71).
         *
         * Soxta maqola yoki "tez kunda 100 maqola" degan yozuv yo'q.
         */
        <div className="py-20 text-center">
          <p className="font-semibold text-navy">Hali maqola nashr qilinmagan.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Birinchi maqolalar tez orada shu yerda chiqadi.
          </p>
        </div>
      ) : (
        <>
          {/* ASOSIY MAQOLA — katta banner (§29). */}
          <section className="mt-8">
            <Link href={`/liderlar-online/${featured.slug}`} className="group block">
              <span className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-paper sm:aspect-[21/9]">
                <Image
                  src={featured.heroUrl}
                  alt={featured.heroAlt ?? ""}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1152px"
                  priority
                  className="object-cover transition duration-300 group-hover:scale-[1.01]"
                />
              </span>

              <h2 className="mt-4 max-w-4xl font-display text-2xl font-bold leading-tight text-navy text-balance group-hover:text-liderlar-blue sm:text-3xl md:text-4xl">
                {featured.title}
              </h2>

              {featured.subtitle && (
                <p className="mt-2 max-w-3xl text-ink-soft sm:text-lg">
                  {featured.subtitle}
                </p>
              )}

              <p className="mt-3 text-sm text-ink-soft">
                {featured.author.name} · {formatDateUz(featured.publishedAt)}
              </p>
            </Link>
          </section>

          {rest.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                So&apos;nggi maqolalar
              </h2>

              <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {feed.nextCursor && (
            /*
             * SAHIFALASH HAVOLA BILAN, "yana yuklash" tugmasi emas.
             *
             * Havola qidiruv tizimi uchun ham ochiq va JavaScript
             * ishlamasa ham ishlaydi.
             */
            <div className="mt-10 text-center">
              <Link
                href={`/liderlar-online/sahifa?keyin=${encodeURIComponent(feed.nextCursor)}`}
                className="inline-block rounded-md border border-brand-soft px-5 py-2.5 text-sm font-semibold text-liderlar-blue transition hover:bg-ice/50"
              >
                Yana maqolalar
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
