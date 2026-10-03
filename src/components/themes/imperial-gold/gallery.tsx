"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * IMPERIAL GOLD — GALEREYA.
 *
 * Editorial panjara: katta kadr + kichiklar, keyingi blokda katta kadr
 * o'ng tomonda. Ko'rsatiladigan son FAQAT to'liq blok (1, 2, 3, 6 yoki 9)
 * bo'ladi — chala qatorda bo'sh katak qolmaydi. Qolgan rasmlar oxirgi
 * kadrdagi "+N" orqali kattalashtirilgan oynada ochiladi.
 */

export interface IgShot {
  url: string;
  caption: string | null;
  /** Tavsif bo'lmasa ham bo'sh emas — nomzod ismi bilan (dizayn faylida yasaladi). */
  alt: string;
  /** Panjaradagi kichik rasm — serverda chizilgan `next/image`. */
  thumb: ReactNode;
}

function shownCount(total: number): number {
  if (total >= 9) return 9;
  if (total >= 6) return 6;
  if (total >= 3) return 3;
  return total;
}

function variant(index: number, shown: number): string {
  if (shown === 1) return "ig-shot--lead ig-shot--solo";
  if (shown === 2) return "ig-shot--half";
  const desktop = index === 0 ? " ig-shot--big" : index === 6 ? " ig-shot--big-r" : "";
  const mobileLead = index === 0 ? " ig-shot--lead" : "";
  // Mobilda birinchi kadr to'liq qator; qolganlari juft bo'lmasa, oxirgisi ham.
  const orphan = index === shown - 1 && (shown - 1) % 2 === 1 ? " ig-shot--wide" : "";
  return `${desktop}${mobileLead}${orphan}`.trim();
}

export function IgGallery({
  items,
  name,
  fontClassName,
}: {
  items: IgShot[];
  name: string;
  /** Oyna `body` ga chiqariladi — shrift o'zgaruvchilari unga alohida beriladi. */
  fontClassName: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const shown = shownCount(items.length);
  const hidden = items.length - shown;

  const show = (index: number) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setOpen(index);
  };

  return (
    <>
      <ul className="ig-gallery">
        {items.slice(0, shown).map((item, index) => {
          const more = hidden > 0 && index === shown - 1;
          return (
            <li
              key={item.url}
              className={`ig-shot ${variant(index, shown)}`}
              data-ig-reveal
              style={{ "--d": `${(index % 3) * 90}ms` } as CSSProperties}
            >
              <button
                type="button"
                onClick={() => show(index)}
                className="ig-shot__btn"
                aria-label={
                  more
                    ? `Yana ${hidden} ta rasm — galereyani ochish`
                    : `${item.caption ?? `${name} — rasm ${index + 1}`} — kattalashtirish`
                }
              >
                {item.thumb}
                {more && (
                  <span className="ig-shot__more" aria-hidden>
                    +{hidden}
                    <small>rasm</small>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {open !== null && (
        <Lightbox
          items={items}
          index={open}
          name={name}
          fontClassName={fontClassName}
          onIndex={setOpen}
          onClose={() => {
            setOpen(null);
            openerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function Lightbox({
  items,
  index,
  name,
  fontClassName,
  onIndex,
  onClose,
}: {
  items: IgShot[];
  index: number;
  name: string;
  fontClassName: string;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const item = items[index];
  const total = items.length;

  const step = useCallback(
    (delta: number) => onIndex((index + delta + total) % total),
    [index, onIndex, total],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  if (!item) return null;

  return createPortal(
    <div
      className={`ig ig-lightbox ${fontClassName}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — galereya`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchX.current;
        const end = event.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start === null || end === undefined || Math.abs(end - start) < 50) return;
        step(end < start ? 1 : -1);
      }}
    >
      <p className="ig-lightbox__count" aria-live="polite">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      <div key={item.url} className="ig-lightbox__frame">
        <Image src={item.url} alt={item.alt} fill sizes="(min-width: 1200px) 1120px, 100vw" />
      </div>
      {item.caption && <p className="ig-lightbox__cap">{item.caption}</p>}

      <button ref={closeRef} type="button" className="ig-lb-btn ig-lb-close" onClick={onClose} aria-label="Yopish">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
      {total > 1 && (
        <>
          <button type="button" className="ig-lb-btn ig-lb-prev" onClick={() => step(-1)} aria-label="Oldingi rasm">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <button type="button" className="ig-lb-btn ig-lb-next" onClick={() => step(1)} aria-label="Keyingi rasm">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
