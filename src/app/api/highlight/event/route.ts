import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isBotUserAgent } from "@/lib/analytics/bot-detection";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENTS = new Set(["impression", "click"]);

/**
 * POST /api/highlight/event — bar ko'rsatildi / bosildi.
 *
 * Statistika admin panelda ko'rinadi. Bazadagi funksiya faqat service_role
 * uchun ochiq (anon to'g'ridan-to'g'ri hisobni shishira olmasin); botlar
 * sanalmaydi. Javob har doim 204 — tashrifchi sahifasiga hech qachon xato
 * qaytmaydi. `sendBeacon` matn sifatida yuborishi mumkin, shuning uchun
 * tana qo'lda o'qiladi.
 */
export async function POST(req: NextRequest) {
  if (isBotUserAgent(req.headers.get("user-agent"))) {
    return new NextResponse(null, { status: 204, headers: NO_STORE });
  }

  let body: { id?: unknown; event?: unknown } | null = null;
  try {
    body = JSON.parse(await req.text()) as { id?: unknown; event?: unknown };
  } catch {
    body = null;
  }
  const id = typeof body?.id === "string" ? body.id : "";
  const event = typeof body?.event === "string" ? body.event : "";
  if (!UUID.test(id) || !EVENTS.has(event)) {
    return new NextResponse(null, { status: 204, headers: NO_STORE });
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("track_profile_bar_ad", { p_ad_id: id, p_event: event });
  if (error) console.error("PROFILE_HIGHLIGHT_EVENT_FAILED", { code: error.code });
  return new NextResponse(null, { status: 204, headers: NO_STORE });
}
