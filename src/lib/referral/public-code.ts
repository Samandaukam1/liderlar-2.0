import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Ommaviy profilda ko'rsatiladigan shaxsiy promo kod — FAQAT O'QISH.
 *
 * Kod akkauntga bog'langan (`referral_codes.profile_id`). Akkaunti yo'q
 * nomzodda kod yo'q va u O'YLAB TOPILMAYDI — kartochka shunchaki
 * chiqmaydi. Kod yaratish faqat fon vazifasi/kabinet ishi: ochiq sahifa
 * har ko'rishda bazaga yozmasligi kerak.
 *
 * Xato ham `null` — biografiya kod tufayli yiqilmasin.
 */
export async function getPublicReferralCode(candidateId: string): Promise<string | null> {
  const admin = createAdminClient();

  const { data: candidate, error } = await admin
    .from("candidates")
    .select("user_id")
    .eq("id", candidateId)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !candidate?.user_id) return null;

  const { data: row, error: codeError } = await admin
    .from("referral_codes")
    .select("code")
    .eq("profile_id", candidate.user_id as string)
    .eq("is_active", true)
    .maybeSingle();
  if (codeError) {
    console.error("[referral] ommaviy kod o'qilmadi:", codeError.message);
    return null;
  }
  return (row?.code as string | null) ?? null;
}
