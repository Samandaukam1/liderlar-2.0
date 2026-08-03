import "server-only";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_CORNER_VIDEO_SETTINGS,
  mapCornerVideoSettingsRow,
  type CornerVideoSettings,
  type CornerVideoSettingsRow,
} from "@/lib/corner-video/settings";

export type { CornerVideoSettings };

const SELECT_COLUMNS =
  "enabled, video_url, poster_url, corner, aspect_ratio, width_px, offset_x_px, offset_y_px, rounded_px, loop_enabled, show_close_button, button_enabled, button_label, button_url, button_animation, button_color, button_text_color";

/**
 * Reads the admin-configured corner video widget. Mirrors the AI assistant
 * settings loader: a plain anon-key client (not the cookie-bound server
 * client) wrapped in unstable_cache, so pulling this into the root layout
 * doesn't force every page to render dynamically. The widget subscribes to
 * Realtime client-side, so this cache window only affects how quickly a
 * *first server render* reflects an admin change.
 */
const fetchCornerVideoSettings = unstable_cache(
  async (): Promise<CornerVideoSettings> => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("corner_video_settings")
      .select(SELECT_COLUMNS)
      .eq("id", true)
      .maybeSingle();
    if (error || !data) return DEFAULT_CORNER_VIDEO_SETTINGS;
    return mapCornerVideoSettingsRow(data as CornerVideoSettingsRow);
  },
  ["corner-video-settings"],
  { revalidate: 120, tags: ["corner-video-settings"] }
);

export async function getCornerVideoSettings(): Promise<CornerVideoSettings> {
  try {
    return await fetchCornerVideoSettings();
  } catch {
    return DEFAULT_CORNER_VIDEO_SETTINGS;
  }
}
