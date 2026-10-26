import "server-only";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_AI_ASSISTANT_SETTINGS,
  mapAiAssistantSettingsRow,
  type AiAssistantSettings,
  type AiAssistantSettingsRow,
} from "@/lib/ai/assistant-settings";

export type { AiAssistantSettings };

const SELECT_COLUMNS =
  "assistant_name, greeting, quick_questions, avatar_kind, avatar_image_url, avatar_video_url, size_px, floating_height_px, particle_count, animation_speed, glow_enabled, particle_enabled, pulse_enabled, bloom_enabled, blur_shadow_enabled, halo_enabled, voice_enabled, glow_color, border_color, background_color, opening_animation, closing_animation";

/**
 * Reads the admin-configured widget appearance. Deliberately avoids the
 * cookie-bound server client (which would taint every page as dynamic) —
 * this is public, non-user-specific data, so a plain anon-key client wrapped
 * in unstable_cache lets pages stay statically rendered/ISR'd. This is the
 * widget's only source: it no longer opens a Realtime subscription per
 * visitor, so an admin change reaches visitors on their next page load,
 * within the cache window below.
 */
const fetchAiAssistantSettings = unstable_cache(
  async (): Promise<AiAssistantSettings> => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("ai_assistant_settings")
      .select(SELECT_COLUMNS)
      .eq("id", true)
      .maybeSingle();
    if (error || !data) return DEFAULT_AI_ASSISTANT_SETTINGS;
    return mapAiAssistantSettingsRow(data as AiAssistantSettingsRow);
  },
  ["ai-assistant-settings"],
  { revalidate: 120, tags: ["ai-assistant-settings"] }
);

export async function getAiAssistantSettings(): Promise<AiAssistantSettings> {
  try {
    return await fetchAiAssistantSettings();
  } catch {
    return DEFAULT_AI_ASSISTANT_SETTINGS;
  }
}
