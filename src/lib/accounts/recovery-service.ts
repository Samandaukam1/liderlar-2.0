import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/vip/audit-log";
import {
  hashRecoveryToken,
  looksLikeRecoveryToken,
  recoveryState,
  RECOVERY_FAILURE_TEXT,
  type RecoveryState,
} from "./recovery-token";
import { isInternalAuthEmail } from "./username";

/**
 * PAROLNI TIKLASH — SAYT TOMONI.
 *
 * Admin panel bergan bir martalik havolani tekshiradi va a'zoga O'Z
 * parolini qo'yish imkonini beradi.
 *
 * NIMA QILMAYDI: yangi hisob, profil yoki nomzod yaratmaydi;
 * `candidates.user_id` ga tegmaydi. Faqat mavjud auth hisobining paroli
 * almashadi — kirgandan keyin odam aynan o'z kabinetiga tushadi.
 *
 * PAROL HECH QAYERDA SAQLANMAYDI va log'ga tushmaydi: u to'g'ridan-
 * to'g'ri Supabase Auth'ga (`updateUserById`) boradi.
 */

export type RecoveryFailure = Exclude<RecoveryState, "active"> | "blocked" | "error";

const FAILURE_TEXT: Readonly<Record<RecoveryFailure, string>> = {
  ...RECOVERY_FAILURE_TEXT,
  blocked: "Hisobingiz vaqtincha bloklangan. Administrator bilan bog'laning.",
  error: "Parolni saqlab bo'lmadi. Birozdan keyin qaytadan urinib ko'ring.",
};

export function recoveryFailureText(reason: RecoveryFailure): string {
  return FAILURE_TEXT[reason];
}

export interface RecoveryTarget {
  fullName: string;
  /**
   * Kirishda nima yoziladi: login, bo'lmasa haqiqiy email.
   *
   * Ichki manzil (`…@users.liderlar.uz`) HECH QACHON ko'rsatilmaydi —
   * u bilan kirish mumkin bo'lsa ham, odam uni bilmaydi va eslab
   * qololmaydi.
   */
  loginHint: string | null;
}

interface RecoveryRow {
  id: string;
  profile_id: string;
  expires_at: string;
  consumed_at: string | null;
  revoked_at: string | null;
}

async function loadRow(rawToken: string): Promise<RecoveryRow | null | "error"> {
  if (!looksLikeRecoveryToken(rawToken)) return null;

  const { data, error } = await createAdminClient()
    .from("account_recoveries")
    .select("id, profile_id, expires_at, consumed_at, revoked_at")
    .eq("token_hash", hashRecoveryToken(rawToken))
    .maybeSingle();

  if (error) {
    console.error("RECOVERY_READ_FAILED", { code: error.code });
    return "error";
  }
  return (data as RecoveryRow | null) ?? null;
}

async function isBlocked(profileId: string): Promise<boolean | "error"> {
  const { data, error } = await createAdminClient()
    .from("member_accounts")
    .select("status")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) return "error";
  return data?.status === "disabled";
}

async function loadTarget(profileId: string): Promise<RecoveryTarget | null> {
  const admin = createAdminClient();

  const [{ data: profile }, { data: candidate }, { data: auth }] = await Promise.all([
    admin.from("profiles").select("full_name, username").eq("id", profileId).maybeSingle(),
    admin.from("candidates").select("full_name").eq("user_id", profileId).is("deleted_at", null).maybeSingle(),
    admin.auth.admin.getUserById(profileId),
  ]);

  const email = auth?.user?.email ?? null;
  if (!auth?.user) return null;

  return {
    fullName:
      (candidate?.full_name as string | null)?.trim() ||
      (profile?.full_name as string | null)?.trim() ||
      "Liderlar.uz a'zosi",
    loginHint:
      (profile?.username as string | null) ?? (email && !isInternalAuthEmail(email) ? email : null),
  };
}

/**
 * Havolani ochgan odamga nima ko'rsatishni aniqlaydi.
 *
 * YAROQSIZ HAVOLA HECH QANDAY MA'LUMOT BERMAYDI — ism ham, login ham
 * faqat token haqiqiy va amalda bo'lsa ko'rsatiladi.
 */
export async function inspectRecovery(
  rawToken: string,
  now: Date = new Date(),
): Promise<{ ok: true; target: RecoveryTarget } | { ok: false; reason: RecoveryFailure }> {
  const row = await loadRow(rawToken);
  if (row === "error") return { ok: false, reason: "error" };

  const state = recoveryState(
    row
      ? { tokenHash: "", expiresAt: row.expires_at, consumedAt: row.consumed_at, revokedAt: row.revoked_at }
      : null,
    now,
  );
  if (state !== "active" || !row) return { ok: false, reason: state === "active" ? "not_found" : state };

  const blocked = await isBlocked(row.profile_id);
  if (blocked === "error") return { ok: false, reason: "error" };
  if (blocked) return { ok: false, reason: "blocked" };

  const target = await loadTarget(row.profile_id);
  return target ? { ok: true, target } : { ok: false, reason: "not_found" };
}

/**
 * Havolani ishlatib, yangi parolni o'rnatadi.
 *
 * TARTIB — BIR MARTALIKNING KAFOLATI:
 *
 *   1. Havola SHARTLI UPDATE bilan egallanadi (MUTEX). Ikki so'rov
 *      bir vaqtda kelsa, faqat bittasi qator o'zgartiradi.
 *   2. Parol Supabase Auth'ga yoziladi.
 *   3. Yiqilsa — havola QAYTARILADI (faqat aynan shu egallash), odam
 *      qayta urinishi mumkin. Auth va Postgres orasida umumiy
 *      tranzaksiya yo'q; bu — eng yaqin xavfsiz yechim.
 *   4. Eski sessiyalar yopiladi: hisob begona qo'lda bo'lgani uchun
 *      tiklash so'ralgan bo'lsa, begona odam ichkarida qolmasin.
 */
export async function completeRecovery(
  rawToken: string,
  password: string,
): Promise<{ ok: true; loginHint: string | null } | { ok: false; reason: RecoveryFailure }> {
  if (!looksLikeRecoveryToken(rawToken)) return { ok: false, reason: "not_found" };

  const admin = createAdminClient();
  const claimedAt = new Date().toISOString();

  const { data: claimed, error: claimError } = await admin
    .from("account_recoveries")
    .update({ consumed_at: claimedAt })
    .eq("token_hash", hashRecoveryToken(rawToken))
    .is("consumed_at", null)
    .is("revoked_at", null)
    .gt("expires_at", claimedAt)
    .select("id, profile_id")
    .maybeSingle();

  if (claimError) {
    console.error("RECOVERY_CLAIM_FAILED", { code: claimError.code });
    return { ok: false, reason: "error" };
  }

  if (!claimed) {
    // Nega bo'lmadi — odamga aniq javob berish uchun.
    const inspected = await inspectRecovery(rawToken);
    return { ok: false, reason: inspected.ok ? "error" : inspected.reason };
  }

  const recoveryId = claimed.id as string;
  const profileId = claimed.profile_id as string;

  const release = async () => {
    await admin
      .from("account_recoveries")
      .update({ consumed_at: null })
      .eq("id", recoveryId)
      .eq("consumed_at", claimedAt);
  };

  const blocked = await isBlocked(profileId);
  if (blocked !== false) {
    await release();
    return { ok: false, reason: blocked === true ? "blocked" : "error" };
  }

  const { error: authError } = await admin.auth.admin.updateUserById(profileId, { password });
  if (authError) {
    // Parol matni ham, xato tafsiloti ham log'ga tushmaydi — faqat kod.
    console.error("RECOVERY_PASSWORD_UPDATE_FAILED", { status: authError.status, code: authError.code });
    await release();
    return { ok: false, reason: "error" };
  }

  const { error: sessionError } = await admin.rpc("revoke_user_sessions", { p_user_id: profileId });
  if (sessionError) {
    // Parol allaqachon almashgan — bu nosozlik uni bekor qilmaydi, lekin yashirilmaydi.
    console.error("RECOVERY_SESSION_REVOKE_FAILED", { code: sessionError.code });
  }

  await admin.from("member_security_events").insert({
    profile_id: profileId,
    event_type: "password_reset_completed",
    actor: "member",
    metadata: { sessions_revoked: !sessionError },
  });

  await recordAudit("account.recovery.completed", {
    actorId: profileId,
    entityId: profileId,
    metadata: { recovery_id: recoveryId, sessions_revoked: !sessionError },
  });

  const target = await loadTarget(profileId);
  return { ok: true, loginHint: target?.loginHint ?? null };
}
