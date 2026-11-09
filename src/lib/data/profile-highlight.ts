import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import {
  DEFAULT_HIGHLIGHT_SETTINGS,
  HIGHLIGHT_AD_COLUMNS,
  HIGHLIGHT_SETTINGS_COLUMNS,
  mapHighlightAdRow,
  mapHighlightSettingsRow,
  type HighlightAd,
  type HighlightSettings,
} from "@/lib/profile-highlight/rules";

export interface ProfileHighlight {
  ads: HighlightAd[];
  settings: HighlightSettings;
}

const EMPTY: ProfileHighlight = { ads: [], settings: DEFAULT_HIGHLIGHT_SETTINGS };

/**
 * Biografik sahifa bari — admin boshqaradigan global sozlama.
 *
 * Burchak video bilan bir xil yo'l: cookie'siz anon mijoz + `unstable_cache`
 * (2 daqiqa, teg `profile-highlight`). Admin o'zgartirsa
 * `/api/revalidate/highlight` tegni darhol eskiradi. Bazada RLS faqat faol
 * va muddati mos bar qatorlarini beradi. Profil keshiga ATAYLAB qo'shilmagan:
 * bu global narsa, nomzodga bog'liq emas.
 *
 * HECH QACHON YIQILMAYDI: xato yoki migratsiya hali yo'q bo'lsa — bar yo'q.
 */
const fetchProfileHighlight = unstable_cache(
  async (): Promise<ProfileHighlight> => {
    const supabase = createPublicClient();
    const [adsRes, settingsRes] = await Promise.all([
      supabase
        .from("ads")
        .select(HIGHLIGHT_AD_COLUMNS)
        .eq("placement", "profile_bar")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(3),
      supabase.from("ads_settings").select(HIGHLIGHT_SETTINGS_COLUMNS).eq("id", true).maybeSingle(),
    ]);
    if (adsRes.error || !adsRes.data) return EMPTY;
    const ads = (adsRes.data as unknown as Record<string, unknown>[])
      .map(mapHighlightAdRow)
      .filter((ad): ad is HighlightAd => ad !== null);
    const settings = settingsRes.error
      ? DEFAULT_HIGHLIGHT_SETTINGS
      : mapHighlightSettingsRow((settingsRes.data as unknown as Record<string, unknown> | null) ?? null);
    return { ads, settings };
  },
  ["profile-highlight"],
  { revalidate: 120, tags: ["profile-highlight"] },
);

export async function getProfileHighlight(): Promise<ProfileHighlight> {
  try {
    return await fetchProfileHighlight();
  } catch {
    return EMPTY;
  }
}
