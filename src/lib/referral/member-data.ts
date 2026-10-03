import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureReferralCode } from "./code-service";
import type { ReferralStage } from "./code";
import { REFERRAL_VIP_CAP_DAYS } from "./member-constants";

/**
 * "PROMO-KODIM" SAHIFASI UCHUN MA'LUMOT.
 *
 * MAXFIYLIK (§76): kod egasi tavsiya qilgan odamni ISMIDAN tanishi
 * kerak, lekin telefon, email, pasport va arizadagi javoblar
 * KO'RSATILMAYDI. Shuning uchun bu yerda faqat ism va bosqich
 * o'qiladi — qolgan ustunlar so'rovga umuman qo'shilmaydi.
 */

export const STAGE_LABEL: Record<ReferralStage, string> = {
  visited: "Havolani ochdi",
  application: "Ariza yubordi",
  registered: "Ro'yxatdan o'tdi",
  activated: "Akkauntni faollashtirdi",
  payment_confirmed: "To'lov tasdiqlandi",
};

export interface ReferralEntry {
  /** Ko'rsatish uchun ism. Arizadagi ism — faqat shu. */
  displayName: string;
  stage: ReferralStage;
  stageLabel: string;
  createdAt: string;
  /** Ball berilganmi: to'lov tasdiqlangan VA profil chop etilgan. */
  rewarded: boolean;
  /**
   * Foydalanuvchiga ko'rinadigan oddiy holat:
   *   applied   — Ariza yuborildi;
   *   reviewing — Tekshiruvda (nomzodga bog'langan yoki to'lov qilgan);
   *   published — Maqola chop etildi (VIP mukofotining sharti).
   */
  status: "applied" | "reviewing" | "published";
}

export {
  REFERRAL_STATUS_LABEL,
  REFERRAL_VIP_CAP_DAYS,
  REFERRAL_VIP_STEP_DAYS,
} from "./member-constants";

export interface ReferralSummary {
  code: string | null;
  /** Kod yaratilmasa sabab — foydalanuvchiga ko'rsatiladi. */
  codeError: string | null;

  totals: {
    applications: number;
    activated: number;
    paymentConfirmed: number;
    /** Ball berilgan tavsiyalar soni. */
    rewarded: number;
  };

  /** Tavsiya orqali olingan ball — DAFTARDAN, qayta hisoblanmaydi. */
  points: number;

  /** Maqolasi chop etilgan tavsiyalar (VIP mukofoti sharti). */
  published: number;
  /** Referaldan olingan VIP kunlari — `vip_grants` dan (ko'pi bilan 30). */
  vipDays: number;

  /**
   * Statistikani to'liq o'qib bo'lmadi — sonlar to'liq emas.
   *
   * Oldin o'qish xatosi jim "0 ball" bo'lib ko'rinardi: odam ballari
   * yo'qolgan deb o'ylardi. Endi panel buni ochiq aytadi.
   */
  statsError: string | null;

  recent: ReferralEntry[];
}

/**
 * Qisqartirilgan ism.
 *
 * "Javohir Abdullayev" -> "Javohir A." Familiyaning to'liq ko'rinishi
 * kod egasiga kerak emas: u odamni ismidan taniydi, familiya esa
 * qo'shimcha shaxsiy ma'lumot.
 *
 * TO'LOV TASDIQLANGAN holatda to'liq ism ko'rsatiladi: bunda ikkisi
 * o'rtasida haqiqiy aloqa bor va kod egasi kimdan ball olganini
 * bilishi o'rinli.
 */
function displayName(fullName: string, full: boolean): string {
  const clean = (fullName ?? "").trim();
  if (clean === "") return "(ism yo'q)";
  if (full) return clean;

  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]} ${parts[1]![0]!.toUpperCase()}.`;
}

/**
 * Profil uchun tavsiya ma'lumotini yuklaydi.
 *
 * Kod YO'Q bo'lsa, shu yerda yaratiladi: fon vazifasi soatda bir
 * marta yuradi va yangi foydalanuvchi kabinetga kirganda kodini
 * darhol ko'rishi kerak.
 */
export async function loadReferralSummary(
  profileId: string,
  fullName: string | null,
): Promise<ReferralSummary> {
  const admin = createAdminClient();

  const ensured = await ensureReferralCode(profileId, fullName);

  const summary: ReferralSummary = {
    code: ensured.ok ? ensured.code : null,
    codeError: ensured.ok ? null : ensured.error,
    totals: { applications: 0, activated: 0, paymentConfirmed: 0, rewarded: 0 },
    points: 0,
    published: 0,
    vipDays: 0,
    recent: [],
    statsError: null,
  };
  const STATS_ERROR = "Tavsiyalar statistikasini hozir to'liq o'qib bo'lmadi. Sahifani birozdan keyin yangilang.";

  /*
   * BARCHA SO'ROVLAR PARALLEL — avval to'rttasi ketma-ket edi va kabinet
   * ochilishini sekinlashtirardi. Faqat O'Z atributsiyalari
   * (`referrer_profile_id` — server sessiyasidan).
   *
   * ARIZADAN FAQAT `full_name`: email, telefon, motivatsiya so'rovga
   * qo'shilmaydi.
   *
   * BALL — `point_ledger` dan (yagona haqiqat; teskari yozuvlar ham).
   * BALL BERILGANLAR — `referral_rewards` dan (bosqichdan xulosa emas).
   * VIP KUNLARI — `vip_grants` dan (yagona VIP xizmati yozadi).
   */
  const [
    { data: attributions, error },
    { data: rewards, error: rewardsError },
    { data: ledger, error: ledgerError },
    { data: vipGrants, error: vipError },
  ] = await Promise.all([
    admin
      .from("referral_attributions")
      .select("id, stage, created_at, candidate_id, applications(full_name), candidate:candidates(status, deleted_at)")
      .eq("referrer_profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("referral_rewards")
      .select("attribution_id")
      .eq("referrer_profile_id", profileId)
      .eq("stage", "payment_confirmed"),
    admin.from("point_ledger").select("points").eq("profile_id", profileId).eq("source_type", "referral"),
    admin.from("vip_grants").select("days").eq("profile_id", profileId).eq("source", "referral"),
  ]);

  if (error) {
    console.error("[referral] tavsiyalar o'qilmadi:", error.message);
    summary.statsError = STATS_ERROR;
    return summary;
  }
  if (rewardsError || ledgerError || vipError) {
    console.error("[referral] statistika o'qilmadi:", (rewardsError ?? ledgerError ?? vipError)?.message);
    summary.statsError = STATS_ERROR;
  }

  const rows = attributions ?? [];
  const rewardedIds = new Set((rewards ?? []).map((r) => r.attribution_id as string));

  const statusOf = (row: (typeof rows)[number]): ReferralEntry["status"] => {
    const candidate = (Array.isArray(row.candidate) ? row.candidate[0] : row.candidate) as
      | { status?: string; deleted_at?: string | null }
      | null;
    if (candidate && candidate.status === "published" && !candidate.deleted_at) return "published";
    if (row.candidate_id || row.stage === "payment_confirmed") return "reviewing";
    return "applied";
  };

  for (const row of rows) {
    const stage = row.stage as ReferralStage;
    if (stage === "application") summary.totals.applications += 1;
    if (stage === "activated") summary.totals.activated += 1;
    if (stage === "payment_confirmed") summary.totals.paymentConfirmed += 1;
    if (statusOf(row) === "published") summary.published += 1;
  }
  summary.totals.rewarded = rewardedIds.size;
  summary.vipDays = Math.min(
    REFERRAL_VIP_CAP_DAYS,
    (vipGrants ?? []).reduce((total, g) => total + ((g.days as number) ?? 0), 0),
  );

  summary.recent = rows.slice(0, 10).map((row) => {
    const stage = row.stage as ReferralStage;
    const application = row.applications as { full_name?: string } | null;
    const rewarded = rewardedIds.has(row.id as string);

    return {
      displayName: displayName(application?.full_name ?? "", rewarded),
      stage,
      stageLabel: STAGE_LABEL[stage],
      createdAt: row.created_at as string,
      rewarded,
      status: statusOf(row),
    };
  });

  summary.points = (ledger ?? []).reduce(
    (total, row) => total + ((row.points as number) ?? 0),
    0,
  );

  return summary;
}
