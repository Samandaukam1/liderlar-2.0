import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import { can, requireEntitlement } from "@/lib/vip/entitlement-service";
import { resolveOwnCandidate } from "@/lib/profile-editor/edit-service";
import {
  checkThemeChoice,
  DEFAULT_THEME,
  resolveTheme,
  THEME_PROBLEM_TEXT,
  type ThemeKey,
} from "./registry";

/**
 * DIZAYN TANLOVI — O'QISH.
 *
 * Ommaviy sahifa shu funksiyani chaqiradi, ya'ni u TEZ va XATOGA
 * CHIDAMLI bo'lishi kerak: dizayn o'qilmasa, sahifa standart
 * ko'rinishda ochiladi va foydalanuvchi hech narsa sezmaydi.
 */

export interface ThemeSelection {
  published: ThemeKey;
  /** Egasi ko'rib chiqayotgan dizayn. `null` — qoralama yo'q. */
  draft: ThemeKey | null;
}

/**
 * Nomzodning dizayn tanlovini o'qiydi.
 *
 * XATODA STANDART QAYTADI, xato tashlamaydi: ommaviy profil dizayn
 * jadvali sababli ochilmay qolmasligi kerak (§11 "safe fallback").
 */
export async function loadThemeSelection(candidateId: string): Promise<ThemeSelection> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("candidate_theme_preferences")
    .select("published_theme, draft_theme")
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (error) {
    console.error("[dizayn] tanlov o'qilmadi:", error.message);
    return { published: resolveTheme(null), draft: null };
  }

  const draftRaw = data?.draft_theme ?? null;

  return {
    published: resolveTheme(data?.published_theme ?? null),
    /*
     * Qoralama BO'LMASA `null` qaytadi, standart EMAS.
     *
     * `resolveTheme(null)` standartni berardi va "qoralama bor, u
     * standart" degan yolg'on holat paydo bo'lardi — natijada
     * "Nashr qilish" tugmasi hech narsa o'zgartirmasa ham faol
     * ko'rinardi.
     */
    draft: draftRaw === null ? null : resolveTheme(draftRaw),
  };
}

/* ========================================================================= *
 * YOZISH
 * ========================================================================= */

export type ThemeWriteResult = { ok: true } | { ok: false; error: string };

/**
 * Qoralama dizaynni qo'yadi — OMMAVIY sahifaga tegmaydi.
 *
 * §11: "Preview must not immediately change public page." Shuning
 * uchun bu funksiya `draft_theme` ni yozadi, `published_theme` ni
 * emas.
 */
export async function setDraftTheme(key: unknown): Promise<ThemeWriteResult> {
  const entitled = await requireEntitlement("profile.premium_themes");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  /*
   * PREMIUM HUQUQI ALOHIDA TEKSHIRILADI.
   *
   * `requireEntitlement` yuqorida o'tgan bo'lsa ham, `checkThemeChoice`
   * ga aniq qiymat berish kerak: standart dizayn obunasiz ham
   * tanlanishi mumkin va bu mantiq reyestrda turadi.
   */
  const hasPremium = await can("profile.premium_themes");
  const choice = checkThemeChoice(key, hasPremium);
  if (!choice.ok) return { ok: false, error: THEME_PROBLEM_TEXT[choice.problem] };

  const admin = createAdminClient();
  const { error } = await admin
    .from("candidate_theme_preferences")
    .upsert(
      { candidate_id: resolved.owned.candidateId, draft_theme: choice.key },
      { onConflict: "candidate_id" },
    );

  if (error) {
    console.error("[dizayn] qoralama saqlanmadi:", error.message);
    return { ok: false, error: "Tanlovni saqlab bo'lmadi." };
  }
  return { ok: true };
}

/**
 * Qoralamani nashr qiladi — ommaviy sahifa SHUNDAN KEYIN o'zgaradi.
 *
 * QORALAMA YO'Q BO'LSA, HECH NARSA QILINMAYDI. Aks holda "Nashr
 * qilish" tugmasi tasodifan bosilganda nashr qilingan dizayn
 * standartga tushib ketardi.
 */
export async function publishDraftTheme(): Promise<ThemeWriteResult> {
  const entitled = await requireEntitlement("profile.premium_themes");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const current = await loadThemeSelection(resolved.owned.candidateId);
  if (current.draft === null) {
    return { ok: false, error: "Nashr qilinadigan tanlov yo'q." };
  }

  /*
   * NASHR PAYTIDA HUQUQ QAYTA TEKSHIRILADI.
   *
   * Qoralama obuna faol bo'lganda qo'yilgan, lekin nashrga
   * bosilgunicha obuna tugagan bo'lishi mumkin.
   */
  const hasPremium = await can("profile.premium_themes");
  const choice = checkThemeChoice(current.draft, hasPremium);
  if (!choice.ok) return { ok: false, error: THEME_PROBLEM_TEXT[choice.problem] };

  const admin = createAdminClient();
  const { error } = await admin
    .from("candidate_theme_preferences")
    .update({
      published_theme: choice.key,
      published_at: new Date().toISOString(),
      /*
       * Qoralama TOZALANADI.
       *
       * Qolsa, "nashr qilinmagan o'zgarish bor" degan holat
       * abadiy ko'rinib turardi.
       */
      draft_theme: null,
    })
    .eq("candidate_id", resolved.owned.candidateId);

  if (error) {
    console.error("[dizayn] nashr qilinmadi:", error.message);
    return { ok: false, error: "Nashr qilib bo'lmadi." };
  }

  await recordAudit("profile.theme.published", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    before: { theme: current.published },
    after: { theme: choice.key },
  });

  return { ok: true };
}

/** Qoralamani tashlab yuboradi — nashr qilingan dizayn o'zgarmaydi. */
export async function discardDraftTheme(): Promise<ThemeWriteResult> {
  const entitled = await requireEntitlement("profile.premium_themes");
  if (!entitled.ok) return { ok: false, error: entitled.error };

  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("candidate_theme_preferences")
    .update({ draft_theme: null })
    .eq("candidate_id", resolved.owned.candidateId);

  if (error) {
    console.error("[dizayn] qoralama tashlanmadi:", error.message);
    return { ok: false, error: "Bekor qilib bo'lmadi." };
  }
  return { ok: true };
}

/**
 * Standart dizaynga qaytaradi.
 *
 * ALOHIDA AMAL: `setDraftTheme(DEFAULT_THEME)` + nashr ikki qadam
 * bo'lardi, holbuki "standartga qaytish" bitta ongli qaror. Ustiga
 * u obuna TUGAGAN odamga ham kerak — u premium huquqiga ega emas,
 * ya'ni oddiy tanlash yo'lidan o'tolmaydi.
 */
export async function resetToDefaultTheme(): Promise<ThemeWriteResult> {
  const resolved = await resolveOwnCandidate();
  if (!resolved.ok) return { ok: false, error: resolved.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("candidate_theme_preferences")
    .upsert(
      {
        candidate_id: resolved.owned.candidateId,
        published_theme: DEFAULT_THEME,
        draft_theme: null,
        published_at: new Date().toISOString(),
      },
      { onConflict: "candidate_id" },
    );

  if (error) {
    console.error("[dizayn] standartga qaytarilmadi:", error.message);
    return { ok: false, error: "Standart dizaynga qaytarib bo'lmadi." };
  }

  await recordAudit("profile.theme.reset", {
    actorId: resolved.owned.profileId,
    entityId: resolved.owned.candidateId,
    after: { theme: DEFAULT_THEME },
  });

  return { ok: true };
}
