import Link from "next/link";
import { Crown, Flame, Send, ChevronRight } from "lucide-react";
import type { CabinetChallenge, CabinetVip, CabinetVipGrant } from "@/lib/kabinet/cabinet-data";

function formatDay(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Tashkent" });
}

/** Tugash — eksklyuziv chegara; foydalanuvchiga oxirgi FAOL kun ko'rsatiladi. */
function lastActiveDay(iso: string | null): string {
  if (!iso) return "muddatsiz";
  return formatDay(new Date(new Date(iso).getTime() - 1000).toISOString());
}

const GRANT_LABEL: Record<CabinetVipGrant["source"], string> = {
  admin: "Administrator",
  daily_challenge: "Premium Challenge",
  referral: "Promo-kod taklifi",
};

const card = "rounded-3xl border border-brand-soft bg-white p-5 shadow-card";

export function VipCard({ vip, history }: { vip: CabinetVip; history: CabinetVipGrant[] }) {
  const active = vip.status === "active";
  return (
    <section className={`${card} ${active ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold text-navy">
          <Crown className={`h-5 w-5 ${active ? "text-amber-500" : "text-ink-soft"}`} aria-hidden />
          Liderlar VIP
        </h2>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            active ? "bg-emerald-100 text-emerald-700" : vip.status === "none" ? "bg-ice text-ink-soft" : "bg-rose-50 text-rose-700"
          }`}
        >
          {active ? "FAOL" : vip.status === "expired" ? "TUGAGAN" : vip.status === "disabled" ? "O‘CHIRILGAN" : "YO‘Q"}
        </span>
      </div>

      {active ? (
        <div className="mt-3">
          <p className="font-display text-3xl font-bold text-navy">
            {vip.daysLeft ?? "∞"} <span className="text-base font-semibold">kun qoldi</span>
          </p>
          <p className="text-sm text-ink-soft">{lastActiveDay(vip.periodEnd)} gacha</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">
          VIP profil muharriri, premium dizaynlar va maqolalar imkoniyatini ochadi. Premium Challenge va promo-kod
          orqali ham VIP kun yutish mumkin.
        </p>
      )}

      {history.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-liderlar-blue">VIP tarixi</summary>
          <ul className="mt-2 space-y-1.5 text-sm">
            {history.map((g, i) => (
              <li key={`${g.createdAt}-${i}`} className="flex items-center justify-between gap-2 rounded-xl bg-ice/50 px-3 py-2">
                <span className="min-w-0 truncate text-ink">{GRANT_LABEL[g.source]}</span>
                <span className="shrink-0 text-xs text-ink-soft">
                  <strong className="text-navy">+{g.days} kun</strong> · {formatDay(g.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export function ChallengeCard({ challenge }: { challenge: CabinetChallenge | null }) {
  return (
    <section className={card}>
      <h2 className="flex items-center gap-2 font-semibold text-navy">
        <Flame className="h-5 w-5 text-amber-500" aria-hidden />
        Kunlik Premium Challenge
      </h2>
      {!challenge ? (
        <p className="mt-3 text-sm text-ink-soft">Profilingiz chop etilgach, har kuni 09:00–19:00 bellashuvda qatnashasiz.</p>
      ) : !challenge.eligible ? (
        <p className="mt-3 text-sm text-ink-soft">
          Bugungi bellashuvga profil 09:00 dan keyin chop etilgan — ertangi bellashuvda qatnashasiz.
        </p>
      ) : challenge.phase === "before" ? (
        <p className="mt-3 text-sm text-ink-soft">Bugungi bellashuv 09:00 da boshlanadi.</p>
      ) : (
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-ink-soft">{challenge.phase === "live" ? "Joriy o‘rningiz" : "Bugungi o‘rningiz"}</p>
            <p className="font-display text-3xl font-bold text-navy">{challenge.place ? `${challenge.place}-o‘rin` : "—"}</p>
          </div>
          <p className="text-right text-sm text-ink-soft">
            <strong className="block font-display text-2xl text-navy">{challenge.views}</strong>
            bugungi ko‘rish
          </p>
        </div>
      )}
      <p className="mt-3 text-xs text-ink-soft">1-o‘rin 30, 2-o‘rin 20, 3-o‘rin 10 kun VIP.</p>
      <Link href="/reyting#premium-challenge" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-liderlar-blue">
        Bellashuvni ko‘rish <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}

export function TelegramCard({ linked, username, botUrl }: { linked: boolean; username: string | null; botUrl: string | null }) {
  return (
    <section className={card}>
      <h2 className="flex items-center gap-2 font-semibold text-navy">
        <Send className="h-5 w-5 text-liderlar-blue" aria-hidden />
        Telegram
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        {linked
          ? `Ulangan${username ? `: @${username}` : ""}. Bildirishnomalar va VIP tahrir bot orqali keladi.`
          : "Telegram'ni ulang — mukofot va bildirishnomalar botga keladi."}
      </p>
      {botUrl && (
        <a
          href={botUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center rounded-full border border-brand-soft px-4 text-sm font-semibold text-navy transition hover:border-liderlar-blue hover:text-liderlar-blue"
        >
          Botni ochish
        </a>
      )}
    </section>
  );
}
