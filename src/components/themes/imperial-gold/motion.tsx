"use client";

import { useEffect, useRef, useState } from "react";

/**
 * IMPERIAL GOLD — HARAKAT (mijoz qismi).
 *
 * Hero animatsiyasi sof CSS — u skriptni kutmaydi. Bu yerda faqat skript
 * talab qiladigan ikki narsa bor:
 *
 *   1. Bo'limlar ekranga kirganda ochilishi (`data-ig-reveal` -> `data-ig-in`).
 *   2. Bob navigatsiyasida faol bo'lim va uning ostidagi tilla chiziq.
 *
 * `prefers-reduced-motion` CSS'da hal qilinadi: u yoqilgan bo'lsa,
 * elementlar umuman yashirilmaydi, ya'ni bu skript ularni "ochsa" ham
 * hech narsa ko'rinmay o'zgarmaydi.
 */

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function IgMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-ig-root]");
    if (!root) return;
    root.setAttribute("data-ig-ready", "");

    /*
     * ICHKI HAVOLALAR SILLIQ AYLANADI — `html { scroll-behavior }` global
     * bo'lardi, shuning uchun faqat shu dizayn ichidagi `#…` havolalar.
     */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!link || !root.contains(link)) return;
      const id = decodeURIComponent(link.getAttribute("href")?.slice(1) ?? "");
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    };
    root.addEventListener("click", onClick);

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-ig-reveal]:not([data-ig-in])"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.setAttribute("data-ig-in", ""));
      return () => root.removeEventListener("click", onClick);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-ig-in", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      root.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}

export interface IgNavItem {
  id: string;
  label: string;
}

export function IgSectionNav({ items }: { items: IgNavItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);

  /*
   * FAOL BO'LIM — ko'rish chizig'idan (ekran balandligining ~35%) yuqorida
   * boshlangan oxirgi bo'lim. Sahifa oxiriga yetilganda oxirgi bo'lim faol
   * bo'ladi — aks holda qisqa oxirgi bo'lim hech qachon belgilanmasdi.
   */
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && current) current = items[items.length - 1]?.id ?? current;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  /* Tilla chiziq faol havola ostiga suriladi; mobilda havola ko'rinishga keladi. */
  useEffect(() => {
    const track = trackRef.current;
    const ink = inkRef.current;
    if (!track || !ink) return;
    const link = active ? track.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`) : null;
    if (!link) {
      ink.style.setProperty("--ig-ink-o", "0");
      return;
    }
    ink.style.setProperty("--ig-ink-x", `${link.offsetLeft}px`);
    ink.style.setProperty("--ig-ink-w", `${link.offsetWidth}px`);
    ink.style.setProperty("--ig-ink-o", "1");

    const target = link.offsetLeft - (track.clientWidth - link.offsetWidth) / 2;
    track.scrollTo({ left: Math.max(0, target), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [active]);

  return (
    <nav className="ig-nav" aria-label="Profil bo‘limlari">
      <div ref={trackRef} className="ig-wrap ig-nav__track">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active === item.id ? "true" : undefined}
          >
            {item.label}
          </a>
        ))}
        <span ref={inkRef} className="ig-nav__ink" aria-hidden />
      </div>
    </nav>
  );
}
