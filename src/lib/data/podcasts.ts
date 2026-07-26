import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { PodcastCardData } from "@/lib/types";

const PODCAST_SELECT = `
  id, title, description, starts_at, location, online_url, host_name,
  banner_url, media_url, status, cancel_reason, registration_limit, candidate_id
`;

// `podcasts` jadvalida alohida slug yo'q; UUID tashqi route uchun barqaror.
function normalizePodcast<T extends { id: string }>(row: T): T & { slug: string } {
  return { ...row, slug: row.id };
}

export async function getUpcomingPodcasts(limit = 6): Promise<PodcastCardData[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("podcasts")
    .select(PODCAST_SELECT)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizePodcast);
}

export async function getAllPodcasts(): Promise<PodcastCardData[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("podcasts")
    .select(PODCAST_SELECT)
    .order("starts_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(normalizePodcast);
}

export async function getPodcastsInRange(start: Date, end: Date): Promise<PodcastCardData[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("podcasts")
    .select(PODCAST_SELECT)
    .gte("starts_at", start.toISOString())
    .lte("starts_at", end.toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalizePodcast);
}

export async function getPodcastBySlug(slug: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("podcasts")
    .select(
      `${PODCAST_SELECT},
       guests:podcast_guests(id, guest_name, role, candidate:candidates(slug, full_name, avatar_url))`
    )
    .eq("id", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizePodcast(data) : null;
}
