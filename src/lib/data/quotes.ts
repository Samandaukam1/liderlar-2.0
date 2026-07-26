import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { CANDIDATE_CARD_SELECT, normalizeCandidateRow } from "@/lib/data/candidates";
import type { QuoteCardData } from "@/lib/types";

export async function getFeaturedQuotes(limit = 9): Promise<QuoteCardData[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("quotes")
    .select(`id, text, author_name, accent, candidate:candidates(${CANDIDATE_CARD_SELECT})`)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => ({
      id: row.id,
      text: row.text,
      author_name: row.author_name,
      accent: row.accent,
      candidate: row.candidate
        ? normalizeCandidateRow(Array.isArray(row.candidate) ? row.candidate[0] : row.candidate)
        : null,
    }));
}

export async function getAllQuotes(limit = 60): Promise<QuoteCardData[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("quotes")
    .select(`id, text, author_name, accent, candidate:candidates(${CANDIDATE_CARD_SELECT})`)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => ({
      id: row.id,
      text: row.text,
      author_name: row.author_name,
      accent: row.accent,
      candidate: row.candidate
        ? normalizeCandidateRow(Array.isArray(row.candidate) ? row.candidate[0] : row.candidate)
        : null,
    }));
}
