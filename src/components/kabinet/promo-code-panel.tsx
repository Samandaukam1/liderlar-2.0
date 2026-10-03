"use client";

import { useState } from "react";
import { Check, Copy, Gift, Share2 } from "lucide-react";
import {
  REFERRAL_STATUS_LABEL,
  REFERRAL_VIP_CAP_DAYS,
  REFERRAL_VIP_STEP_DAYS,
} from "@/lib/referral/member-constants";
import type { ReferralSummary } from "@/lib/referral/member-data";

/**
 * "MENING PROMO-KODIM" — kabinetning ko'zga tashlanadigan joyida.
 *
 * Kod avtomatik (har akkauntda bitta). Progress — HAQIQIY sanoqlar:
 * maqolasi chop etilgan tavsiyalar va `vip_grants` dagi kunlar. Hech
 * qanday o'ylab chiqarilgan ko'rsatkich yo'q.
 *
 * Qoida: har chop etilgan tavsiya +10 kun VIP, ko'pi bilan 30 kun.
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
      // Ruxsat bo'lmasa — kod ekranda turibdi, qo'lda ko'chiriladi.
    }
  }

  async function share() {
    // Telefonda tizimning "Ulashish" oynasi (Telegram va boshqalar); bo'lmasa — havola nusxalanadi.
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Liderlar.uz",
          text: `O‘zbekiston Lider Yoshlari Ensiklopediyasiga ariza topshiring. Promo-kod: ${summary.code}`,
          url: applyUrl,
        });
        return;
      } catch {
        // Bekor qilindi — hech narsa qilmaymiz.
        return;
      }
    }
    await copy(applyUrl, "link");
  }

  const steps = REFERRAL_VIP_CAP_DAYS / REFERRAL_VIP_STEP_DAYS; // 3
  const filled = Math.min(steps, summary.published);

  return (
    <section className="rounded-3xl border-2 border-liderlar-blue/30 bg-gradient-to-br from-liderlar-blue/5 to-white p-5 shadow-card sm:p-6">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-liderlar-blue">
        <Gift className="h-4 w-4" aria-hidden />
        Mening promo-kodim
      </h2>

      {!summary.code ? (
        <p className="mt-3 text-sm text-ink-soft">
          {summary.codeError ?? "Promo kodingiz hali tayyor emas."} Birozdan so&apos;ng sahifani yangilang.
        </p>
      ) : (
        <>
          <p className="mt-2 break-all font-mono text-3xl font-bold tracking-wider text-navy sm:text-4xl">{summary.code}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => copy(summary.code!, "code")}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-brand-soft bg-white px-4 text-sm font-semibold text-navy transition hover:border-liderlar-blue"
            >
              {copied === "code" ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied === "code" ? "Nusxalandi" : "Nusxalash"}
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-liderlar-blue px-4 text-sm font-semibold text-white transition hover:bg-electric-blue"
            >
              {copied === "link" ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
              {copied === "link" ? "Havola nusxalandi" : "Ulashish"}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">Havola orqali kelgan odamning ariza formasida kodingiz o‘zi yoziladi.</p>
        </>
      )}

      <div className="mt-5 rounded-2xl bg-white p-4">
        <p className="text-sm font-semibold text-navy">Taklif orqali maqolasi chop etilganlar</p>
        <div className="mt-2 flex items-center gap-2" aria-label={`${filled} / ${steps}`}>
          {Array.from({ length: steps }, (_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full ${i < filled ? "bg-liderlar-blue" : "border-2 border-liderlar-blue/30"}`}
              aria-hidden
            />
          ))}
          <span className="ml-1 text-sm font-semibold text-navy">
            {Math.min(summary.published, steps)} / {steps}
          </span>
        </div>
        <p className="mt-2 text-sm text-ink">
          VIP mukofoti: <strong>{summary.vipDays} / {REFERRAL_VIP_CAP_DAYS} kun</strong>
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Kodingiz bilan ariza topshirgan odamning maqolasi chop etilganda VIP obunangizga +{REFERRAL_VIP_STEP_DAYS} kun
          qo‘shiladi (ko‘pi bilan {REFERRAL_VIP_CAP_DAYS} kun).
        </p>
        {summary.points > 0 && <p className="mt-1 text-xs text-ink-soft">Tavsiya balli: {summary.points}</p>}
      </div>

      {summary.statsError && <p className="mt-3 text-xs text-amber-700">{summary.statsError}</p>}

      {summary.recent.length > 0 && (
        <ul className="mt-4 space-y-2">
          {summary.recent.map((entry, index) => (
            <li key={`${entry.createdAt}-${index}`} className="flex items-center justify-between gap-2 rounded-xl border border-brand-soft bg-white px-3 py-2.5 text-sm">
              <span className="min-w-0 truncate font-medium text-navy">{entry.displayName}</span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  entry.status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : entry.status === "reviewing"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-ice text-ink-soft"
                }`}
              >
                {REFERRAL_STATUS_LABEL[entry.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
