"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, Ticket } from "lucide-react";

/**
 * BIOGRAFIYADAGI SHAXSIY PROMO KOD (hero, yuqori chap).
 *
 * Profilni ko'rgan odam shu nomzod taklifi bilan ariza topshira olsin.
 * Kod — maxfiy ma'lumot EMAS: uning vazifasi tarqalish. "Ariza" havolasi
 * kodni formaga o'zi qo'yadi (`/ariza?ref=`).
 */
export function ProfilePromoCode({ code, name }: { code: string; name: string }) {
  const [copied, setCopied] = React.useState(false);

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
    <div className="w-full max-w-[15rem] rounded-2xl border border-white/20 bg-white/[0.07] p-4 backdrop-blur-md">
      <p className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-liderlar-blue">
        <Ticket className="h-3.5 w-3.5" aria-hidden />
        Promo kod
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-mono text-xl font-bold tracking-wider text-white" aria-label={`Promo kod: ${code}`}>
          {code}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Nusxalandi" : "Promo kodni nusxalash"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-liderlar-blue hover:bg-liderlar-blue/20"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      <p className="mt-2 text-[0.72rem] leading-snug text-white/70">
        {name} taklifi bilan ariza topshiring.
      </p>
      <Link
        href={`/ariza?ref=${encodeURIComponent(code)}`}
        className="mt-3 inline-flex text-xs font-semibold text-liderlar-blue hover:underline"
      >
        Shu kod bilan ariza →
      </Link>
    </div>
  );
}
