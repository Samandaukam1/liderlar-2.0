"use server";

import QRCode from "qrcode";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatLinkCode, issueAdabiyotXLink } from "@/lib/adabiyotx-link/link-token";

/*
 * AdabiyotX HISOBINI BOG'LASH — a'zo kabinetidan.
 *
 * Token A'ZONING SEANSIDA tug'iladi (Telegram bog'lash bilan bir xil
 * sabab): shaxs seansdan olinadi, so'rovda o'zgartirib bo'lmaydi.
 * Bog'lanishning o'zi AdabiyotX ilovasi tokenni skaner qilib, o'z
 * serveri orqali liderlar-admin ga yuborganda yuz beradi.
 */

export type AdabiyotXLinkIssue =
  | { ok: true; code: string; qrDataUrl: string; universalLink: string; appLink: string; expiresAt: string }
  | { ok: false; error: string };

export async function createAdabiyotXLink(): Promise<AdabiyotXLinkIssue> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kirmagansiz." };

  const admin = createAdminClient();
  const now = new Date();

  // Eski ishlatilmagan kodlar bekor qilinadi — bir vaqtda bitta amaldagi kod.
  await admin
    .from("adabiyotx_link_tokens")
    .update({ used_at: now.toISOString() })
    .eq("user_id", user.id)
    .is("used_at", null);

  const issued = issueAdabiyotXLink(now);
  const { error } = await admin.from("adabiyotx_link_tokens").insert({
    user_id: user.id,
    token_hash: issued.tokenHash,
    code: issued.code,
    expires_at: issued.expiresAt,
  });
  if (error) {
    console.error("ADABIYOTX_LINK_ISSUE_FAILED", { code: error.code, message: error.message });
    return {
      ok: false,
      error: /relation|does not exist|schema cache/i.test(error.message)
        ? "Bog‘lash hali sozlanmagan (baza migratsiyasi qo‘llanmagan)."
        : "Kod yaratilmadi. Qaytadan urinib ko‘ring.",
    };
  }

  const qrDataUrl = await QRCode.toDataURL(issued.universalLink, { margin: 1, width: 360 });
  return {
    ok: true,
    code: formatLinkCode(issued.code),
    qrDataUrl,
    universalLink: issued.universalLink,
    appLink: issued.appLink,
    expiresAt: issued.expiresAt,
  };
}

export type AdabiyotXActionResult = { ok: true; message: string } | { ok: false; error: string };

async function adminApi(path: string, body: unknown): Promise<{ ok: boolean; payload: Record<string, unknown> | null }> {
  const baseUrl = process.env.LIDERLAR_ADMIN_API_BASE_URL?.trim();
  const key = process.env.LIDERLAR_PUBLIC_CONTENT_API_KEY?.trim();
  if (!baseUrl || !key) return { ok: false, payload: null };
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-liderlar-api-key": key },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    return { ok: response.ok, payload };
  } catch (error) {
    console.error("ADABIYOTX_ADMIN_API_FAILED", path, error instanceof Error ? error.message : String(error));
    return { ok: false, payload: null };
  }
}

/** Kabinetdan uzish: liderlar-admin o'chiradi va AdabiyotX'ga xabar beradi. */
export async function unlinkAdabiyotX(): Promise<AdabiyotXActionResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kirmagansiz." };

  const result = await adminApi("/api/public/adabiyotx/unlink-by-user", { liderlar_user_id: user.id });
  if (!result.ok) {
    // Admin API yetib bormasa ham a'zo uza olishi kerak: bog'lanish bu yerda o'chiriladi.
    const admin = createAdminClient();
    const { error } = await admin.from("adabiyotx_account_links").delete().eq("user_id", user.id);
    if (error) return { ok: false, error: "Uzib bo‘lmadi. Qaytadan urinib ko‘ring." };
    return { ok: true, message: "AdabiyotX hisobi uzildi. Ilovada ham yangilanishi bir necha daqiqa olishi mumkin." };
  }
  return { ok: true, message: "AdabiyotX hisobi uzildi." };
}

/** AdabiyotX'dagi yozgan va o'qigan kitoblarni qayta tortish. */
export async function refreshAdabiyotXLibrary(): Promise<AdabiyotXActionResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kirmagansiz." };

  const result = await adminApi("/api/public/adabiyotx/refresh", { liderlar_user_id: user.id });
  if (!result.ok) {
    const message = typeof result.payload?.error === "string" ? result.payload.error : "AdabiyotX bilan bog‘lanib bo‘lmadi.";
    return { ok: false, error: message };
  }
  const works = Number(result.payload?.works ?? 0);
  const reads = Number(result.payload?.reads ?? 0);
  return { ok: true, message: `Yangilandi: ${works} ta yozgan, ${reads} ta o‘qigan kitob.` };
}
