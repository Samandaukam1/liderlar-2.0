import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { ArticleCardData } from "@/lib/types";

const ARTICLE_SELECT = `
  id, slug, title, excerpt, cover_url, published_at,
  candidate:candidates(slug, full_name)
`;

export async function getPopularArticles(limit = 6): Promise<ArticleCardData[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...row,
    candidate: Array.isArray(row.candidate) ? row.candidate[0] ?? null : row.candidate,
  }));
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select("*, candidate:candidates(slug, full_name, avatar_url, short_bio)")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data;
}
