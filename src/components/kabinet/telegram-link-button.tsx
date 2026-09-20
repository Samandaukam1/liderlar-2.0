"use client";

import { useState, useTransition } from "react";
import { Send, Check } from "lucide-react";
import { createTelegramLink } from "@/app/kabinet/actions";

/**
 * Telegram hisobini bog'lash tugmasi.
 *
 * HAVOLA BOSILGANDA YARATILADI, sahifa yuklanganda emas.
 *
 * Har ochilishda token yaratilsa, foydalanuvchi kabinetni
 * bir necha marta ochgani uchun amaldagi havolalar to'planib
 * ketardi — har biri esa hisobga kirish yo'li.
 */
export function TelegramLinkButton({ linked }: { linked: boolean }) {
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (linked) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
        <Check className="h-4 w-4" aria-hidden />
        Telegram bog&apos;langan
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await createTelegramLink();
            if (result.ok) setLink(result.deepLink);
            else setError(result.error);
          })
        }
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brand-soft px-4 text-sm font-semibold text-navy transition hover:border-liderlar-blue hover:text-liderlar-blue disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" aria-hidden />
        {pending ? "Havola tayyorlanmoqda…" : "Telegramni bog'lash"}
      </button>

      {link && (
        <div className="mt-3 rounded-md border border-liderlar-blue/40 bg-liderlar-blue/5 p-3 text-sm">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-liderlar-blue hover:underline"
          >
            Telegram botini ochish →
          </a>
          {/*
            Muddat ochiq aytiladi: odam havolani saqlab qo'yib,
            ertaga bosganda "nega ishlamadi" deb o'ylamasin.
          */}
          <p className="mt-1 text-xs text-ink-soft">
            Havola 10 daqiqa amal qiladi va faqat bir marta ishlaydi.
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
