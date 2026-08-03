export type CornerVideoCorner = "bottom-left" | "bottom-right" | "top-left" | "top-right";
export type CornerVideoAspect = "9:16" | "4:5" | "1:1" | "16:9";
export type CornerVideoButtonAnimation = "pulse" | "bounce" | "glow" | "shine" | "none";

export interface CornerVideoSettings {
  enabled: boolean;
  videoUrl: string | null;
  posterUrl: string | null;
  corner: CornerVideoCorner;
  aspectRatio: CornerVideoAspect;
  widthPx: number;
  offsetXPx: number;
  offsetYPx: number;
  roundedPx: number;
  loopEnabled: boolean;
  showCloseButton: boolean;
  buttonEnabled: boolean;
  buttonLabel: string;
  buttonUrl: string | null;
  buttonAnimation: CornerVideoButtonAnimation;
  buttonColor: string;
  buttonTextColor: string;
}

export const DEFAULT_CORNER_VIDEO_SETTINGS: CornerVideoSettings = {
  enabled: false,
  videoUrl: null,
  posterUrl: null,
  corner: "bottom-left",
  aspectRatio: "9:16",
  widthPx: 150,
  offsetXPx: 16,
  offsetYPx: 16,
  roundedPx: 18,
  loopEnabled: true,
  showCloseButton: true,
  buttonEnabled: true,
  buttonLabel: "Batafsil",
  buttonUrl: null,
  buttonAnimation: "pulse",
  buttonColor: "#13BCE4",
  buttonTextColor: "#FFFFFF",
};

/** Raw shape of a `public.corner_video_settings` row (snake_case, as returned by Supabase). */
export interface CornerVideoSettingsRow {
  enabled: boolean;
  video_url: string | null;
  poster_url: string | null;
  corner: CornerVideoCorner;
  aspect_ratio: CornerVideoAspect;
  width_px: number;
  offset_x_px: number;
  offset_y_px: number;
  rounded_px: number;
  loop_enabled: boolean;
  show_close_button: boolean;
  button_enabled: boolean;
  button_label: string;
  button_url: string | null;
  button_animation: CornerVideoButtonAnimation;
  button_color: string;
  button_text_color: string;
}

/** Width-to-height ratio for each admin-selectable aspect option. */
export const ASPECT_RATIO_VALUES: Record<CornerVideoAspect, number> = {
  "9:16": 9 / 16,
  "4:5": 4 / 5,
  "1:1": 1,
  "16:9": 16 / 9,
};

/**
 * Maps a DB row to the camelCase shape used by the widget. Missing/invalid
 * fields fall back to the matching default rather than throwing, since this
 * also runs against partial Realtime payloads.
 */
export function mapCornerVideoSettingsRow(
  row: Partial<CornerVideoSettingsRow>,
  fallback: CornerVideoSettings = DEFAULT_CORNER_VIDEO_SETTINGS
): CornerVideoSettings {
  return {
    enabled: row.enabled ?? fallback.enabled,
    videoUrl: row.video_url ?? fallback.videoUrl,
    posterUrl: row.poster_url ?? fallback.posterUrl,
    corner: row.corner ?? fallback.corner,
    aspectRatio: row.aspect_ratio ?? fallback.aspectRatio,
    widthPx: row.width_px ?? fallback.widthPx,
    offsetXPx: row.offset_x_px ?? fallback.offsetXPx,
    offsetYPx: row.offset_y_px ?? fallback.offsetYPx,
    roundedPx: row.rounded_px ?? fallback.roundedPx,
    loopEnabled: row.loop_enabled ?? fallback.loopEnabled,
    showCloseButton: row.show_close_button ?? fallback.showCloseButton,
    buttonEnabled: row.button_enabled ?? fallback.buttonEnabled,
    buttonLabel: row.button_label ?? fallback.buttonLabel,
    buttonUrl: row.button_url ?? fallback.buttonUrl,
    buttonAnimation: row.button_animation ?? fallback.buttonAnimation,
    buttonColor: row.button_color ?? fallback.buttonColor,
    buttonTextColor: row.button_text_color ?? fallback.buttonTextColor,
  };
}
