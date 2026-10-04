"use client";

import { useEffect, useState } from "react";
import { ListOrdered } from "lucide-react";
import type { OutlineItem } from "@/lib/articles/reading";

/**
 * MUNDARIJA — joriy bo'lim belgilanadi.
 *
 * FAOL BO'LIM — SCROLL HOLATIDAN: sayt sarlavhasi ostidagi chiziqdan
 * yuqoriga o'tgan OXIRGI sarlavha. `IntersectionObserver` bilan
 * qilingan avvalgi variant tez sakrashda (mundarija havolasi, "End"
 * tugmasi) hech qaysi sarlavhani ushlamay, eski bo'limni faol qoldirardi
 * — maqola oxirida ham "birinchi bo'lim" yonib turardi. Hisob
 * `requestAnimationFrame` da, kadrga bir marta.
 *
 * `variant="rail"` — kompyuterda o'ng ustunda yopishqoq ro'yxat;
 * `variant="inline"` — telefonda matn oldidan yig'iladigan blok.
 */
export function ReaderToc({ items, variant }: { items: OutlineItem[]; variant: "rail" | "inline" }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // Sayt sarlavhasi (≈64–76px) va biroz nafas — shu chiziqdan o'tgani "o'qilmoqda".
    const LINE = 140;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = headings[0]!.id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= LINE) current = heading.id;
        else break;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  if (items.length === 0) return null;

  const list = (
    <ol className="space-y-1">
      {items.map((item) => {
        const current = item.id === active;
        return (
          <li key={item.id} className={item.level === 3 ? "pl-3" : undefined}>
            <a
              href={`#${item.id}`}
              aria-current={current ? "location" : undefined}
              className={`block border-l-2 py-1 pl-3 text-[0.82rem] leading-snug transition ${
                current
                  ? "border-liderlar-blue font-semibold text-navy"
                  : "border-transparent text-ink-soft hover:border-liderlar-blue/30 hover:text-navy"
              }`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "rail") {
    return (
      <nav aria-label="Mundarija">
        <p className="mb-3 flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink-soft">
          <ListOrdered className="h-3.5 w-3.5" aria-hidden />
          Mundarija
        </p>
        {list}
      </nav>
    );
  }

  return (
    <details className="group rounded-xl border border-brand-soft bg-white/70 px-4 py-3 open:pb-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-navy">
        <span className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-liderlar-blue" aria-hidden />
          Mundarija
        </span>
        <span className="text-xs font-normal text-ink-soft group-open:hidden">{items.length} bo&apos;lim</span>
      </summary>
      <nav aria-label="Mundarija" className="mt-3">
        {list}
      </nav>
    </details>
  );
}
