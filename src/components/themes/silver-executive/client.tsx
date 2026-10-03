"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";

/**
 * SILVER EXECUTIVE — mijoz qismi.
 *
 *   1. Portret foni bilan sahifa birlashadi: rasm chetidagi rang o'qiladi va
 *      hero foni shu rangga o'tadi — to'rtburchak chegara ko'rinmaydi.
 *   2. Bo'limlar ekranga kirganda ochiladi; bo'lim navigatsiyasi faol bandni
 *      belgilaydi.
 *
 * Rasm `/_next/image` orqali (o'z domenimiz) keladi, shuning uchun canvas
 * uni o'qiy oladi. O'qib bo'lmasa — standart och kumush fon qoladi.
 */

function reduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Rasmning yuqori va yon chetlaridagi o'rtacha rang. */
function edgeColor(img: HTMLImageElement): string | null {
  try {
    const size = 48;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let r = 0, g = 0, b = 0, n = 0;
    const take = (x: number, y: number) => {
      const i = (y * size + x) * 4;
      if (data[i + 3] < 200) return;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n += 1;
    };
    // Yuqori qatorning o'ng yarmi va o'ng ustun: chap chetda ko'pincha bayroq
    // yoki boshqa narsa turadi, o'ng tomon esa odatda toza fon.
    for (let x = Math.floor(size / 2); x < size; x++) { take(x, 0); take(x, 1); }
    for (let y = 0; y < size * 0.6; y++) { take(size - 1, y); take(size - 2, y); }
    if (n === 0) return null;
    return `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`;
  } catch {
    return null;
  }
}

export function SePortrait({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const color = edgeColor(event.currentTarget);
    const hero = ref.current?.closest<HTMLElement>("[data-se-hero]");
    if (color && hero) hero.style.setProperty("--se-edge", color);
  };
  return (
    <div ref={ref} className="se-portrait">
      <Image
        src={src}
        alt={alt}
        fill
        preload
        sizes="(min-width: 1024px) 46vw, 100vw"
        onLoad={onLoad}
      />
    </div>
  );
}

export function SeMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-se-root]");
    if (!root) return;
    root.setAttribute("data-se-ready", "");

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!link || !root.contains(link)) return;
      const id = decodeURIComponent(link.getAttribute("href")?.slice(1) ?? "");
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    };
    root.addEventListener("click", onClick);

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-se-reveal]"));
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.setAttribute("data-se-in", "");
                observer?.unobserve(entry.target);
              }
            },
            { rootMargin: "0px 0px -8% 0px" },
          )
        : null;
    targets.forEach((el) => (observer ? observer.observe(el) : el.setAttribute("data-se-in", "")));
    return () => {
      observer?.disconnect();
      root.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}

/** Bo'lim navigatsiyasi: desktopda chap ustun, mobilda gorizontal chiplar. */
export function SeNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.32;
      let current = items[0]?.id ?? null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = items[items.length - 1]?.id ?? current;
      }
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

  useEffect(() => {
    const list = listRef.current;
    const link = active ? list?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`) : null;
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2, behavior: reduced() ? "auto" : "smooth" });
  }, [active]);

  return (
    <nav className="se-nav" aria-label="Profil bo‘limlari">
      <ul ref={listRef}>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={active === item.id ? "true" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Ulashish — haqiqiy amal: tizim oynasi yoki havolani nusxalash. */
export function SeShare({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  async function share() {
    const url = window.location.href.split("?")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } catch {
      // Foydalanuvchi bekor qildi yoki ruxsat yo'q — hech narsa qilinmaydi.
    }
  }
  return (
    <button type="button" className="se-btn se-btn--ghost" onClick={share}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="15" cy="4.5" r="2.2" /><circle cx="5" cy="10" r="2.2" /><circle cx="15" cy="15.5" r="2.2" />
        <path d="M7 9l6-3.4M7 11l6 3.4" />
      </svg>
      {done ? "Nusxalandi" : "Ulashish"}
    </button>
  );
}
