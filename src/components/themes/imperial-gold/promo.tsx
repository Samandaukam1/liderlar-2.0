"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * SHAXSIY PROMO KOD — Imperial Gold uslubida.
 *
 * Xatti-harakat umumiy `ProfilePromoCode` bilan BIR XIL: kod nusxalanadi,
 * havola `/ariza?ref=` ga kodni qo'yib olib boradi. Farqi faqat ko'rinishda
 * — umumiy blok to'q ko'k fonli kartochka, bu dizaynga yot.
 */
export function IgPromoCode({ code, name }: { code: string; name: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard ruxsati bo'lmasa — kod baribir ekranda, qo'lda ko'chiriladi.
    }
  }

  return (
    <div className="ig-promo">
      <p className="ig-promo__label">Promo kod</p>
      <div className="ig-promo__row">
        <span className="ig-promo__code" aria-label={`Promo kod: ${code}`}>
          {code}
        </span>
        <button
          type="button"
          onClick={copy}
          className="ig-promo__copy"
          aria-label={copied ? "Nusxalandi" : "Promo kodni nusxalash"}
        >
          {copied ? (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
              <path d="M3 8.5l3 3 7-7" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
              <rect x="5.5" y="5.5" width="8" height="8" />
              <path d="M10.5 3H3v7.5" />
            </svg>
          )}
        </button>
      </div>
      <p className="ig-promo__text">{name} taklifi bilan ariza topshiring.</p>
      <Link href={`/ariza?ref=${encodeURIComponent(code)}`} className="ig-textlink ig-promo__cta">
        <span className="ig-link">Shu kod bilan ariza</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
