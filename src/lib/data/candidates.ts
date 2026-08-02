import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCandidateAdabiyotXItems } from "@/lib/data/candidate-adabiyotx";
import { splitPipeValues, stripCandidateMarkers, toShortBioItems } from "@/lib/candidates/text";
import type { CandidateCardData, CandidateSectionData } from "@/lib/types";

const CANDIDATE_BASE_SELECT = `
  id, slug, full_name, short_bio, avatar_url, status, is_top100, top100_position,
  region:regions(name, slug),
  category:categories(name, slug, color)
`;

export const CANDIDATE_CARD_SELECT = `
  ${CANDIDATE_BASE_SELECT},
  scores:ranking_scores(total_score, position, previous_position, category, is_current)
`;

// Supabase/PostgREST returns embedded to-one relations as an object, but the
// generic types widen it to array-or-object — normalize defensively here.
function one<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCandidateRow(row: any): CandidateCardData {
  const scores = Array.isArray(row.scores) ? row.scores : row.scores ? [row.scores] : [];
  const overall = scores.find((score: { category?: string; is_current?: boolean }) =>
    score.category === "overall" && score.is_current !== false
  );
  return {
    id: row.id,
    slug: row.slug,
    full_name: row.full_name,
    short_bio: row.short_bio,
    avatar_url: row.avatar_url,
    is_verified: row.status === "published",
    total_score: Number(row.total_score ?? overall?.total_score ?? 0),
    position: row.position ?? overall?.position ?? null,
    previous_position: row.previous_position ?? overall?.previous_position ?? null,
    is_top100: Boolean(row.is_top100),
    top100_position: row.top100_position ?? null,
    region: one(row.region),
    category: one(row.category),
  };
}

export type CandidateFilters = {
  q?: string;
  regionSlug?: string;
  directionSlug?: string;
  birthYear?: number;
  sort?: "reyting" | "eng-yangi" | "alifbo" | "eng-kop-oqilgan";
  page?: number;
  perPage?: number;
};

export async function getCandidates(filters: CandidateFilters = {}) {
  const supabase = await createServerSupabase();
  const page = Math.max(1, filters.page ?? 1);
  const perPage = filters.perPage ?? 12;

  let query = supabase
    .from("candidates")
    .select(CANDIDATE_CARD_SELECT)
    .eq("status", "published")
    .is("deleted_at", null);

  if (filters.q) {
    const q = filters.q.replace(/[%_,()]/g, " ").trim();
    if (q) query = query.ilike("full_name", `%${q}%`);
  }
  if (filters.birthYear) {
    query = query
      .gte("birth_date", `${filters.birthYear}-01-01`)
      .lte("birth_date", `${filters.birthYear}-12-31`);
  }
  if (filters.regionSlug) {
    const { data: region } = await supabase
      .from("regions")
      .select("id")
      .eq("slug", filters.regionSlug)
      .maybeSingle();
    if (region) query = query.eq("region_id", region.id);
  }
  if (filters.directionSlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.directionSlug)
      .maybeSingle();
    if (category) query = query.eq("category_id", category.id);
  }

  switch (filters.sort) {
    case "eng-yangi":
      query = query.order("created_at", { ascending: false });
      break;
    case "alifbo":
      query = query.order("full_name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.range(0, 4999);
  if (error) throw error;

  let items = (data ?? []).map(normalizeCandidateRow);
  if (filters.sort === "reyting" || !filters.sort) {
    items.sort((a, b) => b.total_score - a.total_score || a.full_name.localeCompare(b.full_name, "uz"));
  } else if (filters.sort === "eng-kop-oqilgan" && items.length > 0) {
    const admin = createAdminClient();
    const ids = items.map((item) => item.id);
    const { data: views } = await admin.from("profile_views").select("candidate_id").in("candidate_id", ids);
    const counts = new Map<string, number>();
    for (const view of views ?? []) {
      counts.set(view.candidate_id, (counts.get(view.candidate_id) ?? 0) + 1);
    }
    items.sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  }

  const total = items.length;
  const from = (page - 1) * perPage;
  items = items.slice(from, from + perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getFeaturedCandidates(limit = 6) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_CARD_SELECT)
    .eq("status", "published")
    .eq("is_top100", true)
    .order("top100_position", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeCandidateRow);
}

export async function getTopCandidates(limit = 8) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ranking_scores")
    .select(
      `total_score, position, previous_position,
       candidate:candidates!inner(${CANDIDATE_BASE_SELECT})`
    )
    .eq("category", "overall")
    .eq("is_current", true)
    .eq("candidate.status", "published")
    .order("position", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  const ranked = (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => {
      const candidate = one(row.candidate);
      return candidate
        ? normalizeCandidateRow({
            ...candidate,
            total_score: row.total_score,
            position: row.position,
            previous_position: row.previous_position,
          })
        : null;
    })
    .filter((candidate): candidate is CandidateCardData => candidate !== null);

  return ranked.length > 0 ? ranked : getFeaturedCandidates(limit);
}

export async function getRecentCandidates(limit = 8) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_CARD_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeCandidateRow);
}

export async function getCandidateBySlug(slug: string) {
  const supabase = await createServerSupabase();
  const candidateRequest = supabase
    .from("candidates")
    .select(
      `${CANDIDATE_CARD_SELECT}, birth_date, created_at,
       description_items, birth_year, birth_place, current_location,
       education_summary, activity_field, languages`
    )
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  const integrationKeyRequest = supabase
    .from("candidates")
    .select("integration_key")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  const [{ data, error }, integrationKeyResult] = await Promise.all([
    candidateRequest,
    integrationKeyRequest,
  ]);
  if (error) throw error;
  if (!data) return null;

  const integrationKey =
    !integrationKeyResult.error &&
    typeof integrationKeyResult.data?.integration_key === "string"
      ? integrationKeyResult.data.integration_key
      : null;
  const admin = createAdminClient();
  const [education, workExperience, achievements, booksRead, events, socialLinks, media, quotes, articles, sections, views, adabiyotXItems] =
    await Promise.all([
      supabase.from("education").select("*").eq("candidate_id", data.id).order("sort_order"),
      supabase.from("work_experiences").select("*").eq("candidate_id", data.id).order("sort_order"),
      supabase.from("achievements").select("*").eq("candidate_id", data.id).order("date_from", { ascending: false }),
      supabase.from("books_read").select("*").eq("candidate_id", data.id).order("date_from", { ascending: false }),
      supabase.from("events").select("*").eq("candidate_id", data.id).order("date_from", { ascending: false }),
      supabase.from("social_links").select("*").eq("candidate_id", data.id).order("sort_order"),
      admin
        .from("candidate_media")
        .select("*")
        .eq("candidate_id", data.id)
        .in("bucket", ["candidate-avatars", "candidate-gallery"])
        .is("deleted_at", null)
        .order("created_at"),
      supabase
        .from("quotes")
        .select("*")
        .eq("candidate_id", data.id)
        .eq("status", "published")
        .order("created_at", { ascending: false }),
      supabase
        .from("articles")
        .select("id, slug, title, excerpt, cover_url, published_at, content")
        .eq("candidate_id", data.id)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("published_at", { ascending: false }),
      supabase
        .from("candidate_sections")
        .select("id, title, content, sort_order")
        .eq("candidate_id", data.id)
        .order("sort_order")
        .order("created_at"),
      admin
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("candidate_id", data.id)
        .eq("is_counted", true),
      getCandidateAdabiyotXItems(integrationKey),
    ]);

  const publicMedia = (media.data ?? []).map((item) => ({
    ...item,
    url: /^https?:\/\//.test(item.path)
      ? item.path
      : admin.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl,
    caption: item.file_name,
  }));

  const normalized = normalizeCandidateRow(data);
  const birthYearFromDate = data.birth_date ? String(new Date(data.birth_date).getUTCFullYear()) : null;
  const descriptionItems = toShortBioItems(
    data.description_items?.length ? data.description_items : normalized.short_bio,
  );
  const sectionRows: CandidateSectionData[] = (sections.data ?? [])
    .map((s) => ({
      id: s.id as string,
      title: stripCandidateMarkers(s.title as string),
      content: stripCandidateMarkers(s.content as string),
    }))
    .filter((s) => s.title || s.content);

  return {
    ...normalized,
    birth_date: data.birth_date as string | null,
    description_items: descriptionItems,
    birth_year_display: stripCandidateMarkers(data.birth_year as string | null) || birthYearFromDate,
    birth_place: stripCandidateMarkers(data.birth_place as string | null) || null,
    current_location: stripCandidateMarkers(data.current_location as string | null) || normalized.region?.name || null,
    education_summary: stripCandidateMarkers(data.education_summary as string | null) || null,
    activity_field: stripCandidateMarkers(data.activity_field as string | null) || normalized.category?.name || null,
    languages: splitPipeValues(data.languages as string[] | null),
    sections: sectionRows,
    cover_url: publicMedia[0]?.url ?? null,
    view_count: views.count ?? 0,
    education: education.data ?? [],
    workExperience: workExperience.data ?? [],
    achievements: achievements.data ?? [],
    booksRead: booksRead.data ?? [],
    events: events.data ?? [],
    socialLinks: socialLinks.data ?? [],
    media: publicMedia,
    quotes: quotes.data ?? [],
    articles: articles.data ?? [],
    adabiyotXItems,
  };
}

export async function getSimilarCandidates(candidateId: string, directionSlug: string | null, limit = 4) {
  if (!directionSlug) return [];
  const supabase = await createServerSupabase();
  const { data: category } = await supabase.from("categories").select("id").eq("slug", directionSlug).maybeSingle();
  if (!category) return [];

  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_CARD_SELECT)
    .eq("status", "published")
    .eq("category_id", category.id)
    .neq("id", candidateId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeCandidateRow);
}
