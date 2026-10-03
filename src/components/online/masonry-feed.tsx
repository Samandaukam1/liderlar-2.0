"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { OnlineCard } from "@/lib/data/liderlar-online";
import { heroAspect } from "@/lib/articles/hero-rules";

/**
 * LIDERLAR ONLINE — RASM-BIRINCHI MASONRY LENTA.
 *
 * USTUNLAR EKRANGA QARAB: telefon 2 (tor ekranda 1), planshet 3, kompyuter 4,
 * katta ekran 5. Ustunlar soni majburlanmaydi — rasm mayda bo'lib qolmasin.
 *
 * NEGA JS BILAN TAQSIMLASH, CSS `columns` EMAS: `columns` yangi sahifa
 * qo'shilganda HAMMA kartochkani qayta joylaydi (ko'rib turgan joy
 * sakraydi). Bu yerda yangi kartochka eng qisqa ustunga qo'shiladi —
 * mavjudlari joyidan qimirlamaydi. Balandlik oldindan ma'lum (rasm
 * o'lchami bazada) — yuklanganda sakrash yo'q.
 *
 * TARMOQ: rasmlar `next/image` orqali — ustun kengligiga mos variant,
 * lazy; asl fayl Supabase'dan har o'quvchiga yuborilmaydi. Faqat birinchi
 * qator `priority`.
 */

function columnsFor(width: number): number {
  if (width >= 1536) return 5;
  if (width >= 1200) return 4;
  if (width >= 768) return 3;
  if (width >= 360) return 2;
  return 1;
}

const SIZES = "(min-width: 1536px) 18vw, (min-width: 1200px) 23vw, (min-width: 768px) 31vw, (min-width: 360px) 48vw, 96vw";

export function MasonryFeed({ initial, initialCursor }: { initial: OnlineCard[]; initialCursor: string | null }) {
  const [items, setItems] = useState<OnlineCard[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  // SSR va birinchi render — 2 ustun; o'lchov mount'dan keyin.
  const [columns, setColumns] = useState(2);
  const sentinel = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    const update = () => setColumns(columnsFor(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/liderlar-online?keyin=${encodeURIComponent(cursor)}`);
      if (!res.ok) throw new Error(String(res.status));
      const page = (await res.json()) as { items: OnlineCard[]; nextCursor: string | null };
      // Takror kartochka bo'lmasin (tarmoq qayta urinishi va h.k.).
      setItems((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        return [...prev, ...page.items.filter((a) => !seen.has(a.id))];
      });
      setCursor(page.nextCursor);
    } catch {
      setFailed(true);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !cursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  // Har kartochka eng qisqa ustunga (balandlik = 1 / nisbat).
  const lanes = useMemo(() => {
    const result: { card: OnlineCard; index: number }[][] = Array.from({ length: columns }, () => []);
    const heights = Array(columns).fill(0) as number[];
    items.forEach((card, index) => {
      let target = 0;
      for (let i = 1; i < columns; i++) if (heights[i] < heights[target]) target = i;
      result[target].push({ card, index });
      heights[target] += 1 / heroAspect(card.heroWidth, card.heroHeight) + 0.18; // + sarlavha joyi
    });
    return result;
  }, [items, columns]);

  return (
    <div>
      <div className="flex gap-3 sm:gap-4">
        {lanes.map((lane, laneIndex) => (
          <div key={laneIndex} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
            {lane.map(({ card, index }) => {
              const aspect = heroAspect(card.heroWidth, card.heroHeight);
              return (
                <Link
                  key={card.id}
                  href={`/liderlar-online/${card.slug}`}
                  className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-liderlar-blue"
                  aria-label={`${card.title} — ${card.author.name}`}
                >
                  <span className="relative block overflow-hidden rounded-2xl bg-paper" style={{ aspectRatio: String(aspect) }}>
                    <Image
                      src={card.heroUrl}
                      alt={card.heroAlt ?? ""}
                      fill
                      sizes={SIZES}
                      priority={index < columns}
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    {/* Kompyuterda — yengil ma'lumot hover'da; telefonda hover'ga tayanilmaydi (pastda sarlavha). */}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 pt-10 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-white">{card.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-white/80">{card.author.name}</span>
                    </span>
                  </span>
                  <span className="mt-1.5 line-clamp-2 px-0.5 text-[0.8rem] font-semibold leading-snug text-navy lg:hidden">
                    {card.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div ref={sentinel} aria-hidden className="h-px" />
      <div className="mt-6 text-center text-sm text-ink-soft" aria-live="polite">
        {loading && "Yuklanmoqda…"}
        {failed && (
          <button type="button" onClick={() => void loadMore()} className="font-semibold text-liderlar-blue underline">
            Yuklab bo‘lmadi — qayta urinish
          </button>
        )}
        {!cursor && items.length > 0 && "Barcha maqolalar ko‘rsatildi."}
      </div>
    </div>
  );
}
