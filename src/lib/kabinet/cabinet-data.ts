import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadMemberMehrData } from "@/lib/mehr/member-data";
import { getMehrFlags } from "@/lib/mehr/flags";
import { loadProfileStats } from "@/lib/analytics/profile-stats";
import { loadMonthlyLinks } from "@/lib/monthly/link-data";
import { loadReferralSummary } from "@/lib/referral/member-data";
import { tashkentDate } from "@/lib/data/daily-challenge";
import { annualFeeStatus, type AnnualFeeStatus } from "./annual-fee";

/**
 * KABINET — BITTA NORMALLASHGAN SERVER PAYLOAD.
 *
 * Har kartochka o'zi bazaga borsa, so'rovlar takrorlanardi va ketma-ket
 * kutilardi (login sekinligining sababi). Bu yerda IKKI PARALLEL to'lqin:
 *   1. profilga bog'liqlar + nomzodning o'zi;
 *   2. nomzod id siga bog'liqlar.
 *
 * Shaxs FAQAT server sessiyasidan (`userId` — chaqiruvchi tekshirgan).
 */

export type VipCardStatus = "active" | "expired" | "disabled" | "none";

export interface CabinetVip {
  status: VipCardStatus;
  startedAt: string | null;
  periodEnd: string | null;
  daysLeft: number | null;
}

export interface CabinetVipGrant {
  days: number;
  source: "admin" | "daily_challenge" | "referral";
  reason: string | null;
  createdAt: string;
}

export interface CabinetChallenge {
  /** 09:00 dan oldin chop etilgan — bugun qatnashadi. */
  eligible: boolean;
  phase: "before" | "live" | "closed";
  place: number | null;
  views: number;
}

const DAY_MS = 86_400_000;

function vipCard(
  row: { state: string; started_at: string | null; current_period_end: string | null; grace_until: string | null } | null,
  now: Date,
): CabinetVip {
  if (!row) return { status: "none", startedAt: null, periodEnd: null, daysLeft: null };
  const base = { startedAt: row.started_at, periodEnd: row.current_period_end };
  if (row.state === "cancelled" || row.state === "suspended") return { ...base, status: "disabled", daysLeft: null };
  if (row.state !== "active" && row.state !== "grace_period") return { ...base, status: "expired", daysLeft: null };
  if (!row.current_period_end) return { ...base, status: "active", daysLeft: null };
  // Sayt huquqi bilan BIR XIL qoida: holat VA sana (`isSubscriptionGranting`).
  const until = new Date(row.grace_until ?? row.current_period_end).getTime();
  if (now.getTime() > until) return { ...base, status: "expired", daysLeft: null };
  return { ...base, status: "active", daysLeft: Math.max(0, Math.ceil((until - now.getTime()) / DAY_MS)) };
}

export async function loadCabinet(userId: string) {
  const admin = createAdminClient();
  const now = new Date();
  const today = tashkentDate(now);

  const [
    { data: profile },
    { data: candidate },
    { data: notifications },
    { data: subscriptions },
    { data: grants },
    { data: telegram },
    mehr,
    mehrFlags,
  ] = await Promise.all([
    admin.from("profiles").select("full_name, username").eq("id", userId).maybeSingle(),
    admin
      .from("candidates")
      .select("id, slug, status, full_name, avatar_url, published_at, region:regions(name)")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle(),
    admin
      .from("notifications")
      .select("id, title, body, read_at, created_at, link")
      .or(`recipient_id.eq.${userId},recipient_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("vip_subscriptions")
      .select("state, started_at, current_period_end, grace_until, created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("vip_grants")
      .select("days, source, reason, created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("member_telegram_links")
      .select("telegram_username")
      .eq("profile_id", userId)
      .is("unlinked_at", null)
      .maybeSingle(),
    loadMemberMehrData(userId),
    getMehrFlags(),
  ]);

  const fullName = (profile?.full_name as string | null) ?? null;

  const [rankingRes, updatesRes, feeRes, profileStats, monthlyLinks, referral, challenge] = await Promise.all([
    candidate
      ? admin
          .from("ranking_scores")
          .select("total_score, position")
          .eq("candidate_id", candidate.id)
          .eq("category", "overall")
          .eq("is_current", true)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    candidate
      ? admin
          .from("monthly_updates")
          .select("id, status, submitted_at, created_at")
          .eq("candidate_id", candidate.id)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as never[] }),
    candidate
      ? admin.from("annual_fee_payments").select("cycle_start").eq("candidate_id", candidate.id)
      : Promise.resolve({ data: [] as never[] }),
    candidate ? loadProfileStats(candidate.id) : Promise.resolve(null),
    candidate ? loadMonthlyLinks(candidate.id) : Promise.resolve([]),
    loadReferralSummary(userId, fullName),
    candidate?.status === "published" ? loadChallenge(candidate.id, candidate.published_at as string | null, today, now) : Promise.resolve(null),
  ]);

  // Ochiq obuna ustun, bo'lmasa eng oxirgisi.
  const open = (subscriptions ?? []).find((s) =>
    ["pending", "active", "grace_period", "suspended"].includes(s.state as string),
  );
  const latest = open ?? (subscriptions ?? [])[0] ?? null;

  const region = candidate ? ((Array.isArray(candidate.region) ? candidate.region[0] : candidate.region) as { name?: string } | null) : null;
  const ranking = rankingRes.data as { total_score: number | string; position: number | null } | null;

  return {
    profile: { fullName, username: (profile?.username as string | null) ?? null },
    candidate: candidate
      ? {
          id: candidate.id as string,
          slug: candidate.slug as string,
          status: candidate.status as string,
          fullName: candidate.full_name as string,
          avatarUrl: (candidate.avatar_url as string | null) ?? null,
          region: region?.name ?? null,
          publishedAt: (candidate.published_at as string | null) ?? null,
        }
      : null,
    ranking: ranking ? { totalScore: Number(ranking.total_score), position: ranking.position } : null,
    vip: vipCard(latest as Parameters<typeof vipCard>[0], now),
    vipHistory: (grants ?? []).map((g) => ({
      days: g.days as number,
      source: g.source as CabinetVipGrant["source"],
      reason: (g.reason as string | null) ?? null,
      createdAt: g.created_at as string,
    })),
    annualFee: candidate
      ? annualFeeStatus({
          publishedAt: (candidate.published_at as string | null) ?? null,
          paidCycleStarts: ((feeRes.data ?? []) as { cycle_start: string }[]).map((p) => p.cycle_start),
          today,
        })
      : (null as AnnualFeeStatus | null),
    challenge,
    telegram: telegram ? { linked: true, username: (telegram.telegram_username as string | null) ?? null } : { linked: false, username: null },
    notifications: notifications ?? [],
    monthlyUpdates: (updatesRes.data ?? []) as { id: string; status: string; submitted_at: string | null; created_at: string }[],
    mehr,
    mehrFlags,
    profileStats,
    monthlyLinks,
    referral,
  };
}

export type CabinetData = Awaited<ReturnType<typeof loadCabinet>>;

/** Bugungi challenge'dagi o'rin — bazadagi yagona hisobdan. */
async function loadChallenge(candidateId: string, publishedAt: string | null, date: string, now: Date): Promise<CabinetChallenge | null> {
  const admin = createAdminClient();
  const { data: window } = await admin.rpc("daily_challenge_window", { p_date: date });
  const w = (Array.isArray(window) ? window[0] : window) as { starts_at: string; ends_at: string } | null;
  if (!w) return null;

  const phase: CabinetChallenge["phase"] =
    now < new Date(w.starts_at) ? "before" : now < new Date(w.ends_at) ? "live" : "closed";
  const eligible = Boolean(publishedAt && new Date(publishedAt) < new Date(w.starts_at));
  if (!eligible || phase === "before") return { eligible, phase, place: null, views: 0 };

  const { data } = await admin.rpc("daily_challenge_standings", { p_date: date, p_limit: 5000 });
  const own = ((data ?? []) as { place: number; candidate_id: string; views: number }[]).find(
    (row) => row.candidate_id === candidateId,
  );
  return { eligible, phase, place: own ? Number(own.place) : null, views: own ? Number(own.views) : 0 };
}
