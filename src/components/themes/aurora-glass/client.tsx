"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

/**
 * AURORA GLASS — mijoz qismi.
 *
 * Hero animatsiyasi sof CSS (skriptni kutmaydi). Bu yerda faqat skript
 * talab qiladigan narsa bor: bo'lim ochilishi, rangli portret, ulashish
 * va promo kodni nusxalash.
 *
 * Rangli portret mantig'i Obsidian'dagi bilan bir xil, lekin ataylab shu
 * yerda nusxa: dizaynlar bir-biriga bog'lanmasin — biri o'zgarsa, boshqasi
 * buzilmasin.
 */

function reduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Linza (chetdagi sinish) yoqilsinmi.
 *
 * `backdrop-filter: url(#…)` ni faqat Chromium to'g'ri chizadi; Safari
 * `supports` ga "ha" deydi-yu, shishani butunlay o'chirib qo'yadi — shuning
 * uchun `userAgentData` (faqat Chromium'da bor) ham tekshiriladi. Telefonda
 * o'chiq: filtr har kadrda qayta hisoblanadi.
 */
function lensSupported(): boolean {
  if (!("userAgentData" in navigator)) return false;
  if (typeof CSS === "undefined" || !CSS.supports("backdrop-filter", "url(#au-lens)")) return false;
  if (!window.matchMedia("(pointer: fine) and (min-width: 768px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-transparency: reduce)").matches) return false;
  return true;
}

export function AuMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-au-root]");
    if (!root) return;
    root.setAttribute("data-au-ready", "");
    if (lensSupported()) root.setAttribute("data-au-lens", "");

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

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-au-reveal]"));
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.setAttribute("data-au-in", "");
                observer?.unobserve(entry.target);
              }
            },
            { rootMargin: "0px 0px -8% 0px" },
          )
        : null;
    targets.forEach((el) => (observer ? observer.observe(el) : el.setAttribute("data-au-in", "")));

    /*
     * YORUG'LIK AKSI — kursorga ergashadi, faqat sichqoncha bilan. Bitta
     * tinglovchi butun dizayn uchun, kadrda bir martadan ko'p hisoblanmaydi.
     */
    const fine = window.matchMedia("(pointer: fine)").matches;
    let frame = 0;
    let last: PointerEvent | null = null;
    let lit: HTMLElement | null = null;
    const paint = () => {
      frame = 0;
      const event = last;
      if (!event) return;
      const glass = (event.target as Element | null)?.closest?.<HTMLElement>(".au-glass");
      if (lit && lit !== glass) lit.removeAttribute("data-au-lit");
      if (glass && root.contains(glass)) {
        const box = glass.getBoundingClientRect();
        glass.style.setProperty("--mx", `${event.clientX - box.left}px`);
        glass.style.setProperty("--my", `${event.clientY - box.top}px`);
        glass.setAttribute("data-au-lit", "");
        lit = glass;
      } else {
        lit = null;
      }
    };
    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const onLeave = () => {
      lit?.removeAttribute("data-au-lit");
      lit = null;
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

/* ========================================================================= *
 * RANGLI PORTRET
 * ========================================================================= */

/** O'z domenimizdagi optimallashtirilgan rasm — canvas uni o'qiy oladi. */
function optimized(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Post Studio kesmani shu qoida bilan yasaydi (admin `portrait.ts`):
 * manba eng uzun tomoni 1400px ga sig'diriladi (kattalashtirilmaydi), so'ng
 * shaffof chetlari qirqiladi. Qirqim joyi saqlanmaydi — shuning uchun u
 * shu yerda topiladi.
 */
const CUTOUT_MAX_EDGE = 1400;

interface Fit {
  /** Ishchi rasm o'lchami (kesma pikselida). */
  w: number;
  h: number;
  /** Kesmaning ishchi rasmdagi chap-yuqori burchagi. */
  x: number;
  y: number;
}

function pixels(img: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const luma = new Float32Array(width * height);
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < luma.length; i++) {
    luma[i] = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
    alpha[i] = data[i * 4 + 3];
  }
  return { luma, alpha, width, height };
}

/**
 * Kesma qirqib olingan joyni topadi: oq-qora kesmaning yorqinligi rangli
 * suratning yorqinligiga eng yaqin tushgan siljish. Avval qo'pol, so'ng
 * aniq o'lchamda. Mos kelmasa — `null`, ya'ni oq-qora kesma qoladi.
 */
function locate(avatar: HTMLImageElement, cutout: HTMLImageElement, cw: number, ch: number): Fit | null {
  const W = avatar.naturalWidth;
  const H = avatar.naturalHeight;
  if (!W || !H) return null;
  const s = Math.min(1, CUTOUT_MAX_EDGE / Math.max(W, H));
  const w = Math.round(W * s);
  const h = Math.round(H * s);
  if (cw > w + 2 || ch > h + 2) return null;

  const search = (f: number, x0: number, x1: number, y0: number, y1: number, step: number) => {
    const A = pixels(avatar, Math.max(1, Math.round(w * f)), Math.max(1, Math.round(h * f)));
    const C = pixels(cutout, Math.max(1, Math.round(cw * f)), Math.max(1, Math.round(ch * f)));
    if (!A || !C) return null;
    const points: number[] = [];
    for (let py = 0; py < C.height; py += step) {
      for (let px = 0; px < C.width; px += step) {
        if (C.alpha[py * C.width + px] > 230) points.push(px, py);
      }
    }
    if (points.length < 200) return null;
    let best = { x: 0, y: 0, err: Infinity };
    const errors: number[] = [];
    const maxX = Math.min(x1, A.width - C.width);
    const maxY = Math.min(y1, A.height - C.height);
    for (let oy = Math.max(0, y0); oy <= maxY; oy++) {
      for (let ox = Math.max(0, x0); ox <= maxX; ox++) {
        let sum = 0;
        for (let i = 0; i < points.length; i += 2) {
          const px = points[i];
          const py = points[i + 1];
          sum += Math.abs(C.luma[py * C.width + px] - A.luma[(oy + py) * A.width + ox + px]);
        }
        const err = sum / (points.length / 2);
        errors.push(err);
        if (err < best.err) best = { x: ox, y: oy, err };
      }
    }
    if (!Number.isFinite(best.err)) return null;
    errors.sort((a, b) => a - b);
    return { ...best, median: errors[Math.floor(errors.length / 2)] ?? best.err };
  };

  const f1 = Math.min(1, 180 / w);
  const coarse = search(f1, 0, Infinity, 0, Infinity, 2);
  if (!coarse) return null;

  const f2 = Math.min(1, 520 / w);
  const k = f2 / f1;
  const r = Math.ceil(k) + 2;
  const fine = search(f2, Math.round(coarse.x * k) - r, Math.round(coarse.x * k) + r, Math.round(coarse.y * k) - r, Math.round(coarse.y * k) + r, 3);
  if (!fine) return null;

  /* Ishonch: xato kichik va qo'pol bosqichda boshqa joylardan aniq ajralgan. */
  if (fine.err > 22 || (coarse.median > 0 && coarse.err > coarse.median * 0.7)) return null;
  return { w, h, x: fine.x / f2, y: fine.y / f2 };
}

/**
 * PORTRET — Post Studio kesmasi, iloji bo'lsa TABIIY RANGDA.
 *
 * Kesma ataylab oq-qora saqlanadi (post kartochkalari uslubi). Rangli
 * portret uchun kesmaning shaffofligi NIQOB bo'ladi, ostiga esa nomzodning
 * o'z rangli surati aniq o'sha joyda qo'yiladi — fon yo'q, odam o'z rangida.
 * Joy topilmasa yoki ishonch past bo'lsa, oq-qora kesma qoladi: noto'g'ri
 * qo'yilgan rang yuzni buzib ko'rsatardi.
 */
export function AuPortrait({
  cutout,
  avatar,
  alt,
}: {
  cutout: { url: string; width: number | null; height: number | null };
  avatar: string | null;
  alt: string;
}) {
  const [fit, setFit] = useState<Fit | null>(null);
  const [shown, setShown] = useState(false);
  const cw = cutout.width;
  const ch = cutout.height;

  useEffect(() => {
    if (!avatar || !cw || !ch) return;
    let cancelled = false;
    Promise.all([load(optimized(avatar, 3840)), load(optimized(cutout.url, 640))])
      .then(([big, small]) => {
        if (cancelled) return;
        const found = locate(big, small, cw, ch);
        if (found) setFit(found);
      })
      .catch(() => {
        // Rasm o'qilmadi — oq-qora kesma qoladi.
      });
    return () => {
      cancelled = true;
    };
  }, [avatar, cutout.url, cw, ch]);

  const ratio = cw && ch ? `${cw} / ${ch}` : "3 / 4";

  return (
    <div className="au-frame" style={{ "--au-ar": ratio, "--au-arn": cw && ch ? cw / ch : 0.75 } as CSSProperties}>
      <Image
        src={cutout.url}
        alt={alt}
        fill
        preload
        sizes="(min-width: 900px) 600px, 92vw"
        className="au-frame__mono"
        data-au-hidden={fit && shown ? "" : undefined}
      />
      {fit && avatar && cw && ch && (
        <span
          className="au-frame__color"
          data-au-shown={shown ? "" : undefined}
          style={{
            WebkitMaskImage: `url("${optimized(cutout.url, 1080)}")`,
            maskImage: `url("${optimized(cutout.url, 1080)}")`,
          }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- o'lcham va joy foizda hisoblanadi */}
          <img
            src={optimized(avatar, 3840)}
            alt=""
            onLoad={() => setShown(true)}
            style={{
              width: `${(fit.w / cw) * 100}%`,
              height: `${(fit.h / ch) * 100}%`,
              left: `${(-fit.x / cw) * 100}%`,
              top: `${(-fit.y / ch) * 100}%`,
            }}
          />
        </span>
      )}
    </div>
  );
}

/* ========================================================================= *
 * AMALLAR
 * ========================================================================= */

/** Ulashish — tizim oynasi yoki havolani nusxalash. */
export function AuShare({ name }: { name: string }) {
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
    <button type="button" className="au-btn au-btn--glass" onClick={share}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M10 2.5v10M6.5 6L10 2.5 13.5 6M4.5 10v5.5A1.5 1.5 0 006 17h8a1.5 1.5 0 001.5-1.5V10" />
      </svg>
      {done ? "Nusxalandi" : "Ulashish"}
    </button>
  );
}

/**
 * SHAXSIY PROMO KOD. Xatti-harakat umumiy `ProfilePromoCode` bilan bir xil:
 * kod nusxalanadi, havola `/ariza?ref=` ga kodni qo'yib olib boradi.
 */
export function AuPromo({ code }: { code: string }) {
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
    <p className="au-promo">
      <span>Promo kod</span>
      <button type="button" onClick={copy} aria-label={`Promo kodni nusxalash: ${code}`}>
        {code}
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          {copied ? <path d="M3 8.5l3 3 7-7" /> : <path d="M5.5 5.5h8v8h-8zM10.5 3H3v7.5" />}
        </svg>
      </button>
      <a href={`/ariza?ref=${encodeURIComponent(code)}`}>Ariza →</a>
    </p>
  );
}
