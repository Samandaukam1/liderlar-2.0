"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * EMERALD LEGACY — mijoz qismi.
 *
 * Hero animatsiyasi sof CSS (skriptni kutmaydi). Bu yerda faqat skript
 * talab qiladigan narsa bor: bo'lim ochilishi, portretning yengil
 * chuqurlik harakati va gorizontal lentalarning tugmalari.
 */

function reduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ElMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-el-root]");
    if (!root) return;
    root.setAttribute("data-el-ready", "");

    /* Ichki `#` havolalar silliq — global `scroll-behavior` qo'yilmaydi. */
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

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-el-reveal]"));
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.setAttribute("data-el-in", "");
                observer?.unobserve(entry.target);
              }
            },
            { rootMargin: "0px 0px -8% 0px" },
          )
        : null;
    targets.forEach((el) => (observer ? observer.observe(el) : el.setAttribute("data-el-in", "")));

    /*
     * CHUQURLIK: portret sahifa bilan birga, lekin SEKINROQ suriladi.
     * Harakat juda kichik (eng ko'pi 40px) — bu "parallaks effekti" emas,
     * qatlamlar orasida havo borligini bildiradigan belgi.
     */
    const portrait = root.querySelector<HTMLElement>("[data-el-parallax]");
    let frame = 0;
    const onScroll = () => {
      if (frame || !portrait) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const shift = Math.min(window.scrollY * 0.08, 40);
        portrait.style.setProperty("--el-shift", `${shift}px`);
      });
    };
    const canParallax = portrait && !reduced() && window.matchMedia("(min-width: 1080px)").matches;
    if (canParallax) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      observer?.disconnect();
      root.removeEventListener("click", onClick);
      if (canParallax) window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

/** Gorizontal lenta boshqaruvi (vaqt o'qi va media lentasi uchun). */
export function ElRail({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const step = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 260), behavior: reduced() ? "auto" : "smooth" });
  };

  return (
    <>
      <div className="el-rail-ctrl">
        <button type="button" onClick={() => step(-1)} disabled={edge.start} aria-label={`${label}: orqaga`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <button type="button" onClick={() => step(1)} disabled={edge.end} aria-label={`${label}: oldinga`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>
      <div ref={ref} className="el-rail-scroller">
        {children}
      </div>
    </>
  );
}

/**
 * PORTRET.
 *
 * Nomzodning RANGLI surati ko'rsatiladi. Agar Post Studio kesmasi shu
 * suratga AYNAN mos tushsa (nisbati bir xil), u alfa NIQOB sifatida
 * qo'llanadi va portret fonsiz chiqadi.
 *
 * Nega moslik brauzerda o'lchanadi: bazadagi "manba = profil rasmi"
 * yozuvi yetarli emas — kesma ba'zan qirqilgan holda saqlangan va
 * nisbati boshqacha bo'lib qoladi. Bunday niqob yuzni surib, portretni
 * buzib ko'rsatardi. Shuning uchun avval ramkali ko'rinish chiziladi,
 * o'lchov tasdiqlansa — yumshoq o'tish bilan fonsiz ko'rinishga o'tadi.
 */
export function ElPortrait({
  src,
  cutout,
  alt,
}: {
  src: string;
  cutout: string | null;
  alt: string;
}) {
  const [masked, setMasked] = useState(false);

  useEffect(() => {
    if (!cutout) return;
    let cancelled = false;
    const probe = (url: string) =>
      new Promise<number | null>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : null);
        img.onerror = () => resolve(null);
        img.src = url;
      });

    void Promise.all([probe(src), probe(cutout)]).then(([photo, cut]) => {
      if (cancelled || !photo || !cut) return;
      // 1% chidamlilik: optimizator yaxlitlashi nisbatni arzimas o'zgartiradi.
      if (Math.abs(photo - cut) / photo < 0.01) setMasked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [src, cutout]);

  return (
    <span
      className={`el-portrait__frame ${masked ? "el-portrait__frame--cut" : "el-portrait__frame--photo"}`}
      style={masked && cutout ? ({ "--el-cut": `url("${cutout}")` } as CSSProperties) : undefined}
    >
      <Image src={src} alt={alt} fill preload sizes="(min-width: 1080px) 620px, 94vw" />
      {!masked && <span className="el-portrait__veil" aria-hidden />}
    </span>
  );
}

/**
 * SHAXSIY PROMO KOD — hero'ning o'ng ustunida.
 *
 * Xatti-harakat umumiy `ProfilePromoCode` bilan bir xil: kod nusxalanadi,
 * havola `/ariza?ref=` ga kodni qo'yib olib boradi. Faqat ko'rinish boshqa.
 */
export function ElPromo({ code, name }: { code: string; name: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ruxsat yo'q — kod baribir ekranda.
    }
  }
  return (
    <div className="el-promo">
      <p className="el-promo__k">Promo kod</p>
      <button type="button" onClick={copy} className="el-promo__code" aria-label={`Promo kodni nusxalash: ${code}`}>
        <span>{code}</span>
        {copied ? (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M3 8.5l3 3 7-7" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
            <rect x="5.5" y="5.5" width="8" height="8" />
            <path d="M10.5 3H3v7.5" />
          </svg>
        )}
      </button>
      <a href={`/ariza?ref=${encodeURIComponent(code)}`} className="el-promo__cta">
        {name.split(" ")[0]} taklifi bilan ariza →
      </a>
    </div>
  );
}

/** Ulashish — tizim oynasi yoki havolani nusxalash. */
export function ElShare({ name }: { name: string }) {
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
      // Foydalanuvchi bekor qildi yoki ruxsat yo'q.
    }
  }
  return (
    <button type="button" className="el-btn" onClick={share}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <circle cx="15" cy="4.5" r="2.2" />
        <circle cx="5" cy="10" r="2.2" />
        <circle cx="15" cy="15.5" r="2.2" />
        <path d="M7 9l6-3.4M7 11l6 3.4" />
      </svg>
      {done ? "Nusxalandi" : "Ulashish"}
    </button>
  );
}
