import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function getCandidatePodcasts(candidateId: string) {
  const supabase = await createServerSupabase();
  const [hosted, guested] = await Promise.all([
    supabase
      .from("podcasts")
      .select("id, title, banner_url, starts_at, status")
      .eq("candidate_id", candidateId)
      .order("starts_at", { ascending: false }),
    supabase
      .from("podcast_guests")
      .select("podcast:podcasts(id, title, banner_url, starts_at, status)")
      .eq("candidate_id", candidateId),
  ]);

  const guestPodcasts = (guested.data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => (Array.isArray(row.podcast) ? row.podcast[0] : row.podcast))
    .filter(Boolean);

  const all = [...(hosted.data ?? []), ...guestPodcasts].map((podcast) => ({
    ...podcast,
    slug: podcast.id,
  }));
  const unique = Array.from(new Map(all.map((p) => [p.id, p])).values());
  return unique.sort((a, b) => ((a.starts_at ?? "") < (b.starts_at ?? "") ? 1 : -1));
}

export async function getCandidateJournalArticles(candidateId: string) {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("journal_articles")
    .select("id, title, article:articles(slug, title, cover_url), journal:journals(issue_number)")
    .eq("candidate_id", candidateId);

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => {
      const article = Array.isArray(row.article) ? row.article[0] : row.article;
      const journal = Array.isArray(row.journal) ? row.journal[0] : row.journal;
      return {
        id: row.id,
        slug: article?.slug ?? row.id,
        title: article?.title ?? row.title,
        cover_url: article?.cover_url ?? null,
        journal: journal ? { ...journal, slug: `issue-${journal.issue_number}` } : null,
      };
    });
}

/*
 * REYTING TAQSIMOTI BU YERDA EMAS.
 *
 * Avval shu faylda `getCandidateRankingBreakdown` turardi va u anon
 * rol bilan o'qirdi. `ranking_scores` ustidagi ommaviy RLS siyosati
 * davr e'lon qilingan bo'lishini talab qiladi, shuning uchun u
 * amalda HAR DOIM bo'sh massiv qaytarardi — biografiyadagi "0 ball"
 * aynan shundan edi. Yagona o'qish joyi:
 * `lib/data/candidate-ranking.ts`.
 */
