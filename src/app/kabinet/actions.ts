"use server";

import { redirect } from "next/navigation";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueLinkToken, telegramDeepLink } from "@/lib/mehr/link-token";

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
