"use client";

import { useState } from "react";
import { Check, Copy, Gift, Share2 } from "lucide-react";
import type { ReferralSummary } from "@/lib/referral/member-data";

/**
 * "PROMO-KODIM" PANELI (§14, §46).
 *
 * Kod, nusxalash, ulashish va HAQIQIY sanoqlar. Hech qanday
 * o'ylab chiqarilgan ko'rsatkich yo'q (§71): ma'lumot bo'lmasa,
 * halol bo'sh holat ko'rsatiladi.
 */
export function PromoCodePanel({
  summary,
  applyUrl,
}: {
  summary: ReferralSummary;
  /** Ariza havolasi, kod bilan. */
  applyUrl: string;
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(text: string, what: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /*
       * Clipboard brauzer ruxsatiga bog'liq va rad etilishi mumkin.
       * Xato ko'rsatmaymiz: kod ekranda turibdi va qo'lda
       * ko'chirilishi mumkin — ya'ni foydalanuvchi to'siqqa
       * uchramaydi.
       */
    }
  }

  if (!summary.code) {
    return (
      <section className="rounded-lg border border-brand-soft bg-white p-5">
        <Header />
        <p className="mt-3 text-sm text-ink-soft">
          {summary.codeError ?? "Promo kodingiz hali tayyor emas."} Birozdan so&apos;ng
          sahifani yangilab ko&apos;ring.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-brand-soft bg-white p-5">
      <Header />

      {/* Kod — sahifadagi eng ko'rinadigan element. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded-md border border-brand-soft bg-ice/50 px-4 py-2 text-lg font-bold tracking-wider text-navy">
          {summary.code}
        </code>

        <button
          type="button"
          onClick={() => copy(summary.code!, "code")}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-ink transition hover:bg-ice/50"
        >
          {copied === "code" ? (
            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          {copied === "code" ? "Nusxalandi" : "Nusxalash"}
        </button>

        <button
          type="button"
          onClick={() => copy(applyUrl, "link")}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-ink transition hover:bg-ice/50"
        >
          {copied === "link" ? (
            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
          ) : (
            <Share2 className="h-4 w-4" aria-hidden />
          )}
          {copied === "link" ? "Havola nusxalandi" : "Havolani ulashish"}
        </button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
        Havolani ulashsangiz, ariza formasida kodingiz avtomatik to&apos;ldiriladi.
      </p>

      {summary.statsError && (
        <p role="status" className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-ink">
          {summary.statsError}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Ariza yuborgan" value={summary.totals.applications} />
        <Stat label="Faollashtirgan" value={summary.totals.activated} />
        <Stat label="To‘lov qilgan" value={summary.totals.paymentConfirmed} />
        <Stat label="Tavsiya balli" value={summary.points} highlight />
      </dl>

      <p className="mt-3 rounded-md border border-brand-soft bg-ice/30 px-3 py-2 text-xs leading-relaxed text-ink-soft">
        Ball tavsiya qilgan odam <b>to&apos;lovni amalga oshirgan</b> va{" "}
        <b>profili chop etilgan</b> bo&apos;lsa qo&apos;shiladi. Ariza topshirish
        o&apos;zi ball bermaydi.
      </p>

      {summary.recent.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          Promo kodingiz hali ishlatilmagan.
        </p>
      ) : (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold text-navy">So&apos;nggi tavsiyalar</h4>
          <ul className="divide-y divide-brand-soft/60">
            {summary.recent.map((entry, index) => (
              <li
                key={`${entry.createdAt}-${index}`}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="min-w-0 text-sm text-ink">{entry.displayName}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-ink-soft">{entry.stageLabel}</span>
                  {entry.rewarded && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Ball berildi
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-2">
      <Gift className="h-5 w-5 text-liderlar-blue" aria-hidden />
      <h3 className="font-semibold text-navy">Promo-kodim</h3>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        highlight ? "border-liderlar-blue/30 bg-ice/50" : "border-brand-soft bg-white"
      }`}
    >
      <dt className="text-[11px] leading-tight text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-lg font-bold text-navy">{value}</dd>
    </div>
  );
}
