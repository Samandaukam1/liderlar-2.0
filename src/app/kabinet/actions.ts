"use server";

import { redirect } from "next/navigation";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueLinkToken, telegramDeepLink } from "@/lib/mehr/link-token";
import { randomBytes, createHash } from "node:crypto";
import { SITE_URL } from "@/lib/constants";

/*
 * Token formati admin ilovasidagi `tokens.ts` bilan AYNAN bir
 * xil: 32 tasodifiy bayt base64url, bazada sha256 hex hash.
 * Mos kelmasa, chiqarilgan havola `/yangilash/[token]` da
 * tanilmay qolardi.
 */
function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashRawToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}

export type EditRequestResult = { ok: true } | { ok: false; error: string };

export async function requestEdit(note: string): Promise<EditRequestResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kirmagansiz." };

  const admin = createAdminClient();
  const { data: candidate } = await admin
    .from("candidates")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!candidate) return { ok: false, error: "Nomzod profili topilmadi." };

  // Ownership already verified above via the RLS-scoped client; the insert
  // itself uses the service role because audit_logs has no client-facing
  // insert policy (see 0008) — it is meant to be written only by trusted
  // server code / triggers, never directly by a browser client.
  const { error } = await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "profile_edit_request",
    entity_type: "candidates",
    entity_id: candidate.id,
    reason: note,
  });

  if (error) {
    return { ok: false, error: "So'rovni yuborishda xatolik yuz berdi." };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------
 * MEHR 365+ — Telegram hisobini bog'lash
 * ------------------------------------------------------------------ */

export type TelegramLinkResult =
  | { ok: true; deepLink: string; expiresAt: string }
  | { ok: false; error: string };

/**
 * Bog'lash havolasini yaratadi.
 *
 * YO'NALISH MUHIM: havola AYNAN SHU YERDA — hisobga kirgan
 * odamning seansida — tug'iladi va Telegram'da ishlatiladi.
 *
 * Teskarisi bo'lsa, ya'ni botning o'zi havola bersa, birovning
 * Telegram raqamini bilgan odam o'zini o'sha a'zo deb ko'rsatib
 * hisobga ulanib olardi. Bu yerda esa shaxs seansdan kelib
 * chiqadi va uni so'rovda o'zgartirib bo'lmaydi.
 */
export async function createTelegramLink(): Promise<TelegramLinkResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kirmagansiz." };

  const botUsername = process.env.NEXT_PUBLIC_MEMBER_BOT_USERNAME?.trim();
  if (!botUsername) {
    return { ok: false, error: "Bot hali sozlanmagan. Keyinroq urinib ko'ring." };
  }

  const admin = createAdminClient();
  const now = new Date();

  /*
   * Eski ishlatilmagan havolalar bekor qilinadi.
   *
   * Bir vaqtda bir nechta amaldagi havola bo'lsa, eskisi ekran
   * suratida yoki nusxa buferida qolib, keyin kimdir undan
   * foydalanishi mumkin edi.
   */
  await admin
    .from("member_link_tokens")
    .update({ used_at: now.toISOString() })
    .eq("profile_id", user.id)
    .is("used_at", null);

  const issued = issueLinkToken(now);

  const { error } = await admin.from("member_link_tokens").insert({
    profile_id: user.id,
    // Tokenning O'ZI emas, faqat hash. Baza nusxasi sizsa ham,
    // undan ishlaydigan havola yasab bo'lmaydi.
    token_hash: issued.tokenHash,
    expires_at: issued.expiresAt,
  });

  if (error) {
    console.error("TELEGRAM_LINK_ISSUE_FAILED", { code: error.code, message: error.message });
    return { ok: false, error: "Havola yaratilmadi. Qaytadan urinib ko'ring." };
  }

  const deepLink = telegramDeepLink(botUsername, issued.token);
  if (!deepLink) return { ok: false, error: "Bot hali sozlanmagan." };

  return { ok: true, deepLink, expiresAt: issued.expiresAt };
}

/* ------------------------------------------------------------------
 * OYLIK HAVOLALAR
 * ------------------------------------------------------------------ */

export type MonthlyLinkResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * O'sha davr uchun ishlaydigan havolani chiqaradi.
 *
 * HAR CHAQIRUVDA YANGI XOM TOKEN.
 *
 * Bazada faqat hash saqlanadi — bu ataylab, shunda bazaga
 * kirish huquqiga ega odam ham havolani ishlata olmaydi.
 * Demak "saqlangan havolani ko'rsatish" mumkin emas va har
 * ochishda yangisi chiqariladi.
 *
 * Yon foyda: ekran suratida yoki nusxa buferida qolgan eski
 * havola shu zahoti ishlamay qoladi.
 *
 * NOMZOD SO'ROVDAN OLINMAYDI — u seansdagi foydalanuvchining
 * nomzodi. Aks holda istalgan odam boshqa birovning
 * havolasini chiqarib olardi.
 */
export async function openMonthlyLink(period: string): Promise<MonthlyLinkResult> {
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return { ok: false, error: "Davr noto'g'ri." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kirmagansiz." };

  const admin = createAdminClient();

  const { data: candidate } = await admin
    .from("candidates")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!candidate) return { ok: false, error: "Nomzod profili topilmadi." };

  const raw = generateRawToken();
  const nowIso = new Date().toISOString();

  /*
   * SHARTLI UPDATE: faqat amaldagi, muddati o'tmagan yozuv.
   * Avval o'qib keyin yozsak, shu orada admin uni bekor
   * qilgan bo'lsa ham havola berilardi.
   */
  const { data, error } = await admin
    .from("monthly_update_tokens")
    .update({ token_hash: hashRawToken(raw), opened_at: nowIso })
    .eq("candidate_id", candidate.id)
    .eq("period_key", period)
    .eq("status", "active")
    .gt("expires_at", nowIso)
    .select("period_key")
    .maybeSingle();

  if (error) {
    console.error("MONTHLY_LINK_OPEN_FAILED", { code: error.code, message: error.message });
    return { ok: false, error: "Havolani ochib bo'lmadi." };
  }

  if (!data) {
    return {
      ok: false,
      error: "Bu havola endi amal qilmaydi. Keyingi oy yangisi tayyorlanadi.",
    };
  }

  return { ok: true, url: `${SITE_URL}/yangilash/${raw}` };
}
