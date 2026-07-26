import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { CANDIDATE_CARD_SELECT, normalizeCandidateRow } from "@/lib/data/candidates";

export async function globalSearch(query: string) {
  const q = query.trim();
  if (!q) {
    return { candidates: [], articles: [], podcasts: [], journalArticles: [] };
  }

  const supabase = await createServerSupabase();

  const [candidates, articles, podcasts, journalArticles] = await Promise.all([
    supabase
      .from("candidates")
      .select(CANDIDATE_CARD_SELECT)
      .eq("status", "published")
      .ilike("full_name", `%${q.replace(/[%_,()]/g, " ")}%`)
      .limit(12),
    supabase
      .from("articles")
      .select("id, slug, title, excerpt, cover_url")
      .eq("status", "published")
      .ilike("title", `%${q}%`)
      .limit(8),
    supabase.from("podcasts").select("id, title, starts_at").ilike("title", `%${q}%`).limit(8),
    supabase
      .from("journal_articles")
      .select("id, title, article:articles(slug, title, excerpt)")
      .ilike("title", `%${q}%`)
      .limit(8),
  ]);

  return {
    candidates: (candidates.data ?? []).map(normalizeCandidateRow),
    articles: articles.data ?? [],
    podcasts: (podcasts.data ?? []).map((podcast) => ({ ...podcast, slug: podcast.id })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    journalArticles: (journalArticles.data ?? []).map((item: any) => {
      const article = Array.isArray(item.article) ? item.article[0] : item.article;
      return {
        id: item.id,
        slug: article?.slug ?? item.id,
        title: article?.title ?? item.title,
        excerpt: article?.excerpt ?? null,
      };
    }),
  };
}
