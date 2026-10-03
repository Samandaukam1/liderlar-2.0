import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickPortraitCutout, type PortraitCutout } from "@/lib/themes/portrait-cutout";

/**
 * Post Studio yasagan shaffof portretni o'qiydi (faqat o'qish).
 *
 * `candidate_social_posts` jadvalining RLS siyosati faqat adminga ochiq,
 * shuning uchun xizmat kaliti ishlatiladi. Faqat URL, holat va o'lcham
 * olinadi — postning matni yoki Telegram ma'lumoti sahifaga chiqmaydi.
 *
 * Xato bo'lsa `null`: portret bezak, uning yo'qligi sahifani yiqitmasligi
 * kerak — dizayn oddiy profil rasmiga o'tadi.
 */
export async function getCandidatePortraitCutout(
  candidateId: string,
  avatarUrl: string | null,
): Promise<PortraitCutout | null> {
  if (!avatarUrl) return null;

  const { data, error } = await createAdminClient()
    .from("candidate_social_posts")
    .select("portrait_processed_url, portrait_source_url, status, metadata")
    .eq("candidate_id", candidateId)
    .not("portrait_processed_url", "is", null)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) return null;
  return pickPortraitCutout(data ?? [], avatarUrl);
}
