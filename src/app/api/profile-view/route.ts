import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { isBotUserAgent } from "@/lib/analytics/bot-detection";
import { networkHash } from "@/lib/analytics/network-hash";

export const runtime = "nodejs";

const COOKIE = "liderlar_viewer_id";

/**
 * Profil ko'rishini qayd etadi.
 *
 * MAXFIYLIK: xom IP hech qachon saqlanmaydi. Tashrifchi
 * belgisi — brauzerdagi tasodifiy cookie va uning sha256
 * hash'i. U hech qanday shaxsga bog'lanmaydi va uni orqaga
 * yechib bo'lmaydi.
 *
 * ISHONCH CHEGARASI: brauzer yuborgan `automated` maydoni
 * QO'SHIMCHA signal, xolos. Server o'z tomonidan
 * User-Agent'ni ham tekshiradi — mijozga ishonib qo'ysak,
 * uni yubormaslik yetarli bo'lardi.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const candidateSlug = typeof body?.candidateSlug === "string" ? body.candidateSlug : null;

  if (!candidateSlug) {
    return NextResponse.json({ error: "candidateSlug talab qilinadi." }, { status: 400 });
  }

  const serverSaysBot = isBotUserAgent(req.headers.get("user-agent"));
  const clientSaysAutomated = body?.automated === true;
  const isBot = serverSaysBot || clientSaysAutomated;

  /*
   * COOKIE'SIZ SO'ROV SANALMAYDI.
   *
   * Cookie'ni sahifa navigatsiyasida proxy beradi (`src/proxy.ts`).
   * Avval bu yerda cookie'siz so'rovga YANGI ID berilardi va har bir
   * skript so'rovi "yangi noyob ko'rish" bo'lib sanalardi.
   */
  const existingViewerId = req.cookies.get(COOKIE)?.value;
  if (!existingViewerId) {
    const admin = createAdminClient();
    await admin
      .rpc("record_profile_view_exclusion", {
        p_candidate_slug: candidateSlug,
        p_reason: isBot ? "bot" : "no_cookie",
      })
      .then(({ error }) => {
        if (error) console.error("PROFILE_VIEW_EXCLUSION_FAILED", { code: error.code });
      });
    return NextResponse.json({ counted: false });
  }
  const viewerHash = createHash("sha256").update(existingViewerId).digest("hex");

  /*
   * O'Z SAHIFASINI KO'RISH — SERVERDA ANIQLANADI.
   *
   * Foydalanuvchi id sini so'rov tanasidan olsak, uni
   * o'zgartirib boshqa odamning ko'rishi qilib ko'rsatish
   * mumkin bo'lardi. U seansdan olinadi.
   */
  let viewerUserId: string | null = null;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    viewerUserId = user?.id ?? null;
  } catch {
    // Seans o'qilmasa — mehmon deb hisoblanadi.
    viewerUserId = null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("record_profile_view", {
    p_candidate_slug: candidateSlug,
    p_viewer_hash: viewerHash,
    p_viewer_user_id: viewerUserId,
    p_is_bot: isBot,
    // Kunlik chegaralar (tarmoq bo'yicha) — xom IP emas, HMAC.
    p_network_hash: networkHash(req.headers),
  });

  if (error) {
    console.error("PROFILE_VIEW_FAILED", { code: error.code, message: error.message });
  }

  const res = NextResponse.json({ counted: Boolean(data) });
  return res;
}
