import { NextResponse, type NextRequest } from "next/server";
import { isFeatureEnabled } from "@/lib/vip/entitlement-service";
import { getOnlineFeed, parseCursor } from "@/lib/data/liderlar-online";

/**
 * GET /api/liderlar-online?keyin=<kursor>
 *
 * Cheksiz lenta uchun keyingi sahifa. Kursor (published_at~id) — butun
 * jadval hech qachon yuklanmaydi. Javob qisqa muddat keshlanadi (bir xil
 * sahifani ko'p o'quvchi so'raydi).
 */
const PAGE = 20;

export async function GET(request: NextRequest) {
  if (!(await isFeatureEnabled("liderlar_online.enabled"))) {
    return NextResponse.json({ items: [], nextCursor: null }, { status: 404 });
  }

  const raw = request.nextUrl.searchParams.get("keyin");
  if (raw && !parseCursor(raw)) {
    return NextResponse.json({ error: "Kursor noto'g'ri." }, { status: 400 });
  }

  const feed = await getOnlineFeed(PAGE, raw);
  return NextResponse.json(feed, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
