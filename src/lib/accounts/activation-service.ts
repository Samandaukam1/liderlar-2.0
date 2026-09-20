import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashActivationToken, type ActivationFailure } from "./activation-token";

/**
 * Faollashtirishni ishlatish (web tomoni).
 *
 * ATOMIKLIK CHEGARASI — OCHIQ AYTILGAN.
 *
 * Supabase Auth va Postgres alohida tizimlar; ular orasida
 * bitta tranzaksiya yo'q. Shuning uchun tartib qat'iy:
 *
 *   1. Taklifnoma SHARTLI UPDATE bilan egallanadi — MUTEX.
 *      Ikki so'rov bir vaqtda kelsa, faqat bittasi o'tadi.
 *   2. Auth foydalanuvchi yaratiladi yoki mavjudi olinadi.
 *   3. Nomzod SHARTLI UPDATE bilan bog'lanadi.
 *
 * Agar 3-qadam yiqilsa, holat YASHIRILMAYDI: admin panelda
 * "e'tibor kerak" bo'lib ko'rinadi va qo'lda hal qilinadi.
 * Yarim holatni jimgina "muvaffaqiyat" deb ko'rsatish
 * foydalanuvchini keyin tushunarsiz xatoga olib borardi.
 */

export interface ActivationTarget {
  candidateId: string;
  fullName: string;
  slug: string | null;
  avatarUrl: string | null;
  regionName: string | null;
  isPublished: boolean;
}

export type InspectResult =
  | { ok: true; target: ActivationTarget }
  | { ok: false; reason: ActivationFailure };

/**
 * Havolani ochgan odamga nima ko'rsatishni aniqlaydi.
 *
 * YAROQSIZ TOKEN HECH QANDAY MA'LUMOT BERMAYDI — ism ham,
 * rasm ham. Aks holda havolalarni taxmin qilib, kim kim
 * ekanini bilib olish mumkin bo'lardi.
 */
export async function inspectActivation(
  rawToken: string,
  now: Date = new Date(),
): Promise<InspectResult> {
  const db = createAdminClient();

  const { data: row, error } = await db
    .from("candidate_activations")
    .select(
      "id, candidate_id, expires_at, consumed_at, revoked_at, " +
        "candidates(id, full_name, slug, avatar_url, status, user_id, regions(name))",
    )
    .eq("token_hash", hashActivationToken(rawToken))
    .maybeSingle();

  if (error) {
    console.error("ACTIVATION_INSPECT_FAILED", { code: error.code, message: error.message });
    return { ok: false, reason: "error" };
  }
  if (!row) return { ok: false, reason: "not_found" };

  const data = row as unknown as {
    expires_at: string;
    consumed_at: string | null;
    revoked_at: string | null;
    candidates: {
      id: string;
      full_name: string;
      slug: string | null;
      avatar_url: string | null;
      status: string;
      user_id: string | null;
      regions: { name?: string } | null;
    } | null;
  };

  if (data.revoked_at) return { ok: false, reason: "revoked" };
  if (data.consumed_at) return { ok: false, reason: "consumed" };

  const expires = new Date(data.expires_at);
  if (!Number.isFinite(expires.getTime()) || expires <= now) {
    return { ok: false, reason: "expired" };
  }

  const candidate = data.candidates;
  if (!candidate) return { ok: false, reason: "not_found" };
  if (candidate.user_id) return { ok: false, reason: "already_linked" };

  return {
    ok: true,
    target: {
      candidateId: candidate.id,
      fullName: candidate.full_name,
      slug: candidate.slug,
      avatarUrl: candidate.avatar_url,
      regionName: candidate.regions?.name ?? null,
      isPublished: candidate.status === "published",
    },
  };
}

export type ConsumeResult =
  | { ok: true; candidateSlug: string | null }
  | { ok: false; reason: ActivationFailure };

/**
 * Taklifnomani ishlatib, hisobni nomzodga bog'laydi.
 *
 * `authUserId` — CHAQIRUVCHI tomonidan tasdiqlangan shaxs:
 * yo endigina yaratilgan hisob, yo tizimga kirgan
 * foydalanuvchining seansidan olingan id. Uni so'rov
 * tanasidan olish MUMKIN EMAS.
 */
export async function consumeActivation(
  rawToken: string,
  authUserId: string,
  mode: "new_account" | "existing_account",
  now: Date = new Date(),
): Promise<ConsumeResult> {
  const db = createAdminClient();
  const nowIso = now.toISOString();

  /*
   * Bu hisob allaqachon boshqa nomzodga bog'langanmi?
   *
   * Bog'langan bo'lsa, ikkinchisini biriktirish bir odamning
   * ikkita ensiklopediya profilini egallashiga olib borardi.
   */
  const { data: existing } = await db
    .from("candidates")
    .select("id")
    .eq("user_id", authUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    await db.from("member_security_events").insert({
      profile_id: authUserId,
      event_type: "account_link_conflict",
      actor: "member",
      metadata: { reason: "auth_user_already_linked" },
    });
    return { ok: false, reason: "user_already_linked" };
  }

  // 1. MUTEX
  const { data: claimed, error: claimError } = await db
    .from("candidate_activations")
    .update({ consumed_at: nowIso, consumed_by_user_id: authUserId, consumed_mode: mode })
    .eq("token_hash", hashActivationToken(rawToken))
    .is("consumed_at", null)
    .is("revoked_at", null)
    .gt("expires_at", nowIso)
    .select("candidate_id")
    .maybeSingle();

  if (claimError) {
    console.error("ACTIVATION_CLAIM_FAILED", { code: claimError.code, message: claimError.message });
    return { ok: false, reason: "error" };
  }

  if (!claimed) {
    // Nega bo'lmadi — aniq javob berish uchun qayta tekshiramiz.
    const inspected = await inspectActivation(rawToken, now);
    return { ok: false, reason: inspected.ok ? "error" : inspected.reason };
  }

  const candidateId = claimed.candidate_id as string;

  // 2. Bog'lash — shartli.
  const { data: linked, error: linkError } = await db
    .from("candidates")
    .update({ user_id: authUserId })
    .eq("id", candidateId)
    .is("user_id", null)
    .is("deleted_at", null)
    .select("slug")
    .maybeSingle();

  if (linkError || !linked) {
    console.error("ACTIVATION_LINK_FAILED", {
      code: linkError?.code,
      message: linkError?.message,
    });

    await db.from("member_security_events").insert({
      candidate_id: candidateId,
      profile_id: authUserId,
      event_type: "activation_failed",
      actor: "system",
      metadata: { stage: "link" },
    });

    return { ok: false, reason: "needs_reconcile" };
  }

  await db.from("member_security_events").insert([
    {
      candidate_id: candidateId,
      profile_id: authUserId,
      event_type: "activation_consumed",
      actor: "member",
      metadata: { mode },
    },
    {
      candidate_id: candidateId,
      profile_id: authUserId,
      event_type: "account_linked",
      actor: "member",
      metadata: { mode },
    },
  ]);

  // A'zo hisobi yozuvi — bloklash/tiklash shunga tayanadi.
  await db
    .from("member_accounts")
    .upsert({ profile_id: authUserId, status: "active" }, { onConflict: "profile_id" });

  return { ok: true, candidateSlug: (linked.slug as string | null) ?? null };
}

/** Faollashtirish bayrog'i. O'qib bo'lmasa — yopiq. */
export async function isActivationEnabled(): Promise<boolean> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("site_settings")
    .select("value")
    .eq("key", "member.account_activation_enabled")
    .maybeSingle();

  if (error) return false;
  return data?.value?.trim().toLowerCase() === "true";
}
