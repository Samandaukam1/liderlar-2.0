import { createAdminClient } from "@/lib/supabase/admin";

/**
 * NOMZODNING REYTING BALLI — YAGONA O'QISH JOYI.
 *
 * BALL BU YERDA HISOBLANMAYDI. Yagona reyting dvigateli —
 * `recalculate_rankings()` SQL funksiyasi; bu modul uning
 * natijasini (`ranking_scores`) o'qiydi, xolos.
 *
 * NEGA `service_role` (admin mijoz):
 *
 *   `ranking_scores` ustidagi ommaviy RLS siyosati davr E'LON
 *   QILINGAN bo'lishini talab qiladi
 *   (`ranking_periods.published_at is not null`). Joriy davrda u
 *   bo'sh edi va shu sababli anon rol NOLTA qator ko'rardi — ya'ni
 *   1594 ta chop etilgan biografiyaning hammasida "0 ball" va
 *   "o'rin hisoblanmoqda" turardi. Reyting sahifasi esa
 *   (`lib/data/ranking.ts`) ayni shu jadvalni `service_role` bilan
 *   o'qiydi va to'g'ri raqamni ko'rsatardi — bitta ma'lumot, ikki
 *   xil javob.
 *
 *   Biografiyadagi ball reyting sahifasidagi raqamdan FARQ
 *   QILMASLIGI kerak, shuning uchun manba ham bir xil bo'ldi.
 *   Bu ma'lumot allaqachon ommaviy: u reyting sahifasida va
 *   kartalarda ko'rinadi.
 */

export interface CandidateRankingRow {
  category: string;
  total_score: number;
  position: number | null;
  previous_position: number | null;
}

export interface CandidateRanking {
  /**
   * Umumiy ball. Qator topilmasa `0` — bu HALOL qiymat: nomzod
   * hisobga kirgan, lekin ball yig'ilmagan degani.
   */
  totalScore: number;
  position: number | null;
  previousPosition: number | null;
  /** Yo'nalishlar bo'yicha taqsimot (`overall` ham ichida). */
  rows: CandidateRankingRow[];
  /**
   * Reyting qatori umuman bormi.
   *
   * `false` — nomzod hali hisobga kirmagan (keyingi soatlik
   * hisobda paydo bo'ladi). Bu "ball 0" dan BOSHQA holat va
   * sahifada boshqacha aytiladi.
   */
  hasRow: boolean;
}

export const EMPTY_CANDIDATE_RANKING: CandidateRanking = {
  totalScore: 0,
  position: null,
  previousPosition: null,
  rows: [],
  hasRow: false,
};

export async function getCandidateRanking(candidateId: string): Promise<CandidateRanking> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ranking_scores")
    .select("category, total_score, position, previous_position")
    .eq("candidate_id", candidateId)
    .eq("is_current", true);

  if (error) {
    console.error("[reyting] nomzod balli o'qilmadi:", error.message);
    return EMPTY_CANDIDATE_RANKING;
  }

  const rows: CandidateRankingRow[] = (data ?? []).map((row) => ({
    category: row.category as string,
    total_score: Number(row.total_score ?? 0),
    position: (row.position as number | null) ?? null,
    previous_position: (row.previous_position as number | null) ?? null,
  }));

  const overall = rows.find((row) => row.category === "overall");

  return {
    totalScore: overall?.total_score ?? 0,
    position: overall?.position ?? null,
    previousPosition: overall?.previous_position ?? null,
    rows,
    hasRow: overall !== undefined,
  };
}

/* ========================================================================= *
 * RO'YXATLAR — BITTA SO'ROVDA
 * ========================================================================= */

export interface OverallRanking {
  totalScore: number;
  position: number | null;
  previousPosition: number | null;
}

/**
 * Bir nechta nomzodning umumiy ballini bitta so'rovda oladi.
 *
 * NEGA KERAK: kartalardagi ball ham ayni shu RLS siyosatiga tushardi
 * (`CANDIDATE_CARD_SELECT` ichidagi `scores:ranking_scores(...)` anon
 * rol bilan o'qiladi), ya'ni katalogda, "o'xshash liderlar" da va
 * hududlar sahifasida HAMMASIDA "0" turardi. Reyting bo'yicha
 * saralash ham shu sababli ishlamasdi: hamma ball teng 0 bo'lsa,
 * tartib alifboga tushib qolardi.
 *
 * `ids` bo'sh bo'lsa so'rov qilinmaydi.
 */
/**
 * Bitta so'rovga sig'adigan ID soni.
 *
 * `.in()` qiymatlari URL'ga tushadi: har UUID ~37 belgi. Katalogda
 * nashr qilingan nomzodlar mingdan oshadi, ya'ni filtrsiz ro'yxat
 * 50 KB dan katta manzil yasardi va so'rov shu sababli yiqilardi.
 * Shuning uchun katta ro'yxatda filtr UMUMAN yuborilmaydi va
 * saralash xotirada bo'ladi (javob ham bir necha o'n kilobayt).
 */
const IN_FILTER_LIMIT = 200;

/**
 * PostgREST qatorlar sonini o'zidan cheklaydi (`db-max-rows`).
 *
 * Oraliq ko'rsatilmasa, javob jimgina qirqilardi va katalogning
 * oxiridagi nomzodlar yana "0 ball" bo'lib qolardi.
 */
const MAX_ROWS = 20_000;

export async function getOverallRankings(
  ids: readonly string[],
): Promise<Map<string, OverallRanking>> {
  const result = new Map<string, OverallRanking>();
  if (ids.length === 0) return result;

  const wanted = new Set(ids);
  const admin = createAdminClient();

  let query = admin
    .from("ranking_scores")
    .select("candidate_id, total_score, position, previous_position")
    .eq("category", "overall")
    .eq("is_current", true);

  if (ids.length <= IN_FILTER_LIMIT) {
    query = query.in("candidate_id", ids as string[]);
  }

  const { data, error } = await query.range(0, MAX_ROWS - 1);

  if (error) {
    /*
     * XATODA BO'SH XARITA.
     *
     * Chaqiruvchi o'zining hozirgi qiymatini saqlaydi — ro'yxat
     * reyting o'qilmagani uchun UMUMAN ochilmay qolmasligi kerak.
     */
    console.error("[reyting] ro'yxat ballari o'qilmadi:", error.message);
    return result;
  }

  for (const row of data ?? []) {
    const id = row.candidate_id as string;
    if (!wanted.has(id)) continue;
    result.set(id, {
      totalScore: Number(row.total_score ?? 0),
      position: (row.position as number | null) ?? null,
      previousPosition: (row.previous_position as number | null) ?? null,
    });
  }
  return result;
}
