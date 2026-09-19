import { createClient as createServerSupabase } from "@/lib/supabase/server";
import {
  BRANDING_ICON_KEYS,
  BRANDING_VERSION_KEY,
  EMPTY_SITE_BRANDING,
  parseSiteBranding,
  type SiteBranding,
} from "./branding-config";

/**
 * Brendingni bazadan o'qish.
 *
 * Qoidalar SOF modulda (`branding-config.ts`); bu yerda faqat I/O.
 */

/**
 * Qisqa muddatli kesh.
 *
 * `generateMetadata` HAR sahifada ishlaydi; keshsiz bu har so'rovga
 * bitta qo'shimcha baza so'rovi qo'shardi. Brending esa kamdan-kam
 * o'zgaradi va o'zgarganda URL dagi versiya baribir keshni buzadi,
 * ya'ni bir necha daqiqalik kechikish zararsiz.
 */
const CACHE_MS = 5 * 60_000;
let cached: { value: SiteBranding; at: number } | null = null;

export async function getSiteBranding(): Promise<SiteBranding> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [...Object.values(BRANDING_ICON_KEYS), BRANDING_VERSION_KEY]);

    const value = parseSiteBranding(
      Object.fromEntries(
        ((data ?? []) as Array<{ key: string; value: string }>).map((r) => [r.key, r.value]),
      ),
    );
    cached = { value, at: Date.now() };
    return value;
  } catch {
    /*
     * Xato YUTILADI. Brending — bezak: baza javob bermasa sayt
     * standart belgi bilan ochilaveradi, oq ekran bermaydi.
     *
     * Natija KESHLANMAYDI — keyingi so'rov qaytadan uriniladi.
     * Aks holda bir marta uzilgan aloqa standart belgini besh
     * daqiqaga qotirib qo'yardi.
     */
    return EMPTY_SITE_BRANDING;
  }
}

export { buildIconsMetadata } from "./branding-config";
