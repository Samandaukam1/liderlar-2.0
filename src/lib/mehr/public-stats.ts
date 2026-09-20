import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { periodKeyFor, type RankingPeriod } from "./period";

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

export interface MehrPublicStats {
  volunteers: number;
  approvedActivities: number;
  certificates: number;
  totalPoints: number;
}

export interface PublicActivityCard {
  id: string;
  slug: string | null;
  title: string;
  coverImageUrl: string | null;
  regionName: string | null;
  categoryName: string | null;
  organizerName: string | null;
  startsAt: string | null;
  approvedAt: string | null;
  beneficiaryCount: number | null;
  participantCount: number;
}

export interface TopVolunteer {
  profileId: string;
  fullName: string | null;
  avatarUrl: string | null;
  regionName: string | null;
  /** Ensiklopediya profili bo'lsa — havola uchun. */
  candidateSlug: string | null;
  points: number;
  activityCount: number;
}

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
