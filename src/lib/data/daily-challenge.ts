import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * KUNLIK PREMIUM CHALLENGE — OMMAVIY SAHIFA UCHUN.
 *
 * Hisob BAZADA (`daily_challenge_standings`, `finalize_daily_challenge`):
 * bu yerda frontend o'zi reyting hisoblamaydi. 19:00 gacha — joriy
 * natija (yakuniy emas); 19:00 dan keyin — muzlatilgan natija.
 *
 * Oyna chegaralari ham bazadan (`daily_challenge_window`): Asia/Tashkent
 * bitta joyda hisoblanadi, server soat mintaqasiga tayanilmaydi.
 */

export const CHALLENGE_PRIZES = [
  { place: 1, days: 30 },
  { place: 2, days: 20 },
  { place: 3, days: 10 },
] as const;

export interface ChallengeEntry {
  place: number;
  views: number;
  candidate: {
    id: string;
    slug: string;
    fullName: string;
    avatarUrl: string | null;
    region: string | null;
  };
  rewardDays?: number;
}

export interface ChallengeToday {
  date: string;
  startsAt: string;
  endsAt: string;
  phase: "before" | "live" | "closed";
  /** 19:00 dan keyin va yakunlangan bo'lsa — muzlatilgan natija. */
  finalized: boolean;
  entries: ChallengeEntry[];
}

export interface ChallengeDay {
  date: string;
  participants: number;
  winners: ChallengeEntry[];
}

/** Asia/Tashkent bo'yicha bugungi sana (YYYY-MM-DD) — aniq zona bilan. */
export function tashkentDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

async function loadCandidates(ids: string[]) {
  if (ids.length === 0) return new Map<string, ChallengeEntry["candidate"]>();
  const db = createAdminClient();
  const { data } = await db
    .from("candidates")
    .select("id, slug, full_name, avatar_url, region:regions(name)")
    .in("id", ids);
  return new Map(
    (data ?? []).map((c) => {
      const region = (Array.isArray(c.region) ? c.region[0] : c.region) as { name?: string } | null;
      return [
        c.id as string,
        {
          id: c.id as string,
          slug: c.slug as string,
          fullName: c.full_name as string,
          avatarUrl: (c.avatar_url as string | null) ?? null,
          region: region?.name ?? null,
        },
      ];
    }),
  );
}

export async function getChallengeToday(now: Date = new Date(), limit = 10): Promise<ChallengeToday | null> {
  const db = createAdminClient();
  const date = tashkentDate(now);

  const { data: window, error: windowError } = await db.rpc("daily_challenge_window", { p_date: date });
  const w = (Array.isArray(window) ? window[0] : window) as { starts_at: string; ends_at: string } | null;
  if (windowError || !w) {
    console.error("[challenge] oyna o'qilmadi:", windowError?.message);
    return null;
  }

  const phase: ChallengeToday["phase"] =
    now < new Date(w.starts_at) ? "before" : now < new Date(w.ends_at) ? "live" : "closed";

  if (phase === "closed") {
    const { data: results } = await db
      .from("daily_challenge_results")
      .select("position, views, candidate_id, reward_days")
      .eq("challenge_date", date)
      .order("position", { ascending: true })
      .limit(limit);
    if (results && results.length > 0) {
      const candidates = await loadCandidates(results.map((r) => r.candidate_id as string));
      return {
        date,
        startsAt: w.starts_at,
        endsAt: w.ends_at,
        phase,
        finalized: true,
        entries: results.flatMap((r) => {
          const candidate = candidates.get(r.candidate_id as string);
          return candidate
            ? [{ place: r.position as number, views: r.views as number, candidate, rewardDays: r.reward_days as number }]
            : [];
        }),
      };
    }
  }

  if (phase === "before") {
    return { date, startsAt: w.starts_at, endsAt: w.ends_at, phase, finalized: false, entries: [] };
  }

  const { data: standings, error } = await db.rpc("daily_challenge_standings", { p_date: date, p_limit: limit });
  if (error) {
    console.error("[challenge] joriy natija o'qilmadi:", error.message);
    return { date, startsAt: w.starts_at, endsAt: w.ends_at, phase, finalized: false, entries: [] };
  }
  const rows = (standings ?? []) as { place: number; candidate_id: string; views: number }[];
  const candidates = await loadCandidates(rows.map((r) => r.candidate_id));

  return {
    date,
    startsAt: w.starts_at,
    endsAt: w.ends_at,
    phase,
    finalized: false,
    entries: rows.flatMap((r) => {
      const candidate = candidates.get(r.candidate_id);
      return candidate ? [{ place: Number(r.place), views: Number(r.views), candidate }] : [];
    }),
  };
}

/** Oldingi kunlar g'oliblari (muzlatilgan natija). */
export async function getChallengeHistory(beforeDate: string, days = 7): Promise<ChallengeDay[]> {
  const db = createAdminClient();
  const { data: challenges } = await db
    .from("daily_challenges")
    .select("challenge_date, participants")
    .lt("challenge_date", beforeDate)
    .order("challenge_date", { ascending: false })
    .limit(days);
  if (!challenges || challenges.length === 0) return [];

  const dates = challenges.map((c) => c.challenge_date as string);
  const { data: results } = await db
    .from("daily_challenge_results")
    .select("challenge_date, position, views, candidate_id, reward_days")
    .in("challenge_date", dates)
    .lte("position", 3)
    .order("position", { ascending: true });

  const candidates = await loadCandidates([...new Set((results ?? []).map((r) => r.candidate_id as string))]);

  return challenges.map((c) => ({
    date: c.challenge_date as string,
    participants: c.participants as number,
    winners: (results ?? [])
      .filter((r) => r.challenge_date === c.challenge_date)
      .flatMap((r) => {
        const candidate = candidates.get(r.candidate_id as string);
        return candidate
          ? [{ place: r.position as number, views: r.views as number, candidate, rewardDays: r.reward_days as number }]
          : [];
      }),
  }));
}
