import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { deriveStatus, periodLabel, type MonthlyLinkRow } from "./period";

/**
 * Nomzodning oylik havolalari.
 *
 * TOKEN HASH'I HECH QACHON QAYTARILMAYDI. Kabinet faqat davr,
 * holat va muddatni ko'radi; ishlaydigan havola alohida
 * amal bilan chiqariladi.
 */
export async function loadMonthlyLinks(candidateId: string): Promise<MonthlyLinkRow[]> {
  const db = createAdminClient();

  const { data, error } = await db
    .from("monthly_update_tokens")
    .select("period_key, status, expires_at, opened_at, used_at")
    .eq("candidate_id", candidateId)
    .not("period_key", "is", null)
    .order("period_key", { ascending: false })
    .limit(12);

  if (error) {
    console.error("MONTHLY_LINKS_LOAD_FAILED", { code: error.code, message: error.message });
    return [];
  }

  return ((data ?? []) as {
    period_key: string;
    status: string;
    expires_at: string | null;
    opened_at: string | null;
    used_at: string | null;
  }[]).map((r) => ({
    period: r.period_key,
    periodLabel: periodLabel(r.period_key),
    status: deriveStatus(r.status, r.expires_at),
    expiresAt: r.expires_at,
    openedAt: r.opened_at,
    usedAt: r.used_at,
  }));
}

/** O'qilmagan (hali ochilmagan) amaldagi havolalar soni. */
export function unreadCount(rows: readonly MonthlyLinkRow[]): number {
  return rows.filter((r) => r.status === "active" && !r.openedAt).length;
}
