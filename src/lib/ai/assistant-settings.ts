export interface AiAssistantSettings {
  assistantName: string;
  greeting: string;
  quickQuestions: string[];
  avatarKind: "image" | "video";
  avatarImageUrl: string | null;
  avatarVideoUrl: string | null;
  sizePx: number;
  floatingHeightPx: number;
  particleCount: number;
  animationSpeed: number;
  glowEnabled: boolean;
  particleEnabled: boolean;
  pulseEnabled: boolean;
  bloomEnabled: boolean;
  blurShadowEnabled: boolean;
  haloEnabled: boolean;
  voiceEnabled: boolean;
  glowColor: string;
  borderColor: string;
  backgroundColor: string | null;
  openingAnimation: "portal" | "fade" | "scale";
  closingAnimation: "teleport" | "fade" | "scale";
}

export const DEFAULT_AI_ASSISTANT_SETTINGS: AiAssistantSettings = {
  assistantName: "Jaxongir AI",
  greeting: "Salom! Men Jaxongir AI — Liderlar.uz bo'yicha savollaringizga yordam beraman.",
  quickQuestions: [
    "Reyting qanday hisoblanadi?",
    "IT yo'nalishidagi liderlarni ko'rsat",
    "Ariza qanday topshiraman?",
  ],
  avatarKind: "video",
  avatarImageUrl: null,
  avatarVideoUrl: null,
  sizePx: 56,
  floatingHeightPx: 24,
  particleCount: 18,
  animationSpeed: 1,
  glowEnabled: true,
  particleEnabled: true,
  pulseEnabled: true,
  bloomEnabled: true,
  blurShadowEnabled: true,
  haloEnabled: true,
  voiceEnabled: false,
  glowColor: "#13BCE4",
  borderColor: "#13BCE4",
  backgroundColor: null,
  openingAnimation: "portal",
  closingAnimation: "teleport",
};

/** Raw shape of a `public.ai_assistant_settings` row (snake_case, as returned by Supabase). */
export interface AiAssistantSettingsRow {
  assistant_name: string;
  greeting: string;
  quick_questions: string[];
  avatar_kind: "image" | "video";
  avatar_image_url: string | null;
  avatar_video_url: string | null;
  size_px: number;
  floating_height_px: number;
  particle_count: number;
  animation_speed: number;
  glow_enabled: boolean;
  particle_enabled: boolean;
  pulse_enabled: boolean;
  bloom_enabled: boolean;
  blur_shadow_enabled: boolean;
  halo_enabled: boolean;
  voice_enabled: boolean;
  glow_color: string;
  border_color: string;
  background_color: string | null;
  opening_animation: "portal" | "fade" | "scale";
  closing_animation: "teleport" | "fade" | "scale";
}

/** Maps a DB row to the camelCase shape used throughout the widget. Missing/invalid
 * fields fall back to the matching default rather than throwing, since this also
 * runs against partial Realtime payloads. */
export function mapAiAssistantSettingsRow(
  row: Partial<AiAssistantSettingsRow>,
  fallback: AiAssistantSettings = DEFAULT_AI_ASSISTANT_SETTINGS
): AiAssistantSettings {
  return {
    assistantName: row.assistant_name ?? fallback.assistantName,
    greeting: row.greeting ?? fallback.greeting,
    quickQuestions: row.quick_questions ?? fallback.quickQuestions,
    avatarKind: row.avatar_kind ?? fallback.avatarKind,
    avatarImageUrl: row.avatar_image_url ?? fallback.avatarImageUrl,
    avatarVideoUrl: row.avatar_video_url ?? fallback.avatarVideoUrl,
    sizePx: row.size_px ?? fallback.sizePx,
    floatingHeightPx: row.floating_height_px ?? fallback.floatingHeightPx,
    particleCount: row.particle_count ?? fallback.particleCount,
    animationSpeed: row.animation_speed !== undefined ? Number(row.animation_speed) : fallback.animationSpeed,
    glowEnabled: row.glow_enabled ?? fallback.glowEnabled,
    particleEnabled: row.particle_enabled ?? fallback.particleEnabled,
    pulseEnabled: row.pulse_enabled ?? fallback.pulseEnabled,
    bloomEnabled: row.bloom_enabled ?? fallback.bloomEnabled,
    blurShadowEnabled: row.blur_shadow_enabled ?? fallback.blurShadowEnabled,
    haloEnabled: row.halo_enabled ?? fallback.haloEnabled,
    voiceEnabled: row.voice_enabled ?? fallback.voiceEnabled,
    glowColor: row.glow_color ?? fallback.glowColor,
    borderColor: row.border_color ?? fallback.borderColor,
    backgroundColor: row.background_color ?? fallback.backgroundColor,
    openingAnimation: row.opening_animation ?? fallback.openingAnimation,
    closingAnimation: row.closing_animation ?? fallback.closingAnimation,
  };
}
