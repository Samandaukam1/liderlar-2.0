import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { CANDIDATE_CARD_SELECT, normalizeCandidateRow } from "@/lib/data/candidates";
import { searchLegacyPosts } from "@/lib/data/legacy-posts";

/**
 * Umumiy qidiruv — 2.0 va 1.0 yonma-yon.
 *
 * Arxiv natijalari ALOHIDA guruh bo'lib qaytadi va `/nomzodlar/<legacy-slug>`
 * ga olib boradi. Ular `candidates` bilan qo'shilmaydi: reyting, TOP-100 va
 * statistika o'sha jadvaldan hisoblanadi, shuning uchun arxivni u yerga
 * aralashtirish raqamlarni jimgina buzardi. Bu yerdagi birlashma faqat
 * ko'rsatish uchun — server tomonda, ikkita mustaqil so'rov.
 */
export async function globalSearch(query: string) {
  const q = query.trim();
  if (!q) {
    return { candidates: [], articles: [], podcasts: [], journalArticles: [], legacyPosts: [] };
  }

  const supabase = await createServerSupabase();

  const [candidates, articles, podcasts, journalArticles, legacyPosts] = await Promise.all([
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
    // O'z xatosini o'zi yutadi — arxiv qidiruvi yiqilsa ham 2.0 qidiruvi qoladi.
    searchLegacyPosts(q),
  ]);

  return {
    legacyPosts,
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
