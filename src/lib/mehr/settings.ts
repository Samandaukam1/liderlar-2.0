import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * MEHR sozlamalari.
 *
 * Hozircha bittasi: rasmiy logotip manzili. U repoda emas,
 * SOZLAMADA turadi — shunda faylni almashtirish uchun
 * deploy kerak bo'lmaydi va kod hech qachon logotipni
 * "taxmin qilib" chizmaydi.
 */

export const MEHR_LOGO_SETTING_KEY = "mehr.logo_url";

export async function getMehrLogoUrl(): Promise<string | null> {
  const db = createAdminClient();

  const { data, error } = await db
    .from("site_settings")
    .select("value")
    .eq(MEHR_LOGO_SETTING_KEY.includes(".") ? "key" : "key", MEHR_LOGO_SETTING_KEY)
    .maybeSingle();

  if (error) return null;

  const url = data?.value?.trim();
  if (!url) return null;

  /*
   * Faqat HTTPS qabul qilinadi. Sozlamaga `http://` yoki
   * `javascript:` yozib qo'yilsa, u to'g'ridan-to'g'ri
   * `<img src>` ga tushardi.
   */
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
