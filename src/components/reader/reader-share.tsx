"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Link2, Share2 } from "lucide-react";

/**
 * ULASHISH — Telegram, Facebook, X va havolani nusxalash.
 *
 * Tarmoq tugmalari oddiy havola (`<a target="_blank">`): uchinchi
 * tomon skripti yuklanmaydi, ya'ni kuzatuvchi kod yo'q va sahifa
 * sekinlashmaydi. Telefonda tizimning o'z "Ulashish" oynasi ham bor.
 */
export function ReaderShare({
  url,
  title,
  orientation,
}: {
  url: string;
  title: string;
  orientation: "vertical" | "horizontal";
}) {
  const [copied, setCopied] = useState(false);
  /*
   * Tizim "Ulashish" oynasi bormi — faqat brauzerda ma'lum. Serverda
   * `false`: aks holda serverda chizilgan HTML brauzerdagidan farq
   * qilib, gidratsiya xatosi berardi.
   */
  const canNativeShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, icon: <TelegramIcon /> },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: <FacebookIcon /> },
    { label: "X", href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`, icon: <XIcon /> },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ruxsat yo'q (masalan, eski brauzer) — foydalanuvchi manzilni o'zi nusxalaydi.
      window.prompt("Havolani nusxalang:", url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ url, title });
    } catch {
      // Bekor qilindi — hech narsa qilmaymiz.
    }
  }

  const vertical = orientation === "vertical";
  const button =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-soft bg-white text-ink-soft shadow-sm transition hover:-translate-y-0.5 hover:border-liderlar-blue/50 hover:text-liderlar-blue";

  return (
    <div className={vertical ? "flex flex-col items-center gap-2" : "flex flex-wrap items-center gap-2"}>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} aria-label="Ulashish" title="Ulashish" className={button}>
          <Share2 className="h-4 w-4" aria-hidden />
        </button>
      )}
      {networks.map((network) => (
        <a
          key={network.label}
          href={network.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${network.label}da ulashish`}
          title={network.label}
          className={button}
        >
          {network.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Havolani nusxalash"
        title={copied ? "Nusxalandi" : "Havolani nusxalash"}
        className={`${button} ${copied ? "border-emerald-300 text-emerald-600" : ""}`}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      </button>
      {/* Ekran o'quvchisi nusxalanganini eshitsin. */}
      <span className="sr-only" aria-live="polite">
        {copied ? "Havola nusxalandi" : ""}
      </span>
    </div>
  );
}

function noopSubscribe() {
  return () => {};
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M21.94 4.3 18.6 19.94c-.25 1.1-.9 1.38-1.83.86l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15 9.37-8.47c.41-.36-.09-.56-.63-.2L5.77 13.38.78 11.82c-1.08-.34-1.1-1.08.23-1.6L20.5 2.71c.9-.33 1.7.2 1.44 1.59Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M13.5 21.95v-7.9h2.65l.4-3.08H13.5V9.01c0-.89.25-1.5 1.53-1.5h1.63V4.75a21.8 21.8 0 0 0-2.38-.12c-2.36 0-3.97 1.44-3.97 4.08v2.27H7.65v3.08h2.66v7.9h3.19Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </svg>
  );
}
