import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * A'zoning MEHR ma'lumotlari — shaxsiy kabinet uchun.
 *
 * SOXTA RAQAM YO'Q. Har bir son bazadagi yozuvdan chiqadi:
 * ball daftaridan, jamlanmadan, sertifikat ro'yxatidan.
 * Ma'lumot bo'lmasa — nol emas, "hali yo'q" deyiladi va
 * chaqiruvchi buni farqlay oladi.
 *
 * USTUNLAR ATMA-ATI sanaladi: `select("*")` tadbir qatoridagi
 * tekshiruv koordinatalarini ham olib kelardi.
 */

export interface MehrPointRow {
  category: string;
  points: number;
}

export interface MehrLedgerEntry {
  points: number;
  category: string;
  note: string | null;
  createdAt: string;
  activityTitle: string | null;
}

export interface MehrCertificate {
  code: string;
  role: string | null;
  status: "active" | "revoked";
  issuedAt: string;
  activityTitle: string | null;
  activitySlug: string | null;
}

export interface MehrActivitySummary {
  id: string;
  title: string;
  status: string;
  slug: string | null;
  role: string;
  startsAt: string | null;
  isOrganizer: boolean;
}

export interface MemberMehrData {
  totalPoints: number;
  byCategory: MehrPointRow[];
  ledger: MehrLedgerEntry[];
  certificates: MehrCertificate[];
  activities: MehrActivitySummary[];
  organizedCount: number;
  participatedCount: number;
  pendingCount: number;
  approvedCount: number;
  /** Umumiy reytingdagi o'rni. Ball bo'lmasa — null, "0-o'rin" emas. */
  rank: number | null;
  telegramLinked: boolean;
}

export async function loadMemberMehrData(profileId: string): Promise<MemberMehrData> {
  const db = createAdminClient();

  const [aggregates, ledger, certificates, participation, telegram] = await Promise.all([
    db
      .from("point_aggregates")
      .select("category, total_points")
      .eq("profile_id", profileId)
      .eq("period", "all")
      .eq("period_key", "all"),

    db
      .from("point_ledger")
      .select("points, category, note, created_at, source_id")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20),

    db
      .from("certificates")
      .select("code, role, status, issued_at, mehr_activities(title, slug)")
      .eq("recipient_profile_id", profileId)
      .order("issued_at", { ascending: false })
      .limit(50),

    db
      .from("mehr_participants")
      .select("role, activity_id, mehr_activities(id, title, status, slug, starts_at)")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50),

    db
      .from("member_telegram_links")
      .select("id")
      .eq("profile_id", profileId)
      .is("unlinked_at", null)
      .maybeSingle(),
  ]);

  const aggRows = (aggregates.data ?? []) as { category: string; total_points: number }[];
  const totalPoints = Number(aggRows.find((r) => r.category === "total")?.total_points ?? 0);

  const participationRows = (participation.data ?? []) as unknown as {
    role: string;
    activity_id: string;
    mehr_activities: {
      id: string;
      title: string;
      status: string;
      slug: string | null;
      starts_at: string | null;
    } | null;
  }[];

  const activities: MehrActivitySummary[] = participationRows
    .filter((r) => r.mehr_activities)
    .map((r) => ({
      id: r.mehr_activities!.id,
      title: r.mehr_activities!.title,
      status: r.mehr_activities!.status,
      slug: r.mehr_activities!.slug,
      startsAt: r.mehr_activities!.starts_at,
      role: r.role,
      isOrganizer: r.role === "organizer" || r.role === "co_organizer",
    }));

  const titleById = new Map(activities.map((a) => [a.id, a.title]));

  /*
   * REYTING — SERVERDA SANALADI (§39).
   *
   * Minglab volontyorni yuklab, mijozda tartiblash mumkin emas.
   * Bu yerda faqat "mendan ko'p ballga ega necha kishi bor"
   * degan sanoq so'raladi.
   */
  let rank: number | null = null;
  if (totalPoints > 0) {
    const { count } = await db
      .from("point_aggregates")
      .select("profile_id", { count: "exact", head: true })
      .eq("period", "all")
      .eq("period_key", "all")
      .eq("category", "total")
      .gt("total_points", totalPoints);
    rank = (count ?? 0) + 1;
  }

  return {
    totalPoints,
    byCategory: aggRows
      .filter((r) => r.category !== "total" && Number(r.total_points) !== 0)
      .map((r) => ({ category: r.category, points: Number(r.total_points) })),

    ledger: ((ledger.data ?? []) as {
      points: number;
      category: string;
      note: string | null;
      created_at: string;
      source_id: string | null;
    }[]).map((r) => ({
      points: Number(r.points),
      category: r.category,
      note: r.note,
      createdAt: r.created_at,
      activityTitle: r.source_id ? (titleById.get(r.source_id) ?? null) : null,
    })),

    certificates: ((certificates.data ?? []) as unknown as {
      code: string;
      role: string | null;
      status: string;
      issued_at: string;
      mehr_activities: { title?: string; slug?: string | null } | null;
    }[]).map((r) => ({
      code: r.code,
      role: r.role,
      status: r.status === "revoked" ? "revoked" : "active",
      issuedAt: r.issued_at,
      activityTitle: r.mehr_activities?.title ?? null,
      activitySlug: r.mehr_activities?.slug ?? null,
    })),

    activities,
    organizedCount: activities.filter((a) => a.isOrganizer).length,
    participatedCount: activities.filter((a) => !a.isOrganizer).length,
    pendingCount: activities.filter((a) => a.status === "submitted").length,
    approvedCount: activities.filter((a) => a.status === "approved").length,
    rank,
    telegramLinked: Boolean(telegram.data),
  };
}

export const MEHR_CATEGORY_LABEL: Readonly<Record<string, string>> = {
  ijtimoiy_tasir: "Ijtimoiy ta'sir",
  yetakchilik: "Yetakchilik",
  intellektual: "Intellektual faoliyat",
  yutuqlar: "Yutuqlar",
  jamiyatga_hissa: "Jamiyatga hissa",
};

export const MEHR_ROLE_LABEL: Readonly<Record<string, string>> = {
  participant: "Ishtirokchi",
  co_organizer: "Hamkor tashkilotchi",
  organizer: "Tashkilotchi",
};

export const MEHR_STATUS_LABEL: Readonly<Record<string, string>> = {
  draft: "Qoralama",
  submitted: "Tekshiruvda",
  changes_requested: "Tuzatish so'ralgan",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
};
