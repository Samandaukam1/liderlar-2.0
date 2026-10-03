import Image from "next/image";
import Link from "next/link";
import { Clock, Crown, Trophy } from "lucide-react";
import { CHALLENGE_PRIZES, type ChallengeDay, type ChallengeEntry, type ChallengeToday } from "@/lib/data/daily-challenge";

const MEDAL = ["🥇", "🥈", "🥉"];

function timeTashkent(iso: string): string {
  return new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tashkent" });
}

function dateTashkent(date: string): string {
  return new Date(`${date}T12:00:00+05:00`).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Tashkent",
  });
}

function EntryRow({ entry, final }: { entry: ChallengeEntry; final: boolean }) {
  const medal = entry.place <= 3 ? MEDAL[entry.place - 1] : null;
  return (
    <li>
      <Link
        href={`/liderlar/${entry.candidate.slug}`}
        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition hover:border-liderlar-blue/50 ${
          entry.place <= 3 ? "border-amber-200 bg-amber-50/60" : "border-brand-soft bg-white"
        }`}
      >
        <span className="w-7 shrink-0 text-center font-display text-base font-bold text-navy" aria-label={`${entry.place}-o'rin`}>
          {medal ?? entry.place}
        </span>
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-liderlar-blue/10">
          {entry.candidate.avatarUrl && (
            <Image src={entry.candidate.avatarUrl} alt="" fill sizes="40px" className="object-cover object-top" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-navy">{entry.candidate.fullName}</span>
          {entry.candidate.region && <span className="block truncate text-xs text-ink-soft">{entry.candidate.region}</span>}
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display text-base font-bold tabular-nums text-navy">{entry.views}</span>
          <span className="block text-[0.68rem] text-ink-soft">
            {final && entry.rewardDays ? `+${entry.rewardDays} kun VIP` : "ko‘rish"}
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * KUNLIK PREMIUM CHALLENGE — reyting sahifasidagi bo'lim.
 *
 * 19:00 gacha "Joriy natija" (yakuniy emas), keyin "Bugungi g'oliblar"
 * (muzlatilgan natija). Umumiy reytingdan ALOHIDA: g'alaba reyting
 * balli bermaydi.
 */
export function DailyChallengeSection({ today, history }: { today: ChallengeToday | null; history: ChallengeDay[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-card">
      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-amber-700">
          <Crown className="h-4 w-4" aria-hidden />
          Kunlik Premium Challenge
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-navy">Bugungi bellashuv · 09:00 — 19:00</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Har kuni 09:00 da hamma 0 dan boshlaydi. Faqat shu oraliqdagi sanalgan ko‘rishlar hisoblanadi
          (umumiy ko‘rishlaringiz o‘zgarmaydi). Bellashuvda 09:00 dan oldin chop etilgan profillar qatnashadi.
          Natija 19:00 da yakunlanadi.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
          {CHALLENGE_PRIZES.map((prize) => (
            <div key={prize.place} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-center">
              <p className="text-lg" aria-hidden>{MEDAL[prize.place - 1]}</p>
              <p className="text-xs font-semibold text-navy">{prize.place}-o‘rin</p>
              <p className="text-xs text-ink-soft">{prize.days} kun VIP</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-amber-200/70 bg-white/70 p-5 sm:p-6">
        {!today ? (
          <p className="text-sm text-ink-soft">Bellashuv ma’lumotini hozir yuklab bo‘lmadi.</p>
        ) : today.phase === "before" ? (
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Clock className="h-4 w-4" aria-hidden />
            Bugungi bellashuv {timeTashkent(today.startsAt)} da boshlanadi.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold text-navy">
                <Trophy className="h-4 w-4 text-amber-600" aria-hidden />
                {today.finalized ? "Bugungi g‘oliblar" : "Joriy natija"}
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  today.finalized ? "bg-emerald-50 text-emerald-700" : "bg-liderlar-blue/10 text-liderlar-blue"
                }`}
              >
                {today.finalized
                  ? "Yakuniy natija"
                  : today.phase === "live"
                    ? `Yakuniy emas · ${timeTashkent(today.endsAt)} da yopiladi`
                    : "Yakunlanmoqda…"}
              </span>
            </div>
            {today.entries.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">Hozircha sanalgan ko‘rish yo‘q.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {today.entries.map((entry) => (
                  <EntryRow key={entry.candidate.id} entry={entry} final={today.finalized} />
                ))}
              </ol>
            )}
          </>
        )}
      </div>

      {history.length > 0 && (
        <div className="border-t border-amber-200/70 p-5 sm:p-6">
          <h3 className="font-semibold text-navy">Oldingi kunlar</h3>
          <ul className="mt-3 space-y-3">
            {history.map((day) => (
              <li key={day.date} className="rounded-xl border border-brand-soft bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {dateTashkent(day.date)} · {day.participants} ishtirokchi
                </p>
                {day.winners.length === 0 ? (
                  <p className="mt-1 text-sm text-ink-soft">G‘olib yo‘q (ko‘rish bo‘lmagan).</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
                    {day.winners.map((w) => (
                      <li key={w.place} className="text-sm">
                        <span aria-hidden>{MEDAL[w.place - 1]}</span>{" "}
                        <Link href={`/liderlar/${w.candidate.slug}`} className="font-semibold text-navy hover:text-liderlar-blue">
                          {w.candidate.fullName}
                        </Link>{" "}
                        <span className="text-ink-soft">· {w.views} ko‘rish</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
