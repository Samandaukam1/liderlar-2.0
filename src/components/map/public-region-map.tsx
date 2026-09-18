"use client";

import * as React from "react";
import Link from "next/link";
import { UzbekistanMap } from "./uzbekistan-map";

export interface PublicRegionSummary {
  slug: string;
  name: string;
  hasCoordinator: boolean;
}

export interface PublicRegionDetail {
  slug: string;
  name: string;
  coordinators: Array<{
    fullName: string;
    photoUrl: string | null;
    publicPhone: string | null;
    publicEmail: string | null;
  }>;
  leaders: Array<{
    slug: string;
    fullName: string;
    photoUrl: string | null;
    descriptor: string | null;
  }>;
  totalLeaders: number;
}

/**
 * OMMAVIY XARITA.
 *
 * Bu ichki boshqaruv paneli EMAS: bu yerda lid, konversiya, talab
 * yoki komissiya ko'rsatilmaydi. Tashrifchi uchun savol boshqa —
 * "mening hududimda kim bor va qaysi liderlar chiqqan".
 *
 * Tafsilot TALAB BO'YICHA yuklanadi: butun mamlakat bo'yicha
 * koordinator va nomzod ma'lumotini oldindan yuborish ommaviy
 * sahifani og'irlashtirardi.
 */
export function PublicRegionMap({ regions }: { regions: PublicRegionSummary[] }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<PublicRegionDetail | null>(null);
  const [loading, setLoading] = React.useState(false);

  const states = React.useMemo(
    () =>
      Object.fromEntries(
        regions.map((r) => [
          r.slug,
          {
            state: r.hasCoordinator ? ("target_met" as const) : ("no_data" as const),
            statusLabel: r.hasCoordinator ? "Koordinator bor" : "Koordinator biriktirilmagan",
          },
        ]),
      ),
    [regions],
  );

  const select = React.useCallback(async (slug: string) => {
    setSelected(slug);
    setDetail(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/hududlar/${slug}`);
      setDetail(res.ok ? await res.json() : null);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl border border-brand-soft bg-paper p-4">
        <UzbekistanMap
          states={states}
          selectedSlug={selected}
          onSelect={select}
          ariaLabel="O‘zbekiston hududlari — hududiy vakillik xaritasi"
        />
      </div>

      <div className="rounded-2xl border border-brand-soft bg-paper p-5">
        {!selected ? (
          <p className="text-sm text-ink-soft">
            Hududni tanlang — hududiy vakil va o‘sha hududdan chiqqan liderlar
            shu yerda ko‘rinadi.
          </p>
        ) : loading ? (
          <p className="text-sm text-ink-soft">Yuklanmoqda…</p>
        ) : !detail ? (
          <p className="text-sm text-ink-soft">Bu hudud bo‘yicha ma’lumot topilmadi.</p>
        ) : (
          <div>
            <h2 className="font-display text-xl font-bold uppercase text-navy">{detail.name}</h2>

            <section className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">
                Hududiy vakillik
              </p>
              {detail.coordinators.length === 0 ? (
                <p className="mt-1 text-sm text-ink-soft">
                  Bu hudud uchun koordinator hali biriktirilmagan.
                </p>
              ) : (
                <ul className="mt-2 space-y-3">
                  {detail.coordinators.map((c) => (
                    <li key={c.fullName} className="flex items-center gap-3">
                      {c.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <span className="h-12 w-12 rounded-full bg-brand-soft" aria-hidden />
                      )}
                      <span>
                        <span className="block text-sm font-bold text-navy">{c.fullName}</span>
                        {/* Faqat ochiq deb belgilangan kontakt. */}
                        {c.publicPhone ? (
                          <a href={`tel:${c.publicPhone}`} className="block text-xs text-brand">
                            {c.publicPhone}
                          </a>
                        ) : null}
                        {c.publicEmail ? (
                          <span className="block text-xs text-ink-soft">{c.publicEmail}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-5 border-t border-brand-soft pt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">
                Hudud liderlari
              </p>
              {detail.leaders.length === 0 ? (
                <p className="mt-1 text-sm text-ink-soft">
                  Bu hududdan hali lider chop etilmagan.
                </p>
              ) : (
                <>
                  <ul className="mt-2 space-y-2">
                    {detail.leaders.map((leader) => (
                      <li key={leader.slug}>
                        <Link
                          href={`/liderlar/${leader.slug}`}
                          className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-brand-soft/30"
                        >
                          {leader.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={leader.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <span className="h-10 w-10 rounded-full bg-brand-soft" aria-hidden />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-navy">
                              {leader.fullName}
                            </span>
                            {leader.descriptor ? (
                              <span className="block truncate text-xs text-ink-soft">
                                {leader.descriptor}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {detail.totalLeaders > detail.leaders.length ? (
                    <Link
                      href={`/nomzodlar?region=${detail.slug}`}
                      className="mt-3 inline-block text-sm font-semibold text-brand"
                    >
                      Barchasini ko‘rish ({detail.totalLeaders})
                    </Link>
                  ) : null}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
