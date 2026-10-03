import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CANDIDATE_CARD_SELECT, normalizeCandidateRow } from "@/lib/data/candidates";
import type { RankingRow } from "@/lib/types";

export async function getRankingCategories() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("ranking_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export type PeriodFilter = "joriy-oy" | "otgan-oy" | "yil" | "barcha-vaqt";

export async function getPeriodForFilter(filter: PeriodFilter = "barcha-vaqt") {
  const supabase = createAdminClient();

  if (filter === "otgan-oy") {
    const { data } = await supabase
      .from("ranking_periods")
      .select("*")
      .eq("is_current", false)
      .not("published_at", "is", null)
      .order("starts_on", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }
  const { data } = await supabase
    .from("ranking_periods")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();
  return data;
}

export async function getRankingLeaderboard(
  categoryCode: string,
  periodId: string,
  limit = 50,
  regionId: string | null = null,
) {
  const supabase = createAdminClient();
  let query = supabase
    .from("ranking_scores")
    .select(`candidate_id, position, previous_position, total_score, candidate:candidates!inner(${CANDIDATE_CARD_SELECT})`)
    .eq("category", categoryCode)
    .eq("period_id", periodId)
    .eq("candidate.status", "published")
    .is("candidate.deleted_at", null);
  // Hudud filtri — o'rin UMUMIY reytingdagi o'rni bo'lib qoladi (alohida hisob yo'q).
  if (regionId) query = query.eq("candidate.region_id", regionId);
  const { data, error } = await query.order("position", { ascending: true, nullsFirst: false }).limit(limit);
  if (error) throw error;

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((row: any) => row.candidate)
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (row: any): RankingRow => ({
        candidate_id: row.candidate_id,
        position: row.position,
        previous_position: row.previous_position,
        total_score: Number(row.total_score),
        candidate: normalizeCandidateRow(Array.isArray(row.candidate) ? row.candidate[0] : row.candidate),
      })
    );
}

export async function getRankingWeights(periodId?: string) {
  const supabase = createAdminClient();
  let query = supabase.from("ranking_weights").select("*");
  if (periodId) query = query.eq("period_id", periodId);
  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * REYTING QOIDALARI — OMMAVIY TUSHUNTIRISH UCHUN, BAZADAN.
 *
 * Sahifadagi har bir raqam (og'irliklar, ko'rish siyosati, davr) shu
 * yerdan keladi: admin panelda o'zgarsa, tushuntirish ham o'zgaradi.
 * Hisobning o'zi `recalculate_rankings()` da — frontend hisoblamaydi.
 */
export interface RankingRules {
  period: { name: string; startsOn: string; endsOn: string | null } | null;
  weights: { achievements: number; monthlyActivity: number; activeLeadership: number };
  views: { enabled: boolean; viewsPerPoint: number; pointsCap: number } | null;
}

export async function getRankingRules(): Promise<RankingRules> {
  const supabase = createAdminClient();
  const { data: period } = await supabase
    .from("ranking_periods")
    .select("id, name, starts_on, ends_on")
    .eq("is_current", true)
    .maybeSingle();

  const [{ data: weights }, { data: policy }] = await Promise.all([
    period
      ? supabase.from("ranking_weights").select("achievements, monthly_activity, active_leadership").eq("period_id", period.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.rpc("ranking_view_policy"),
  ]);
  const view = (Array.isArray(policy) ? policy[0] : policy) as
    | { enabled: boolean; views_per_point: number; points_cap: number }
    | null;

  return {
    period: period
      ? { name: period.name as string, startsOn: period.starts_on as string, endsOn: (period.ends_on as string | null) ?? null }
      : null,
    // Jadvalda yozuv bo'lmasa — `recalculate_rankings()` dagi standart 40/25/35.
    weights: {
      achievements: Number(weights?.achievements ?? 40),
      monthlyActivity: Number(weights?.monthly_activity ?? 25),
      activeLeadership: Number(weights?.active_leadership ?? 35),
    },
    views: view
      ? { enabled: view.enabled, viewsPerPoint: Number(view.views_per_point), pointsCap: Number(view.points_cap) }
      : null,
  };
}

export async function getRankingRegions(): Promise<{ id: string; name: string }[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("regions").select("id, name").order("name", { ascending: true });
  return (data ?? []) as { id: string; name: string }[];
}
