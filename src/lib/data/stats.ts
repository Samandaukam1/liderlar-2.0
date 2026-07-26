import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function getHomepageStats() {
  const supabase = await createServerSupabase();

  const [candidates, regions, directions, podcasts, journalIssues] = await Promise.all([
    supabase.from("candidates").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("regions").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("podcasts").select("id", { count: "exact", head: true }),
    supabase.from("journals").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);

  return {
    candidates: candidates.count ?? 0,
    regions: regions.count ?? 0,
    directions: directions.count ?? 0,
    podcasts: podcasts.count ?? 0,
    journalIssues: journalIssues.count ?? 0,
  };
}
