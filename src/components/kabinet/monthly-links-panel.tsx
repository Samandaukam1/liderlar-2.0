"use client";

import { useState, useTransition } from "react";
import { CalendarClock, ExternalLink, Copy, Check } from "lucide-react";
import { formatDateUz } from "@/lib/utils";
import {
  MONTHLY_STATUS_LABEL,
  type MonthlyLinkRow,
  type MonthlyLinkStatus,
} from "@/lib/monthly/period";
import { openMonthlyLink } from "@/app/kabinet/actions";

const STATUS_TONE: Record<MonthlyLinkStatus, string> = {
  active: "text-emerald-700 bg-emerald-50 border-emerald-200",
  used: "text-ink-soft bg-ice border-brand-soft",
  revoked: "text-rose-700 bg-rose-50 border-rose-200",
  expired: "text-amber-700 bg-amber-50 border-amber-200",
};

/**
 * Oylik havolalar.
 *
 * HAVOLA OLDINDAN KO'RSATILMAYDI — bosilganda chiqariladi.
 *
 * Bazada faqat token hash'i saqlanadi, shuning uchun
 * "saqlangan havolani ko'rsatish" texnik jihatdan mumkin
 * emas. Har ochishda yangisi beriladi va eskisi shu zahoti
 * ishlamay qoladi — bu ekran suratida qolgan havolani ham
 * bekor qiladi.
 */
export function MonthlyLinksPanel({ rows }: { rows: MonthlyLinkRow[] }) {
  const [pending, startTransition] = useTransition();
  const [links, setLinks] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const unread = rows.filter((r) => r.status === "active" && !r.openedAt).length;

  return (
    <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <CalendarClock className="h-5 w-5 text-liderlar-blue" aria-hidden />
        <h2 className="font-display text-lg font-bold text-navy">Oylik havolalar</h2>

        {/*
          O'qilmagan belgisi — ochilmagan AMALDAGI havolalar.
          Muddati o'tganini "yangi" deb ko'rsatish odamni
          keraksiz shoshirardi.
        */}
        {unread > 0 && (
          <span className="rounded-full bg-liderlar-blue px-2 py-0.5 text-[11px] font-bold text-white">
            {unread} yangi
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          Hozircha oylik havola yo&apos;q. Har oy yangi havola avtomatik tayyorlanadi va
          shu yerda paydo bo&apos;ladi.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((row) => {
            const url = links[row.period];
            const error = errors[row.period];

            return (
              <li
                key={row.period}
                className="rounded-md border border-brand-soft px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-navy">
                      {row.periodLabel}
                      {row.status === "active" && !row.openedAt && (
                        <span className="h-1.5 w-1.5 rounded-full bg-liderlar-blue" aria-label="Yangi" />
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      <span
                        className={`rounded border px-1.5 py-0.5 ${STATUS_TONE[row.status]}`}
                      >
                        {MONTHLY_STATUS_LABEL[row.status]}
                      </span>
                      {row.status === "active" && row.expiresAt && (
                        <> · {formatDateUz(row.expiresAt)} gacha</>
                      )}
                    </p>
                  </div>

                  {row.status === "active" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          setErrors((prev) => ({ ...prev, [row.period]: "" }));
                          const result = await openMonthlyLink(row.period);
                          if (result.ok) {
                            setLinks((prev) => ({ ...prev, [row.period]: result.url }));
                          } else {
                            setErrors((prev) => ({ ...prev, [row.period]: result.error }));
                          }
                        })
                      }
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-liderlar-blue px-3 text-xs font-semibold text-white transition hover:bg-electric-blue disabled:opacity-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      {url ? "Yangi havola" : "Havolani ochish"}
                    </button>
                  )}
                </div>

                {url && (
                  <div className="mt-3 rounded-md border border-liderlar-blue/40 bg-liderlar-blue/5 p-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-xs font-semibold text-liderlar-blue hover:underline"
                    >
                      {url}
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(url);
                        setCopied(row.period);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-brand-soft bg-white px-2.5 py-1 text-xs font-semibold text-navy"
                    >
                      {copied === row.period ? (
                        <>
                          <Check className="h-3 w-3" aria-hidden />
                          Nusxalandi
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" aria-hidden />
                          Nusxalash
                        </>
                      )}
                    </button>

                    <p className="mt-2 text-[11px] text-ink-soft">
                      Bu havola shaxsiy. Qayta ochsangiz, yangi havola beriladi va bu
                      ishlamay qoladi.
                    </p>
                  </div>
                )}

                {error && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
