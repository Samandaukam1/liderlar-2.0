"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ROYAL NAVY — mijoz qismi.
 *
 * Hero animatsiyasi sof CSS (skriptni kutmaydi). Bu yerda faqat skript
 * talab qiladigan narsa bor:
 *
 *   1. SUYUQ SHISHA LINZASI. Shisha chetida fonni sindirish (refraction)
 *      `backdrop-filter: url(#…)` bilan qilinadi va hozircha faqat Chromium
 *      buni to'g'ri chizadi. Safari va Firefox SVG filtrni e'tiborsiz
 *      qoldirmaydi — ular shishani BUTUNLAY o'chirib qo'yadi. Shuning
 *      uchun linza faqat Chromium aniqlanganda yoqiladi; qolganlarida oddiy
 *      xira shisha qoladi va u ham to'liq chiroyli.
 *   2. Kursorga ergashuvchi yorug'lik aksi va portret panelining yengil
 *      qiyalishi (fazoviy oyna kabi).
 *   3. Bo'limlar ochilishi va pastki suzuvchi navigatsiya.
 */

function reduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Linza yoqilsinmi.
 *
 * `userAgentData` faqat Chromium oilasida bor (Chrome, Edge, Opera,
 * Samsung) — Safari `CSS.supports` ga "ha" deb javob beradi-yu, filtrni
 * chizolmaydi, shuning uchun `supports` ning o'zi yetmaydi. Telefon va
 * planshetda o'chiq: filtr har kadrda qayta hisoblanadi va kuchsiz
 * qurilmada aylantirish sekinlashardi.
 */
function lensSupported(): boolean {
  if (!("userAgentData" in navigator)) return false;
  if (typeof CSS === "undefined" || !CSS.supports("backdrop-filter", "url(#rn-lens)")) return false;
  if (!window.matchMedia("(pointer: fine) and (min-width: 768px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-transparency: reduce)").matches) return false;
  return true;
}

export function RnMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-rn-root]");
    if (!root) return;
    root.setAttribute("data-rn-ready", "");
    if (lensSupported()) root.setAttribute("data-rn-lens", "");

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

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-rn-reveal]"));
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.setAttribute("data-rn-in", "");
                observer?.unobserve(entry.target);
              }
            },
            { rootMargin: "0px 0px -8% 0px" },
          )
        : null;
    targets.forEach((el) => (observer ? observer.observe(el) : el.setAttribute("data-rn-in", "")));

    /*
     * YORUG'LIK AKSI VA PORTRET QIYALISHI — faqat sichqoncha bilan.
     *
     * Bitta tinglovchi butun dizayn uchun (har shisha uchun alohida emas) va
     * kadrda bir martadan ko'p hisoblanmaydi.
     */
    const fine = window.matchMedia("(pointer: fine)").matches;
    const tilt = root.querySelector<HTMLElement>("[data-rn-tilt]");
    let frame = 0;
    let last: PointerEvent | null = null;
    let lit: HTMLElement | null = null;

    const paint = () => {
      frame = 0;
      const event = last;
      if (!event) return;

      const glass = (event.target as Element | null)?.closest?.<HTMLElement>(".rn-glass");
      if (lit && lit !== glass) lit.removeAttribute("data-rn-lit");
      if (glass && root.contains(glass)) {
        const box = glass.getBoundingClientRect();
        glass.style.setProperty("--mx", `${event.clientX - box.left}px`);
        glass.style.setProperty("--my", `${event.clientY - box.top}px`);
        glass.setAttribute("data-rn-lit", "");
        lit = glass;
      } else {
        lit = null;
      }

      if (tilt && !reduced()) {
        const box = tilt.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) / window.innerWidth;
        const dy = (event.clientY - (box.top + box.height / 2)) / window.innerHeight;
        /* Eng ko'pi 3° — fazoviy oyna kabi chuqurlik, lekin jiddiy. */
        tilt.style.setProperty("--ry", `${Math.max(-1, Math.min(1, dx * 2)) * 3}deg`);
        tilt.style.setProperty("--rx", `${Math.max(-1, Math.min(1, dy * 2)) * -2.5}deg`);
      }
    };
    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const onLeave = () => {
      lit?.removeAttribute("data-rn-lit");
      lit = null;
      tilt?.style.setProperty("--rx", "0deg");
      tilt?.style.setProperty("--ry", "0deg");
    };
    if (fine) {
      root.addEventListener("pointermove", onMove, { passive: true });
      root.addEventListener("pointerleave", onLeave);
    }

    return () => {
      observer?.disconnect();
      root.removeEventListener("click", onClick);
      if (fine) {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      }
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

/**
 * PASTKI SUZUVCHI NAVIGATSIYA — suyuq shisha "dok".
 *
 * Faqat keng ekranda (telefonda saytning o'z pastki menyusi bor) va faqat
 * hero ortda qolganda chiqadi. Faol bo'lim belgisi bandlar orasida
 * prujinali harakat bilan suriladi — shisha ichidagi tomchi kabi.
 */
export function RnDock({ items }: { items: { id: string; no: string; title: string }[] }) {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-rn-hero]");
    const outro = document.querySelector("[data-rn-outro]");
    const visible = new Map<Element, boolean>();
    const sync = () => setShown(!(hero && visible.get(hero)) && !(outro && visible.get(outro)));

    const edges = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      sync();
    });
    if (hero) edges.observe(hero);
    if (outro) edges.observe(outro);

    /* Ekran o'rtasidagi ingichka chiziqni kesib o'tgan bo'lim — faol. */
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) spy.observe(el);
    }

    return () => {
      edges.disconnect();
      spy.disconnect();
    };
  }, [items]);

  /* Faol band o'lchami — tomchi shu joyga suriladi. */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const link = active ? nav.querySelector<HTMLElement>(`[data-rn-dock="${CSS.escape(active)}"]`) : null;
    if (!link) {
      nav.style.setProperty("--rn-dw", "0px");
      return;
    }
    nav.style.setProperty("--rn-dx", `${link.offsetLeft}px`);
    nav.style.setProperty("--rn-dw", `${link.offsetWidth}px`);
    const list = link.closest("ol");
    if (list && (link.offsetLeft < list.scrollLeft || link.offsetLeft + link.offsetWidth > list.scrollLeft + list.clientWidth)) {
      list.scrollTo({ left: link.offsetLeft - 24, behavior: reduced() ? "auto" : "smooth" });
    }
  }, [active]);

  if (items.length < 2) return null;

  return (
    <nav
      ref={navRef}
      className="rn-dock rn-glass rn-lens rn-lens--wide"
      aria-label="Bo‘limlar"
      data-rn-shown={shown ? "" : undefined}
      inert={!shown}
    >
      <ol>
        <li className="rn-dock__drop" aria-hidden />
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-rn-dock={item.id}
              aria-current={active === item.id ? "true" : undefined}
            >
              <i>{item.no}</i>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * SHAXSIY PROMO KOD — portret ustida suzuvchi shisha panelda.
 *
 * Xatti-harakat umumiy `ProfilePromoCode` bilan bir xil: kod nusxalanadi,
 * havola `/ariza?ref=` ga kodni qo'yib olib boradi. Faqat ko'rinish boshqa.
 */
export function RnPromo({ code, name }: { code: string; name: string }) {
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
    <div className="rn-cap__side">
      <p className="rn-label">Promo kod</p>
      <button type="button" onClick={copy} className="rn-promo" aria-label={`Promo kodni nusxalash: ${code}`}>
        <span>{code}</span>
        {copied ? (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M3 8.5l3 3 7-7" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <rect x="5.5" y="5.5" width="8" height="8" rx="2" />
            <path d="M10.5 3H5A2 2 0 003 5v5.5" />
          </svg>
        )}
      </button>
      <a href={`/ariza?ref=${encodeURIComponent(code)}`} className="rn-promo__cta">
        {copied ? "Nusxalandi" : `${name.split(" ")[0]} taklifi bilan ariza →`}
      </a>
    </div>
  );
}

/** Ulashish — tizim oynasi yoki havolani nusxalash. */
export function RnShare({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  async function share() {
    const url = window.location.href.split(/[?#]/)[0];
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
    <button type="button" className="rn-btn rn-glass" onClick={share}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M10 2.5v10M6.5 6L10 2.5 13.5 6M4.5 10v5.5A1.5 1.5 0 006 17h8a1.5 1.5 0 001.5-1.5V10" />
      </svg>
      {done ? "Nusxalandi" : "Ulashish"}
    </button>
  );
}
