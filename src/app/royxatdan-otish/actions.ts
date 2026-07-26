"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validation/auth";
import { SITE_URL } from "@/lib/constants";

export type SignupResult = { ok: true; needsEmailConfirmation: boolean } | { ok: false; error: string };

export async function signUp(input: unknown): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formada xatolik bor." };
  }

  const { fullName, email, password } = parsed.data;
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${SITE_URL}/kirish`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { ok: false, error: "Bu email allaqachon ro'yxatdan o'tgan." };
    }
    return { ok: false, error: "Ro'yxatdan o'tishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
  }

  return { ok: true, needsEmailConfirmation: !data.session };
}
