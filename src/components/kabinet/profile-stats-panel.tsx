import { Eye, TrendingUp, Trophy, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { ProfileStats } from "@/lib/analytics/profile-stats";

/**
 * Profil ko'rsatkichlari.
 *
 * SONLAR BAZADAN VA REYTING FORMULASIDAN. Ko'rish balli
 * kabinetda ham, reytingda ham AYNAN bir xil hisoblanadi —
 * boshqacha bo'lsa, foydalanuvchi qaysi biriga ishonishni
 * bilmay qolardi.
 */
export function ProfileStatsPanel({ stats }: { stats: ProfileStats }) {
  const movement =
    stats.position !== null && stats.previousPosition !== null
      ? stats.previousPosition - stats.position
      : null;

  return (
    <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-liderlar-blue" aria-hidden />
        <h2 className="font-display text-lg font-bold text-navy">Profil ko&apos;rsatkichlari</h2>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Eye}
          label="Jami ko'rishlar"
          value={stats.totalViews.toLocaleString("uz-UZ")}
        />
        <Stat
          icon={Eye}
          label="Shu oy"
          value={stats.monthViews.toLocaleString("uz-UZ")}
        />
        <Stat
          icon={TrendingUp}
          label="Ko'rishlardan ball"
          value={stats.viewPointsEnabled ? stats.viewPoints.toLocaleString("uz-UZ") : "—"}
          hint={
            stats.viewPointsEnabled
              ? `${stats.viewsPerPoint} ko'rish = 1 ball`
              : "hozircha hisobga olinmaydi"
          }
        />
        <Stat
          icon={Trophy}
          label="Reytingdagi o'rin"
          /*
           * O'rin YO'Q bo'lsa "—" ko'rsatiladi, nol emas.
           * "0-o'rin" degan narsa yo'q va u chalg'itardi.
           */
          value={stats.position !== null ? `#${stats.position}` : "—"}
          hint={
            stats.totalScore !== null
              ? `${Math.round(stats.totalScore * 10) / 10} ball`
              : "reyting hali hisoblanmagan"
          }
          movement={movement}
        />
      </div>

      {stats.viewPointsEnabled && stats.viewPoints >= stats.viewPointsCap && (
        <p className="mt-3 text-xs text-ink-soft">
          Ko&apos;rishlardan olinadigan ball yuqori chegaraga yetgan
          ({stats.viewPointsCap}). Bu chegara reytingni bir tomonlama
          og&apos;dirmaslik uchun.
        </p>
      )}

      <p className="mt-3 text-xs text-ink-soft">
        Ko&apos;rishlar kuniga bir marta hisoblanadi: sahifani qayta yuklash yangi
        ko&apos;rish bermaydi. O&apos;z sahifangizni ochganingiz ham hisobga
        olinmaydi.
      </p>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  movement,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  hint?: string;
  movement?: number | null;
}) {
  return (
    <div className="rounded-lg border border-brand-soft px-4 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>

      <p className="mt-1 flex items-baseline gap-1.5 text-xl font-bold tabular-nums text-navy">
        {value}
        {/*
          Harakat FAQAT oldingi o'rin ma'lum bo'lsa. Uni
          o'ylab topish mumkin emas — birinchi davrda
          taqqoslash uchun hech nima yo'q.
        */}
        {movement !== null && movement !== undefined && movement !== 0 && (
          <span
            className={`inline-flex items-center text-xs font-bold ${
              movement > 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {movement > 0 ? (
              <ArrowUp className="h-3 w-3" aria-hidden />
            ) : (
              <ArrowDown className="h-3 w-3" aria-hidden />
            )}
            {Math.abs(movement)}
          </span>
        )}
        {movement === 0 && <Minus className="h-3 w-3 text-ink-soft" aria-hidden />}
      </p>

      {hint && <p className="mt-0.5 text-[11px] text-ink-soft">{hint}</p>}
    </div>
  );
}
