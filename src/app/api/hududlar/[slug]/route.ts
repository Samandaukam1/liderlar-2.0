import { getPublicRegionInfo } from "@/lib/data/regions-public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/hududlar/[slug]
 *
 * OMMAVIY. Bu yerdan chiqadigan har maydon ochiq bo'lishi kerak va
 * shakl `regions-public.ts` da qat'iy belgilangan: telegram id,
 * ichki telefon, komissiya, lid va CRM eslatmalari bu yo'ldan
 * UMUMAN o'tmaydi.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  // Slug shakli tekshiriladi: ixtiyoriy matn bazaga so'rovga
  // aylanmasin.
  if (!/^[a-z0-9-]{2,64}$/.test(slug)) {
    return Response.json({ error: "Noto‘g‘ri hudud" }, { status: 400 });
  }

  const info = await getPublicRegionInfo(slug);
  if (!info) return Response.json({ error: "Hudud topilmadi" }, { status: 404 });

  return Response.json(info, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
  });
}
