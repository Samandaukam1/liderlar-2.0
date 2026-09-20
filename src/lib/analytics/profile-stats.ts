import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Nomzodning profil ko'rsatkichlari — kabinet uchun.
 *
 * NOMZOD FAQAT JAMLANMANI KO'RADI. Tashrifchi belgisi,
 * cookie hash'i yoki chiqarib tashlangan ko'rishlar unga
 * umuman ko'rsatilmaydi: birinchisi maxfiylik, ikkinchisi
 * esa foydasiz va chalg'ituvchi ("sizga 500 ta bot kirdi"
 * degan son hech nimani anglatmaydi).
 */

export interface ProfileStats {
  /** Barcha vaqt bo'yicha hisoblangan ko'rishlar. */
  totalViews: number;
  /** Shu oydagi (Toshkent) hisoblangan ko'rishlar. */
  monthViews: number;

  /** Ko'rishlardan olingan ball — reyting formulasidan. */
  viewPoints: number;
  /** Necha ko'rish bitta ball beradi. */
  viewsPerPoint: number;
  /** Oylik chegara. */
  viewPointsCap: number;
  /** Ko'rish ballari umuman hisobga olinadimi. */
  viewPointsEnabled: boolean;

  /** Umumiy reyting balli va o'rni — mavjud bo'lsa. */
  totalScore: number | null;
  position: number | null;
  previousPosition: number | null;
}

/** Toshkent oyining boshlanishi (UTC da). */
function tashkentMonthStart(now: Date): Date {
  const tashkent = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const start = Date.UTC(tashkent.getUTCFullYear(), tashkent.getUTCMonth(), 1, 0, 0, 0);
  // Toshkent yarim tunini UTC ga qaytaramiz.
  return new Date(start - 5 * 60 * 60 * 1000);
}

export async function loadProfileStats(candidateId: string): Promise<ProfileStats | null> {
  const db = createAdminClient();
  const now = new Date();
  const monthStart = tashkentMonthStart(now).toISOString();

  const [totalRes, monthRes, policyRes, scoreRes] = await Promise.all([
    db
      .from("profile_views")
      .select("id", { count: "exact", head: true })
      .eq("candidate_id", candidateId)
      .eq("is_counted", true),

    db
      .from("profile_views")
      .select("id", { count: "exact", head: true })
      .eq("candidate_id", candidateId)
      .eq("is_counted", true)
      .gte("created_at", monthStart),

    /*
     * Siyosat BAZADAN o'qiladi, kodda takrorlanmaydi.
     * Aks holda panel bir narsani, reyting boshqa narsani
     * hisoblab, sonlar mos kelmay qolardi.
     */
    db
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "ranking.views_per_point",
        "ranking.view_points_cap",
        "ranking.profile_views_enabled",
      ]),

    db
      .from("ranking_scores")
      .select("total_score, position, previous_position")
      .eq("candidate_id", candidateId)
      .eq("category", "overall")
      .eq("is_current", true)
      .maybeSingle(),
  ]);

  if (totalRes.error) {
    console.error("PROFILE_STATS_FAILED", { code: totalRes.error.code });
    return null;
  }

  const settings = new Map(
    ((policyRes.data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value]),
  );

  const viewsPerPoint = Math.max(Number(settings.get("ranking.views_per_point") ?? 50) || 50, 1);
  const viewPointsCap = Math.max(Number(settings.get("ranking.view_points_cap") ?? 20) || 20, 0);
  const enabled = (settings.get("ranking.profile_views_enabled") ?? "true").trim() === "true";

  const totalViews = totalRes.count ?? 0;

  /*
   * Ko'rish balli reytingdagi formula bilan AYNAN bir xil
   * hisoblanadi: jami ko'rish / nisbat, chegaragacha.
   * Boshqacha hisoblasak, kabinetdagi son reytingdagi son
   * bilan mos kelmay qolardi.
   */
  const viewPoints = enabled
    ? Math.min(totalViews / viewsPerPoint, viewPointsCap)
    : 0;

  return {
    totalViews,
    monthViews: monthRes.count ?? 0,
    viewPoints: Math.round(viewPoints * 10) / 10,
    viewsPerPoint,
    viewPointsCap,
    viewPointsEnabled: enabled,
    totalScore: scoreRes.data ? Number(scoreRes.data.total_score) : null,
    position: (scoreRes.data?.position as number | null) ?? null,
    previousPosition: (scoreRes.data?.previous_position as number | null) ?? null,
  };
}
