import { CheckCircle2, XCircle, Info } from "lucide-react";
import type { RankingRules } from "@/lib/data/ranking";

const fmt = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 });

function formatDay(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00+05:00`);
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Tashkent" });
}

/**
 * "REYTING QANDAY SHAKLLANADI" — HAQIQIY QOIDALAR.
 *
 * Har bir son bazadan (`getRankingRules`): og'irliklar, ko'rish siyosati,
 * davr. Matn `recalculate_rankings()` formulasini aynan tasvirlaydi —
 * o'ylab topilgan qoida yo'q.
 */
export function RankingExplainer({ rules, todayIso }: { rules: RankingRules; todayIso: string }) {
  const { weights, views, period } = rules;
  const periodEnded = period?.endsOn ? period.endsOn < todayIso : false;

  const categories = [
    {
      title: "Yutuqlar",
      weight: weights.achievements,
      counts: ["Tahririyat TASDIQLAGAN yutuq hodisalari (har biriga tahririyat ball belgilaydi)."],
      limits: "Kategoriya ichida ko‘pi bilan 100 ball.",
    },
    {
      title: "Oylik faollik",
      weight: weights.monthlyActivity,
      counts: ["Tahririyat TASDIQLAGAN oylik faoliyat hodisalari."],
      limits: "Kategoriya ichida ko‘pi bilan 100 ball.",
    },
    {
      title: "Faol liderlik",
      weight: weights.activeLeadership,
      counts: [
        "Tahririyat tasdiqlagan liderlik hodisalari.",
        views?.enabled
          ? `Profil sahifasining sanalgan ko‘rishlari: har ${fmt.format(views.viewsPerPoint)} ko‘rish = 1 ball, ko‘pi bilan ${fmt.format(views.pointsCap)} ball.`
          : "Profil ko‘rishlari hozir reytingga qo‘shilmaydi.",
        "Podkast mehmoni bo‘lish: har biri 5 ball, ko‘pi bilan 15.",
        "Jurnalda chop etilgan maqola: har biri 5 ball, ko‘pi bilan 15.",
      ],
      limits: "Kategoriya ichida ko‘pi bilan 100 ball.",
    },
  ];

  return (
    <section className="rounded-2xl border border-brand-soft bg-paper p-5 shadow-card sm:p-6">
      <h2 className="font-display text-xl font-bold text-navy">Reyting qanday shakllanadi</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Liderlar.uz reytingi platformadagi tasdiqlangan faoliyat va natijalar asosida shakllanadi. Uch
        yo‘nalish bo‘yicha ball yig‘iladi, so‘ng og‘irliklar bilan umumiy ballga aylanadi (ko‘pi bilan 100).
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {categories.map((c) => (
          <div key={c.title} className="rounded-xl border border-brand-soft bg-white p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold text-navy">{c.title}</h3>
              <span className="rounded-full bg-liderlar-blue/10 px-2 py-0.5 text-xs font-bold text-liderlar-blue">
                {fmt.format(c.weight)}%
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {c.counts.map((line) => (
                <li key={line} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-soft">{c.limits}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-brand-soft bg-white p-4">
        <h3 className="text-sm font-semibold text-navy">Reytingga qo‘shilmaydi</h3>
        <ul className="mt-2 grid gap-2 text-sm text-ink sm:grid-cols-2">
          {[
            "Tasdiqlanmagan yutuq va hodisalar",
            "Bot, skript va o‘z profilingizni ko‘rish",
            "Bitta tashrif buyuruvchining kuniga bittadan ortiq ko‘rishi",
            "VIP obuna, Premium Challenge g‘alabasi va promo-kod VIP kunlari",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 flex gap-2 text-xs leading-relaxed text-ink-soft">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          Umumiy ball = yutuqlar × {fmt.format(weights.achievements)}% + oylik faollik ×{" "}
          {fmt.format(weights.monthlyActivity)}% + faol liderlik × {fmt.format(weights.activeLeadership)}%. Reyting
          har soatda qayta hisoblanadi. Teng ballda tartib o‘zgarmas ichki identifikator bo‘yicha.
          {period && (
            <>
              {" "}Joriy davr: {period.name} ({formatDay(period.startsOn)} — {formatDay(period.endsOn)}).
              {periodEnded && " Davr yakunlangan: undan keyingi faoliyat yangi davr ochilganda hisoblanadi."}
            </>
          )}
        </span>
      </p>
    </section>
  );
}
