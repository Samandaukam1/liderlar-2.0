import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { periodKeyFor } from "./period";
import type {
  MehrPublicStats,
  PublicActivityCard,
  PublicActivityDetail,
  TopVolunteer,
  RankingPeriod,
} from "./public-types";

/*
 * Tiplar SOF modulda (`public-types.ts`).
 *
 * Bu fayl `server-only` — mijoz komponenti undan tipni
 * import qilsa, bundler butun modulni brauzer paketiga
 * tortadi va build yiqiladi.
 */
export * from "./public-types";

/**
 * MEHR 365+ ommaviy ko'rsatkichlari (§16).
 *
 * HECH BIR RAQAM QO'LDA YOZILMAGAN. Har biri tasdiqlangan
 * yozuvdan sanaladi:
 *
 *   volontyor    — ball daftarida yozuvi bor odam;
 *   ezgulik ishi — 'approved' holatidagi tadbir;
 *   sertifikat   — bekor qilinmagan sertifikat;
 *   ball         — jamlanmadagi yig'indi.
 *
 * Ma'lumot o'qilmasa, katta raqam o'ylab topilmaydi: null
 * qaytadi va sahifa "hozircha ma'lumot yo'q" deydi. Soxta
 * ko'rsatkich butun tizimning ishonchini yo'qotadi.
 */

export async function loadMehrPublicStats(): Promise<MehrPublicStats | null> {
  const db = createAdminClient();

  const [volunteers, activities, certificates, points] = await Promise.all([
    db
      .from("point_aggregates")
      .select("profile_id", { count: "exact", head: true })
      .eq("period", "all")
      .eq("period_key", "all")
      .eq("category", "total")
      .gt("total_points", 0),

    db
      .from("mehr_activities")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),

    db
      .from("certificates")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),

    db
      .from("point_aggregates")
      .select("total_points")
      .eq("period", "all")
      .eq("period_key", "all")
      .eq("category", "total"),
  ]);

  // Birortasi yiqilsa, qolganini ko'rsatib qolgani uchun
  // "0" yozib qo'yish — yolg'on. Butun blok yashiriladi.
  if (volunteers.error || activities.error || certificates.error || points.error) {
    console.error("MEHR_PUBLIC_STATS_FAILED");
    return null;
  }

  return {
    volunteers: volunteers.count ?? 0,
    approvedActivities: activities.count ?? 0,
    certificates: certificates.count ?? 0,
    totalPoints: ((points.data ?? []) as { total_points: number }[]).reduce(
      (sum, r) => sum + Number(r.total_points ?? 0),
      0,
    ),
  };
}

/**
 * Oxirgi tasdiqlangan ezgulik ishlari.
 *
 * FAQAT 'approved'. Qoralama va tekshiruvdagi tadbir ommaviy
 * yo'lga umuman chiqmaydi — RLS ham buni to'sadi, lekin so'rov
 * ham ochiq-oydin shart qo'yadi: himoya ikki qatlamda bo'lsin.
 */
export async function loadRecentApprovedActivities(limit = 12): Promise<PublicActivityCard[]> {
  const db = createAdminClient();

  const { data, error } = await db
    .from("mehr_activities")
    .select(
      // Koordinata va tekshiruv maydonlari ATAYLAB yo'q (§36).
      "id, slug, title, cover_image_url, starts_at, approved_at, beneficiary_count, " +
        "profiles(full_name), regions(name), mehr_categories(name)",
    )
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("MEHR_PUBLIC_ACTIVITIES_FAILED", { code: error.code, message: error.message });
    return [];
  }

  const rows = (data ?? []) as unknown as {
    id: string;
    slug: string | null;
    title: string;
    cover_image_url: string | null;
    starts_at: string | null;
    approved_at: string | null;
    beneficiary_count: number | null;
    profiles: { full_name?: string } | null;
    regions: { name?: string } | null;
    mehr_categories: { name?: string } | null;
  }[];

  if (rows.length === 0) return [];

  const { data: participants } = await db
    .from("mehr_participants")
    .select("activity_id")
    .in("activity_id", rows.map((r) => r.id))
    .eq("status", "checked_in");

  const counts = new Map<string, number>();
  for (const p of (participants ?? []) as { activity_id: string }[]) {
    counts.set(p.activity_id, (counts.get(p.activity_id) ?? 0) + 1);
  }

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    coverImageUrl: r.cover_image_url,
    regionName: r.regions?.name ?? null,
    categoryName: r.mehr_categories?.name ?? null,
    organizerName: r.profiles?.full_name ?? null,
    startsAt: r.starts_at,
    approvedAt: r.approved_at,
    beneficiaryCount: r.beneficiary_count,
    participantCount: counts.get(r.id) ?? 0,
  }));
}

/**
 * Eng faol volontyorlar.
 *
 * REYTING SERVERDA JAMLANMADAN OLINADI (§39): minglab odamni
 * yuklab, mijozda tartiblash mumkin emas.
 */
export async function loadTopVolunteers(
  period: RankingPeriod = "all",
  limit = 20,
  now: Date = new Date(),
): Promise<TopVolunteer[]> {
  const db = createAdminClient();

  const { data: ranked, error } = await db
    .from("point_aggregates")
    .select("profile_id, total_points")
    .eq("period", period)
    .eq("period_key", periodKeyFor(period, now))
    .eq("category", "total")
    .gt("total_points", 0)
    .order("total_points", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("MEHR_TOP_VOLUNTEERS_FAILED", { code: error.code, message: error.message });
    return [];
  }

  const rows = (ranked ?? []) as { profile_id: string; total_points: number }[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.profile_id);

  const [profiles, candidates, participation] = await Promise.all([
    db.from("profiles").select("id, full_name, avatar_url").in("id", ids),
    /*
     * Ensiklopediya profili BO'LSA havola beriladi — yangi
     * ommaviy biografiya YARATILMAYDI (§8). Nashr qilinmagan
     * nomzodning slug'i berilmaydi: havola 404 bo'lardi.
     */
    db
      .from("candidates")
      .select("user_id, slug, regions(name)")
      .in("user_id", ids)
      .eq("status", "published")
      .is("deleted_at", null),
    db
      .from("mehr_participants")
      .select("profile_id, mehr_activities!inner(status)")
      .in("profile_id", ids)
      .eq("mehr_activities.status", "approved"),
  ]);

  const profileById = new Map(
    ((profiles.data ?? []) as { id: string; full_name: string | null; avatar_url: string | null }[]).map(
      (p) => [p.id, p],
    ),
  );

  const candidateByUser = new Map(
    ((candidates.data ?? []) as unknown as {
      user_id: string;
      slug: string;
      regions: { name?: string } | null;
    }[]).map((c) => [c.user_id, c]),
  );

  const activityCounts = new Map<string, number>();
  for (const p of (participation.data ?? []) as { profile_id: string }[]) {
    activityCounts.set(p.profile_id, (activityCounts.get(p.profile_id) ?? 0) + 1);
  }

  return rows.map((r) => {
    const profile = profileById.get(r.profile_id);
    const candidate = candidateByUser.get(r.profile_id);

    return {
      profileId: r.profile_id,
      fullName: profile?.full_name?.trim() || null,
      avatarUrl: profile?.avatar_url ?? null,
      regionName: candidate?.regions?.name ?? null,
      candidateSlug: candidate?.slug ?? null,
      points: Number(r.total_points),
      activityCount: activityCounts.get(r.profile_id) ?? 0,
    };
  });
}

/* ------------------------------------------------------------------
 * SAHIFALANGAN RO'YXATLAR VA BATAFSIL SAHIFA
 * ------------------------------------------------------------------ */

export interface PagedActivities {
  items: PublicActivityCard[];
  total: number;
}

/**
 * Tasdiqlangan ezgulik ishlari — sahifalab.
 *
 * Minglab yozuvni brauzerga yuborish mumkin emas (§43), shuning
 * uchun sanoq va kesim serverda bajariladi.
 */
export async function loadApprovedActivitiesPage(options: {
  page?: number;
  perPage?: number;
  regionId?: string | null;
  categoryId?: string | null;
} = {}): Promise<PagedActivities> {
  const db = createAdminClient();
  const perPage = Math.min(Math.max(options.perPage ?? 12, 1), 48);
  const page = Math.max(options.page ?? 1, 1);
  const from = (page - 1) * perPage;

  let query = db
    .from("mehr_activities")
    .select(
      // Koordinata va tekshiruv maydonlari ATAYLAB yo'q.
      "id, slug, title, cover_image_url, starts_at, approved_at, beneficiary_count, " +
        "profiles(full_name), regions(name), mehr_categories(name)",
      { count: "exact" },
    )
    .eq("status", "approved");

  if (options.regionId) query = query.eq("region_id", options.regionId);
  if (options.categoryId) query = query.eq("category_id", options.categoryId);

  const { data, count, error } = await query
    .order("approved_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) {
    console.error("MEHR_ACTIVITIES_PAGE_FAILED", { code: error.code, message: error.message });
    return { items: [], total: 0 };
  }

  const rows = (data ?? []) as unknown as ActivityRow[];
  return { items: await withParticipantCounts(rows), total: count ?? 0 };
}

interface ActivityRow {
  id: string;
  slug: string | null;
  title: string;
  cover_image_url: string | null;
  starts_at: string | null;
  approved_at: string | null;
  beneficiary_count: number | null;
  profiles: { full_name?: string } | null;
  regions: { name?: string } | null;
  mehr_categories: { name?: string } | null;
}

async function withParticipantCounts(rows: ActivityRow[]): Promise<PublicActivityCard[]> {
  if (rows.length === 0) return [];

  const db = createAdminClient();
  const { data } = await db
    .from("mehr_participants")
    .select("activity_id")
    .in("activity_id", rows.map((r) => r.id))
    .eq("status", "checked_in");

  const counts = new Map<string, number>();
  for (const p of (data ?? []) as { activity_id: string }[]) {
    counts.set(p.activity_id, (counts.get(p.activity_id) ?? 0) + 1);
  }

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    coverImageUrl: r.cover_image_url,
    regionName: r.regions?.name ?? null,
    categoryName: r.mehr_categories?.name ?? null,
    organizerName: r.profiles?.full_name ?? null,
    startsAt: r.starts_at,
    approvedAt: r.approved_at,
    beneficiaryCount: r.beneficiary_count,
    participantCount: counts.get(r.id) ?? 0,
  }));
}

/**
 * Bitta ezgulik ishi — ommaviy ko'rinish.
 *
 * FAQAT 'approved'. Qoralama yoki rad etilgan ish slug bilan
 * so'ralganda ham topilmaydi: shart so'rovning ichida turadi
 * va uni chetlab o'tib bo'lmaydi.
 */
export async function loadPublicActivity(
  slugOrId: string,
): Promise<PublicActivityDetail | null> {
  const db = createAdminClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

  const { data, error } = await db
    .from("mehr_activities")
    .select(
      "id, slug, title, cover_image_url, starts_at, approved_at, beneficiary_count, " +
        "purpose, description, result_summary, location_name, organizer_profile_id, " +
        "profiles(full_name, avatar_url), regions(name), mehr_categories(name)",
    )
    .eq("status", "approved")
    .eq(isUuid ? "id" : "slug", slugOrId)
    .maybeSingle();

  if (error) {
    console.error("MEHR_ACTIVITY_DETAIL_FAILED", { code: error.code, message: error.message });
    return null;
  }
  if (!data) return null;

  const row = data as unknown as ActivityRow & {
    purpose: string | null;
    description: string | null;
    result_summary: string | null;
    location_name: string | null;
    organizer_profile_id: string;
    profiles: { full_name?: string; avatar_url?: string | null } | null;
  };

  const [mediaRes, participantsRes, organizerRes] = await Promise.all([
    db
      .from("mehr_media")
      .select("url, caption")
      .eq("activity_id", row.id)
      .eq("kind", "photo")
      .order("sort_order"),

    db
      .from("mehr_participants")
      .select("profile_id, role, profiles(full_name, avatar_url)")
      .eq("activity_id", row.id)
      .eq("status", "checked_in")
      .limit(60),

    db
      .from("candidates")
      .select("user_id, slug")
      .eq("user_id", row.organizer_profile_id)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  const participantRows = (participantsRes.data ?? []) as unknown as {
    profile_id: string;
    role: string;
    profiles: { full_name?: string; avatar_url?: string | null } | null;
  }[];

  /*
   * Ishtirokchining ensiklopediya havolasi FAQAT nashr
   * qilingan profil uchun. Aks holda havola 404 bo'lardi.
   */
  const candidateSlugs = new Map<string, string>();
  if (participantRows.length > 0) {
    const { data: cands } = await db
      .from("candidates")
      .select("user_id, slug")
      .in("user_id", participantRows.map((p) => p.profile_id))
      .eq("status", "published")
      .is("deleted_at", null);

    for (const c of (cands ?? []) as { user_id: string; slug: string }[]) {
      candidateSlugs.set(c.user_id, c.slug);
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    coverImageUrl: row.cover_image_url,
    regionName: row.regions?.name ?? null,
    categoryName: row.mehr_categories?.name ?? null,
    organizerName: row.profiles?.full_name ?? null,
    organizerAvatarUrl: row.profiles?.avatar_url ?? null,
    organizerSlug: (organizerRes.data?.slug as string | undefined) ?? null,
    startsAt: row.starts_at,
    approvedAt: row.approved_at,
    beneficiaryCount: row.beneficiary_count,
    participantCount: participantRows.length,
    purpose: row.purpose,
    description: row.description,
    resultSummary: row.result_summary,
    // Joy NOMI ommaviy, koordinata esa umuman so'ralmaydi.
    locationName: row.location_name,
    media: ((mediaRes.data ?? []) as { url: string; caption: string | null }[]).map((m) => ({
      url: m.url,
      caption: m.caption,
    })),
    participants: participantRows.map((p) => ({
      profileId: p.profile_id,
      fullName: p.profiles?.full_name ?? null,
      avatarUrl: p.profiles?.avatar_url ?? null,
      candidateSlug: candidateSlugs.get(p.profile_id) ?? null,
      role: p.role,
    })),
  };
}

/** Sitemap uchun: tasdiqlangan ishlarning slug'lari. */
export async function loadPublicActivitySlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const db = createAdminClient();

  const { data } = await db
    .from("mehr_activities")
    .select("slug, approved_at")
    .eq("status", "approved")
    .not("slug", "is", null)
    .order("approved_at", { ascending: false })
    .limit(1000);

  return ((data ?? []) as { slug: string; approved_at: string | null }[]).map((r) => ({
    slug: r.slug,
    updatedAt: r.approved_at ?? new Date().toISOString(),
  }));
}
