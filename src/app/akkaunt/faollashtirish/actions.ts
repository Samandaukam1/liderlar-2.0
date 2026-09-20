"use server";

import { z } from "zod";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  consumeActivation,
  inspectActivation,
  isActivationEnabled,
} from "@/lib/accounts/activation-service";
import { ACTIVATION_FAILURE_TEXT } from "@/lib/accounts/activation-token";

export type ActivateResult =
  | { ok: true; candidateSlug: string | null }
  | { ok: false; error: string };

/*
 * Parol siyosati — mavjud ro'yxatdan o'tish bilan bir xil
 * bo'lishi uchun shu yerda takrorlanadi. Yumshoqroq qilish
 * vasvasa qiladi ("odam qiynalmasin"), lekin bu hisob
 * ensiklopediya profilini boshqaradi.
 */
const passwordSchema = z
  .string()
  .min(8, "Parol kamida 8 belgidan iborat bo'lsin.")
  .max(72, "Parol juda uzun.");

const newAccountSchema = z.object({
  token: z.string().min(10),
  email: z.email("To'g'ri email kiriting."),
  password: passwordSchema,
});

/**
 * YANGI HISOB bilan faollashtirish.
 *
 * TARTIB MUHIM: avval taklifnoma tekshiriladi, keyin hisob
 * yaratiladi. Teskarisi bo'lsa, yaroqsiz havola bilan ham
 * hisob paydo bo'lardi.
 *
 * Parol hech qayerda saqlanmaydi, log'ga tushmaydi va
 * adminga ko'rinmaydi — u to'g'ridan-to'g'ri Supabase Auth'ga
 * boradi.
 */
export async function activateWithNewAccount(
  input: z.input<typeof newAccountSchema>,
): Promise<ActivateResult> {
  if (!(await isActivationEnabled())) {
    return { ok: false, error: ACTIVATION_FAILURE_TEXT.disabled };
  }

  const parsed = newAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ma'lumot noto'g'ri." };
  }

  const { token, email, password } = parsed.data;

  const inspected = await inspectActivation(token);
  if (!inspected.ok) {
    return { ok: false, error: ACTIVATION_FAILURE_TEXT[inspected.reason] };
  }

  const admin = createAdminClient();

  /*
   * Hisob yaratamiz. `email_confirm: true` — chunki shaxsni
   * taklifnomaning o'zi tasdiqlaydi: u nomzodga admin orqali
   * yetib borgan va bir martalik.
   *
   * Profil `handle_new_user` triggeri orqali AVTOMATIK
   * yaratiladi — bu yerda qo'lda yaratsak, dublikat bo'lardi.
   */
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: inspected.target.fullName },
  });

  if (createError || !created?.user) {
    const message = createError?.message?.toLowerCase() ?? "";
    if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
      return { ok: false, error: ACTIVATION_FAILURE_TEXT.email_taken };
    }
    console.error("ACTIVATION_CREATE_USER_FAILED", { code: createError?.status });
    return { ok: false, error: ACTIVATION_FAILURE_TEXT.error };
  }

  const result = await consumeActivation(token, created.user.id, "new_account");

  if (!result.ok) {
    /*
     * Hisob yaratildi-yu bog'lanmadi.
     *
     * Uni o'chirib tashlash vasvasa qiladi, lekin foydalanuvchi
     * allaqachon parol qo'ygan bo'lishi mumkin va o'chirish
     * uni ham yo'qotardi. Holat admin panelda "e'tibor kerak"
     * bo'lib ko'rinadi va qo'lda hal qilinadi.
     */
    return { ok: false, error: ACTIVATION_FAILURE_TEXT[result.reason] };
  }

  return { ok: true, candidateSlug: result.candidateSlug };
}

const existingAccountSchema = z.object({ token: z.string().min(10) });

/**
 * MAVJUD HISOB bilan bog'lash.
 *
 * Nomzod avval o'zi ro'yxatdan o'tgan bo'lishi mumkin. U holda
 * IKKINCHI hisob yaratilmaydi — mavjudi bog'lanadi.
 *
 * Shaxs IKKI TOMONDAN tasdiqlanadi: odam tizimga kirgan
 * (hisob egasi ekani) va havolani ushlab turibdi (nomzod
 * ekani). Bittasining o'zi yetarli emas.
 */
export async function activateWithExistingAccount(
  input: z.input<typeof existingAccountSchema>,
): Promise<ActivateResult> {
  if (!(await isActivationEnabled())) {
    return { ok: false, error: ACTIVATION_FAILURE_TEXT.disabled };
  }

  const parsed = existingAccountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Havola noto'g'ri." };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Avval tizimga kiring, so'ng havolani qaytadan oching." };
  }

  const result = await consumeActivation(parsed.data.token, user.id, "existing_account");

  if (!result.ok) {
    return { ok: false, error: ACTIVATION_FAILURE_TEXT[result.reason] };
  }

  return { ok: true, candidateSlug: result.candidateSlug };
}
