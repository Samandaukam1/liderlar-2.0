import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOverallRankings, type OverallRanking } from "@/lib/data/candidate-ranking";
import type { GroundingCandidate } from "@/lib/ai/system-prompt";

type CandidateRow = {
  id: string;
  slug: string;
  full_name: string;
  short_bio: string | null;
  status: string;
  region: { name: string } | { name: string }[] | null;
  category: { name: string } | { name: string }[] | null;
};

function toGrounding(row: CandidateRow, overall: OverallRanking | undefined): GroundingCandidate {
  const region = Array.isArray(row.region) ? row.region[0] : row.region;
  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  return {
    slug: row.slug,
    full_name: row.full_name,
    headline: row.short_bio,
    region: region?.name ?? null,
    direction: category?.name ?? null,
    total_score: overall?.totalScore ?? 0,
    is_verified: row.status === "published",
  };
}

/**
 * Retrieval-grounding for Jaxongir AI: only published, database-backed
 * candidates are ever handed to the model as context. Keyword match first;
 * falls back to top-ranked leaders so generic questions still get a
 * sensible, real answer instead of an empty context block.
 */
export async function retrieveGroundingCandidates(query: string): Promise<GroundingCandidate[]> {
  const admin = createAdminClient();

  const words = query
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}'-]/gu, ""))
    .filter((w) => w.length >= 3)
    .slice(0, 6);

  /*
   * No nested ranking_scores embed: with no index on
   * ranking_scores(candidate_id) it scanned the table once per candidate
   * (EXPLAIN, generic plan: 2034 -> 955 buffers, 11 -> 6 ms). The score for
   * the 5–6 matches comes from the same source as /reyting.
   */
  const baseSelect =
    "id, slug, full_name, short_bio, status, region:regions(name), category:categories(name)";

  if (words.length > 0) {
    const orFilter = words
      .flatMap((w) => [`full_name.ilike.%${w}%`, `short_bio.ilike.%${w}%`])
      .join(",");

    const { data } = await admin
      .from("candidates")
      .select(baseSelect)
      .eq("status", "published")
      .or(orFilter)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      return withScores(data as unknown as CandidateRow[]);
    }
  }

  const { data: fallback } = await admin
    .from("candidates")
    .select(baseSelect)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(5);

  return withScores((fallback as unknown as CandidateRow[]) ?? []);
}

async function withScores(rows: CandidateRow[]): Promise<GroundingCandidate[]> {
  const rankings = await getOverallRankings(rows.map((row) => row.id));
  return rows.map((row) => toGrounding(row, rankings.get(row.id)));
}
