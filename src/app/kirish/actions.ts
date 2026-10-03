"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginSchema } from "@/lib/validation/auth";
import { looksLikeEmail } from "@/lib/accounts/username";

export type AuthResult = { ok: true } | { ok: false; error: string };

/**
 * Kiritilgan matnni Supabase Auth tushunadigan emailga aylantiradi.
 *
 * Email bo'lsa — o'zi. Login bo'lsa — bazadan ichki manzil
 * olinadi. Ichki manzil foydalanuvchiga hech qachon
 * ko'rsatilmaydi va bu yerdan ham tashqariga chiqmaydi.
 *
 * SQL funksiyasi `security definer` va faqat `service_role` ga
 * ochiq: u bitta qiymat qaytaradi, ro'yxat bermaydi.
 */
async function resolveAuthEmail(identifier: string): Promise<string | null> {
  if (looksLikeEmail(identifier)) return identifier;

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("auth_email_for_username", {
    p_username: identifier,
  });

  if (error) {
    console.error("[kirish] login yechilmadi:", error.message);
    return null;
  }
  return (data as string | null) ?? null;
}

export async function signIn(input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." };
  }

  const { identifier, password } = parsed.data;

  /*
   * XATO MATNI HAR DOIM BIR XIL.
   *
   * "Bunday login yo'q" va "parol noto'g'ri" ni ajratib aytish
   * begona odamga qaysi loginlar mavjudligini tergib ko'rish
   * imkonini berardi.
   */
  const failure: AuthResult = { ok: false, error: "Login yoki parol noto'g'ri." };

  const email = await resolveAuthEmail(identifier);
  if (!email) return failure;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  return error ? failure : { ok: true };
}
