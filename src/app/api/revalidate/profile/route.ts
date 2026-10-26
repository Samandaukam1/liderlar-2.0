import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  apiKeyMatches,
  parseProfileRevalidation,
  profileCacheTag,
} from "@/lib/data/profile-cache-keys";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * POST /api/revalidate/profile — admin panel profil keshini yangilaydi.
 *
 * Body: `{ "candidateIds": ["<uuid>", ...] }`, sarlavha `x-liderlar-api-key`
 * (admin'ning ommaviy kontent API'si ishlatadigan server-server kaliti).
 *
 * YOPIQ ISHLAYDI: kalit sozlanmagan bo'lsa hech kimga ochilmaydi. Kalit
 * sizib chiqsa ham eng ko'pi keshni tozalash mumkin — ma'lumot qaytmaydi.
 * `{ expire: 0 }` — tashqi tizim chaqiradi, shuning uchun darhol eskiradi
 * (keyingi ochilish yangi ma'lumotni kutadi).
 */
export async function POST(request: Request) {
  const expected = process.env.LIDERLAR_PUBLIC_CONTENT_API_KEY?.trim() ?? "";
  if (!expected) {
    return NextResponse.json({ ok: false, error: "Sozlanmagan" }, { status: 503, headers: NO_STORE });
  }
  if (!apiKeyMatches(expected, request.headers.get("x-liderlar-api-key"))) {
    return NextResponse.json({ ok: false, error: "Ruxsat yo'q" }, { status: 401, headers: NO_STORE });
  }

  const parsed = parseProfileRevalidation(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400, headers: NO_STORE });
  }

  for (const candidateId of parsed.candidateIds) {
    revalidateTag(profileCacheTag(candidateId), { expire: 0 });
  }
  return NextResponse.json({ ok: true, revalidated: parsed.candidateIds.length }, { headers: NO_STORE });
}
