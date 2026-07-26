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

export async function getRankingLeaderboard(categoryCode: string, periodId: string, limit = 50) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ranking_scores")
    .select(`candidate_id, position, previous_position, total_score, candidate:candidates!inner(${CANDIDATE_CARD_SELECT})`)
    .eq("category", categoryCode)
    .eq("period_id", periodId)
    .eq("candidate.status", "published")
    .order("position", { ascending: true, nullsFirst: false })
    .limit(limit);
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
