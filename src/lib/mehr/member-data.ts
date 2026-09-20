import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  MehrActivitySummary,
  MemberMehrData,
} from "./member-types";

/*
 * Tiplar va yorliqlar SOF modulda (`member-types.ts`).
 *
 * Bu fayl `server-only` — mijoz komponenti undan hatto tipni
 * import qilsa ham, bundler butun modulni brauzer paketiga
 * tortadi va build yiqiladi.
 */
export * from "./member-types";

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
      .select(
        "role, activity_id, " +
          "mehr_activities(id, title, status, slug, starts_at, cover_image_url)",
      )
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
      cover_image_url: string | null;
    } | null;
  }[];

  const organizedIds = participationRows
    .filter((r) => r.mehr_activities && r.role === "organizer")
    .map((r) => r.mehr_activities!.id);

  /*
   * Rasm soni FAQAT o'zi tashkil qilgan tadbirlar uchun
   * so'raladi: u boshqa birovning tadbiriga dalil yubora
   * olmaydi va bu son unga kerak emas.
   */
  const photoCounts = new Map<string, number>();
  if (organizedIds.length > 0) {
    const { data: media } = await db
      .from("mehr_media")
      .select("activity_id")
      .in("activity_id", organizedIds);

    for (const m of (media ?? []) as { activity_id: string }[]) {
      photoCounts.set(m.activity_id, (photoCounts.get(m.activity_id) ?? 0) + 1);
    }
  }

  const activities: MehrActivitySummary[] = participationRows
    .filter((r) => r.mehr_activities)
    .map((r) => {
      const a = r.mehr_activities!;
      const isOrganizer = r.role === "organizer" || r.role === "co_organizer";

      return {
        id: a.id,
        title: a.title,
        status: a.status,
        slug: a.slug,
        startsAt: a.starts_at,
        role: r.role,
        isOrganizer,
        hasCover: Boolean(a.cover_image_url),
        photoCount: photoCounts.get(a.id) ?? 0,
        /*
         * Dalilni FAQAT tashkilotchi va faqat qoralama/tuzatish
         * holatida yuboradi. Server ham shuni tekshiradi — bu
         * yerdagisi tugmani ko'rsatish uchun.
         */
        canSubmitEvidence:
          r.role === "organizer" && (a.status === "draft" || a.status === "changes_requested"),
      };
    });

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
