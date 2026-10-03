import { CalendarClock, CheckCircle2, AlertTriangle } from "lucide-react";
import type { AnnualFeeStatus } from "@/lib/kabinet/annual-fee";

function formatDay(date: string | null): string {
  if (!date) return "—";
  return new Date(`${date}T12:00:00+05:00`).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Tashkent",
  });
}

const money = new Intl.NumberFormat("uz-UZ");

/**
 * YILLIK TEXNIK BADAL — kabinetning eng muhim xabari, eng tepada.
 *
 * Sana faqat birinchi nashrdan; "to'langan" faqat admin qayd etgan
 * yozuvdan. Ma'lumot bo'lmasa — taxmin emas, ochiq aytiladi.
 */
export function AnnualFeeCard({ fee }: { fee: AnnualFeeStatus }) {
  const tone =
    fee.state === "overdue"
      ? "border-rose-300 bg-rose-50"
      : fee.state === "soon"
        ? "border-amber-300 bg-amber-50"
        : fee.state === "paid"
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-brand-soft bg-white";

  return (
    <section className={`rounded-3xl border-2 p-5 shadow-card sm:p-6 ${tone}`} aria-labelledby="yillik-badal">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p id="yillik-badal" className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
            Yillik texnik badal
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-navy sm:text-4xl">
            {money.format(fee.amountUzs)} <span className="text-xl">so‘m</span>
          </p>
          <p className="text-sm text-ink-soft">yiliga bir marta</p>
        </div>

        <div className="rounded-2xl bg-white/80 px-4 py-3 text-right shadow-sm">
          {fee.state === "unknown" ? (
            <p className="text-sm text-ink-soft">Muddat aniqlanmagan</p>
          ) : fee.state === "overdue" ? (
            <>
              <p className="flex items-center justify-end gap-1 text-sm font-bold text-rose-700">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Muddati o‘tgan
              </p>
              <p className="text-xs text-rose-700">{Math.abs(fee.daysLeft ?? 0)} kun oldin</p>
            </>
          ) : (
            <>
              <p className="text-xs text-ink-soft">Keyingi texnik badalgacha</p>
              <p className={`font-display text-2xl font-bold ${fee.state === "soon" ? "text-amber-700" : "text-navy"}`}>
                {fee.daysLeft} kun
              </p>
            </>
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-xl bg-white/70 px-3 py-2">
          <dt className="text-xs text-ink-soft">Nashr sanasi</dt>
          <dd className="font-semibold text-navy">{formatDay(fee.referenceDate)}</dd>
        </div>
        <div className="rounded-xl bg-white/70 px-3 py-2">
          <dt className="flex items-center gap-1 text-xs text-ink-soft">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            {fee.state === "overdue" ? "To‘lov kuni edi" : "Keyingi to‘lov kuni"}
          </dt>
          <dd className="font-semibold text-navy">{formatDay(fee.dueDate)}</dd>
        </div>
        <div className="rounded-xl bg-white/70 px-3 py-2">
          <dt className="text-xs text-ink-soft">Holat</dt>
          <dd className="font-semibold text-navy">
            {fee.state === "paid" ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Joriy yil to‘langan
              </span>
            ) : fee.state === "overdue" ? (
              "To‘lov qayd etilmagan"
            ) : fee.state === "unknown" ? (
              "Ma’lumot yo‘q"
            ) : (
              "Muddat kelmagan"
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-ink-soft">
        Badal har yili profilingiz chop etilgan kunda to‘lanadi. To‘lov holatini tahririyat qayd etadi.
      </p>
    </section>
  );
}
