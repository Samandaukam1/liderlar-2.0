import "server-only";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  decide,
  denialText,
  showsVipBadge,
  type Entitlement,
  type EntitlementContext,
  type FeatureFlag,
  type SubscriptionSnapshot,
  type SubscriptionState,
} from "./entitlements";

/**
 * VIP HUQUQLARI — BAZAGA TEGADIGAN QISM.
 *
 * Qoidalar `entitlements.ts` da. Bu yerda faqat holatni yig'ish.
 *
 * `server-only`: bu modul mijoz paketiga tushsa, build yiqiladi.
 * Ataylab — huquq tekshiruvi brauzerda bajarilmasligi kerak.
 */

/* ========================================================================= *
 * FLAGLAR
 * ========================================================================= */

/*
 * FLAGLAR QISQA VAQT KESHLANADI.
 *
 * Ular har so'rovda o'qiladi va kam o'zgaradi. Keshsiz har sahifa
 * ko'rishi qo'shimcha so'rov qilardi — bu loyihada Data API yuklamasi
 * allaqachon muammo bo'lgan.
 *
 * Muddat qisqa (30s): flagni o'chirish — favqulodda to'xtatish yo'li
 * va u daqiqalar kutmasligi kerak.
 */
let flagCache: { at: number; flags: Partial<Record<FeatureFlag, boolean>> } | null = null;
const FLAG_TTL_MS = 30_000;

async function loadFlags(): Promise<Partial<Record<FeatureFlag, boolean>>> {
  if (flagCache && Date.now() - flagCache.at < FLAG_TTL_MS) return flagCache.flags;

  const admin = createAdminClient();
  const { data, error } = await admin.from("feature_flags").select("key, is_enabled");

  if (error) {
    /*
     * FLAG O'QILMASA — HAMMASI O'CHIQ.
     *
     * Bu "fail closed": nosozlikda imkoniyat BERILMAYDI. Teskarisi
     * (xatoda ochib qo'yish) baza uzilganda butun VIP huquqlarini
     * hammaga ochib berardi.
     *
     * Eski kesh bo'lsa, u ishlatiladi — u ham ochiq emas, oxirgi
     * ma'lum holat.
     */
    console.error("[vip] flaglar o'qilmadi:", error.message);
    return flagCache?.flags ?? {};
  }

  const flags: Partial<Record<FeatureFlag, boolean>> = {};
  for (const row of data ?? []) {
    flags[row.key as FeatureFlag] = row.is_enabled === true;
  }

  flagCache = { at: Date.now(), flags };
  return flags;
}

/* ========================================================================= *
 * OBUNA
 * ========================================================================= */

/**
 * Profilning joriy obunasi va tarif huquqlari — BITTA so'rovda.
 *
 * `vip_active_entitlements` ko'rinishi emas, asl jadvallar o'qiladi:
 * ko'rinish faqat AMAL QILAYOTGANLARNI beradi va "obunangiz tugagan"
 * degan xabarni ko'rsatish uchun tugagan obunani ham bilish kerak.
 */
async function loadSubscription(profileId: string): Promise<SubscriptionSnapshot | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("vip_subscriptions")
    .select("state, current_period_end, grace_until, plan_code")
    /*
     * FAQAT TUGALLANMAGAN OBUNA.
     *
     * Bazada shunday obuna bittadan ko'p bo'lishi mumkin emas
     * (`uq_vip_subscription_open`), ya'ni bu yerda tartiblash va
     * tanlash muammosi yo'q.
     */
    .in("state", ["pending", "active", "grace_period", "suspended"])
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error("[vip] obuna o'qilmadi:", error.message);
    return null;
  }
  if (!data) return null;

  const { data: rows, error: entError } = await admin
    .from("vip_plan_entitlements")
    .select("entitlement")
    .eq("plan_code", data.plan_code as string);

  if (entError) {
    console.error("[vip] tarif huquqlari o'qilmadi:", entError.message);
    return null;
  }

  return {
    state: data.state as SubscriptionState,
    currentPeriodEnd: data.current_period_end
      ? new Date(data.current_period_end as string)
      : null,
    graceUntil: data.grace_until ? new Date(data.grace_until as string) : null,
    entitlements: (rows ?? []).map((r) => r.entitlement as string),
  };
}

/* ========================================================================= *
 * OMMAVIY INTERFEYS
 * ========================================================================= */

export interface VipContext extends EntitlementContext {
  profileId: string | null;
}

/**
 * Joriy foydalanuvchi uchun huquq konteksti.
 *
 * SHAXS SERVERDA ANIQLANADI (§44). Brauzerdan kelgan `profile_id`
 * hech qachon ishlatilmaydi — aks holda har kim boshqa odamning
 * huquqlari bilan ish qilardi.
 */
export async function loadVipContext(): Promise<VipContext> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const flags = await loadFlags();
  const now = new Date();

  if (!user) return { profileId: null, subscription: null, flags, now };

  return {
    profileId: user.id,
    subscription: await loadSubscription(user.id),
    flags,
    now,
  };
}

/**
 * YAGONA HUQUQ TEKSHIRUVI.
 *
 * Har qanday nozik amal shundan o'tadi. Frontendda yashirish
 * avtorizatsiya EMAS (§3) — server amalining o'zi ham shuni
 * chaqirishi shart.
 */
export async function can(entitlement: Entitlement): Promise<boolean> {
  const context = await loadVipContext();
  return decide(entitlement, context).allowed;
}

/**
 * Huquqni TALAB qiladi: bo'lmasa, tushunarli matnli xato qaytaradi.
 *
 * Xato TASHLAMAYDI, natija qaytaradi: server amallari (`actions.ts`)
 * foydalanuvchiga matn ko'rsatishi kerak, stack trace emas (§55).
 */
export async function requireEntitlement(
  entitlement: Entitlement,
): Promise<{ ok: true; profileId: string } | { ok: false; error: string }> {
  const context = await loadVipContext();

  if (!context.profileId) {
    return { ok: false, error: "Avval tizimga kiring." };
  }

  const decision = decide(entitlement, context);
  if (!decision.allowed) {
    /*
     * Sabab texnik nomda LOGGA tushadi, foydalanuvchiga esa odam
     * tilidagi matn ketadi.
     */
    console.info("[vip] rad etildi:", { entitlement, reason: decision.reason });
    return { ok: false, error: denialText(decision.reason) };
  }

  return { ok: true, profileId: context.profileId };
}

/** VIP badge ko'rsatilsinmi. */
export async function hasVipBadge(): Promise<boolean> {
  return showsVipBadge(await loadVipContext());
}

/**
 * Ommaviy profil uchun badge — boshqa odamning profilini ko'rganda.
 *
 * `loadVipContext()` dan ALOHIDA: u joriy foydalanuvchi haqida,
 * bu esa ko'rilayotgan profil haqida.
 */
export async function profileHasVipBadge(profileId: string): Promise<boolean> {
  const flags = await loadFlags();
  if (flags["vip.enabled"] !== true) return false;

  return showsVipBadge({
    subscription: await loadSubscription(profileId),
    flags,
    now: new Date(),
  });
}

/**
 * Bitta flagni tekshiradi — obunaga bog'liq bo'lmagan to'siqlar uchun
 * (masalan "Liderlar Online" bo'limi menyuda ko'rinadimi).
 */
export async function isFeatureEnabled(flag: FeatureFlag): Promise<boolean> {
  const flags = await loadFlags();
  return flags[flag] === true;
}
