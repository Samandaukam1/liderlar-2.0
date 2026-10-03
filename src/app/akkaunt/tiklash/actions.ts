"use server";

import { z } from "zod";
import { checkNewPassword } from "@/lib/accounts/recovery-token";
import { completeRecovery, recoveryFailureText } from "@/lib/accounts/recovery-service";

export type RecoveryResult =
  | { ok: true; loginHint: string | null }
  | { ok: false; error: string };

const schema = z.object({
  token: z.string(),
  password: z.string(),
  confirm: z.string(),
});

/**
 * Yangi parolni o'rnatadi.
 *
 * Parol faqat shu so'rov ichida yashaydi: tekshiriladi va to'g'ridan-
 * to'g'ri Supabase Auth'ga uzatiladi. Javobda ham, log'da ham yo'q.
 */
export async function resetPasswordWithRecovery(
  input: z.input<typeof schema>,
): Promise<RecoveryResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ma'lumot noto'g'ri." };

  // Parol shakli — havolaga tegishdan OLDIN: qisqa parol havolani sarflamasin.
  const problem = checkNewPassword(parsed.data.password, parsed.data.confirm);
  if (problem) return { ok: false, error: problem };

  const result = await completeRecovery(parsed.data.token, parsed.data.password);
  return result.ok
    ? { ok: true, loginHint: result.loginHint }
    : { ok: false, error: recoveryFailureText(result.reason) };
}
