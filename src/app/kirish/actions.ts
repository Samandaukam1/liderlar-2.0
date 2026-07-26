"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signIn(input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: "Email yoki parol noto'g'ri." };
  }

  return { ok: true };
}
