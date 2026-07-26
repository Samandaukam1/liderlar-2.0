import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { JournalCardData } from "@/lib/types";

const JOURNAL_SELECT = "id, issue_number, title, description, cover_url, pdf_url, published_at";

function journalSlug(issueNumber: number) {
  return `issue-${issueNumber}`;
}

function normalizeJournal<T extends { issue_number: number }>(row: T): T & { slug: string } {
  return { ...row, slug: journalSlug(row.issue_number) };
}

export async function getJournals(): Promise<JournalCardData[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("journals")
    .select(JOURNAL_SELECT)
    .eq("status", "published")
    .order("issue_number", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeJournal);
}

export async function getLatestJournal(): Promise<JournalCardData | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("journals")
    .select(JOURNAL_SELECT)
    .eq("status", "published")
    .order("issue_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeJournal(data) : null;
}

export async function getJournalBySlug(slug: string) {
  const supabase = await createServerSupabase();
  const issueNumber = Number(slug.replace(/^issue-/, ""));
  if (!Number.isInteger(issueNumber) || issueNumber < 1) return null;
  const { data, error } = await supabase
    .from("journals")
    .select(
      `${JOURNAL_SELECT},
       articles:journal_articles(
         id, title, author_name, sort_order,
         candidate:candidates(slug, full_name, avatar_url),
         article:articles(id, slug, title, excerpt, cover_url, content, status)
       )`
    )
    .eq("issue_number", issueNumber)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let pdfUrl = data.pdf_url;
  if (pdfUrl && !/^https?:\/\//i.test(pdfUrl)) {
    const admin = createAdminClient();
    const path = pdfUrl.replace(/^journal-pdfs\//, "");
    const { data: signed } = await admin.storage.from("journal-pdfs").createSignedUrl(path, 60 * 60);
    pdfUrl = signed?.signedUrl ?? null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articles = ((data as any).articles ?? []).map((item: any) => {
    const linked = Array.isArray(item.article) ? item.article[0] : item.article;
    const candidate = Array.isArray(item.candidate) ? item.candidate[0] : item.candidate;
    return {
      id: item.id,
      slug: linked?.slug ?? item.id,
      title: linked?.title ?? item.title,
      excerpt: linked?.excerpt ?? null,
      cover_url: linked?.cover_url ?? null,
      content: linked?.content ?? "",
      sort_order: item.sort_order,
      authors: [{ id: item.id, author_name: item.author_name, candidate }],
    };
  });
  return { ...normalizeJournal(data), pdf_url: pdfUrl, articles };
}

export async function getJournalArticleBySlug(slug: string) {
  const supabase = await createServerSupabase();
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select(
      `id, slug, title, excerpt, content, cover_url, candidate:candidates(slug, full_name, avatar_url)`
    )
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (articleError) throw articleError;
  if (!article) return null;

  const { data: link, error: linkError } = await supabase
    .from("journal_articles")
    .select("id, author_name, journal:journals!inner(issue_number, title, status)")
    .eq("article_id", article.id)
    .eq("journal.status", "published")
    .limit(1)
    .maybeSingle();
  if (linkError) throw linkError;
  if (!link) return null;

  const journalRaw = Array.isArray(link.journal) ? link.journal[0] : link.journal;
  const journal = journalRaw ? { ...journalRaw, slug: journalSlug(journalRaw.issue_number) } : null;
  const candidate = Array.isArray(article.candidate) ? article.candidate[0] : article.candidate;
  return {
    ...article,
    journal,
    authors: [{ id: link.id, author_name: link.author_name, candidate }],
  };
}
