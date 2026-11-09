import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { apiKeyMatches } from "@/lib/data/profile-cache-keys";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * POST /api/revalidate/highlight — admin panel biografik sahifa bari
 * o'zgarganda chaqiradi (reklama yoqildi/o'chirildi, sozlama saqlandi).
 *
 * `/api/revalidate/profile` bilan bir xil kalit va bir xil yopiqlik: kalit
 * sozlanmagan bo'lsa hech kimga ochilmaydi, sizib chiqsa ham eng ko'pi
 * keshni tozalash mumkin.
 */
export async function POST(request: Request) {
  const expected = process.env.LIDERLAR_PUBLIC_CONTENT_API_KEY?.trim() ?? "";
  if (!expected) {
    return NextResponse.json({ ok: false, error: "Sozlanmagan" }, { status: 503, headers: NO_STORE });
  }
  if (!apiKeyMatches(expected, request.headers.get("x-liderlar-api-key"))) {
    return NextResponse.json({ ok: false, error: "Ruxsat yo'q" }, { status: 401, headers: NO_STORE });
  }
  revalidateTag("profile-highlight", { expire: 0 });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
