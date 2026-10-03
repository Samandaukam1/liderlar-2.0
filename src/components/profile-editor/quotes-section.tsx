"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { addQuote, removeQuote } from "@/app/kabinet/profil/actions";

export interface QuoteItem {
  id: string;
  text: string;
  status: "draft" | "published";
}

/**
 * IQTIBOSLAR — a'zo taklif qiladi, tahririyat chop etadi.
 *
 * Holat ochiq aytiladi: "Tekshiruvda" yoki "Profilda". Chop etilganini
 * a'zo o'chira olmaydi — bu tahririyat qarori.
 */
export function QuotesSection({ quotes }: { quotes: QuoteItem[] }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-lg border border-brand-soft bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block font-semibold text-navy">Iqtiboslar</span>
          <span className="mt-0.5 block text-xs text-ink-soft">O&apos;z fikr-so&apos;zlaringiz · tahririyat tekshiruvidan o&apos;tadi</span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div className="border-t border-brand-soft px-4 py-3">
          {quotes.length > 0 && (
            <ul className="mb-3 space-y-2">
              {quotes.map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-2 rounded-md border border-brand-soft px-3 py-2">
                  <p className="min-w-0 text-sm italic text-ink">“{q.text}”</p>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        q.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {q.status === "published" ? "Profilda" : "Tekshiruvda"}
                    </span>
                    {q.status === "draft" && (
                      <button
                        type="button"
                        disabled={pending}
                        aria-label="Iqtibosni o'chirish"
                        onClick={() =>
                          startTransition(async () => setMessage(await removeQuote(q.id).then((r) => ({ ok: r.ok, text: r.message }))))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Masalan: «Kelajak bugun boshlanadi.»"
            className="w-full rounded-md border border-brand-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-liderlar-blue focus:outline-none"
          />
          {message && (
            <p className={`mt-1 text-xs font-semibold ${message.ok ? "text-emerald-700" : "text-rose-600"}`}>{message.text}</p>
          )}
          <button
            type="button"
            disabled={pending || text.trim().length < 5}
            onClick={() =>
              startTransition(async () => {
                const result = await addQuote(text);
                setMessage({ ok: result.ok, text: result.message });
                if (result.ok) setText("");
              })
            }
            className="mt-2 rounded-md bg-liderlar-blue px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-50"
          >
            {pending ? "Yuborilmoqda…" : "Tekshiruvga yuborish"}
          </button>
        </div>
      )}
    </section>
  );
}
