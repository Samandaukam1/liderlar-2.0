import { getSiteBranding } from "@/lib/branding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /favicon.ico  (rewrite orqali)
 *
 * NEGA KERAK: Google va boshqa krauler'lar sahifadagi
 * `<link rel="icon">` teglarini emas, saytning ILDIZIDAGI
 * `/favicon.ico` faylini so'raydi. Biz metadata'ni to'g'irlagan
 * bo'lsak ham, o'sha manzilda Next'ning standart fayli (Vercel
 * uchburchagi) turgani uchun qidiruv natijasida o'sha belgi
 * ko'rinaverardi.
 *
 * Shu sababli `/favicon.ico` endi STATIK FAYL EMAS: u admin
 * paneldan yuklangan ikonkani qaytaradi.
 *
 * `.ico` yo'lida PNG qaytarish normal — brauzerlar ham, qidiruv
 * tizimlari ham `Content-Type` ga qaraydi, kengaytmaga emas.
 */
export async function GET(request: Request): Promise<Response> {
  const branding = await getSiteBranding();

  // 32px — qidiruv natijalari va brauzer yorlig'i uchun ishlatiladigan
  // o'lcham. Bo'lmasa 16 yoki 192 ga tushamiz.
  const source = branding.icons[32] ?? branding.icons[16] ?? branding.icons[192] ?? null;

  if (!source) {
    /*
     * Brending o'rnatilmagan — standart faylga yo'naltiramiz.
     *
     * U ataylab BOSHQA nomda (`favicon-default.ico`): `/favicon.ico`
     * shu route'ga qayta yozilgani uchun o'sha nomga yo'naltirish
     * cheksiz aylanma bo'lardi.
     */
    return defaultIcon(request);
  }

  try {
    const upstream = await fetch(source, { cache: "no-store" });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/png",
        /*
         * Bir kunlik kesh.
         *
         * Favicon kamdan-kam o'zgaradi, qidiruv tizimlari esa uni
         * o'zi ham uzoq saqlaydi. Qisqaroq kesh har krauler
         * so'roviga Supabase'ga borishni anglatardi.
         */
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    // Supabase javob bermadi — sayt belgisiz qolmasin.
    return defaultIcon(request);
  }
}

/**
 * Standart belgiga yo'naltirish.
 *
 * Manzil SO'ROVDAN olinadi, kodda qotib qolmaydi: aks holda
 * preview deploy'lar ham productionga yo'naltirardi va o'sha
 * deploy'da belgini tekshirib bo'lmasdi.
 */
function defaultIcon(request: Request): Response {
  return Response.redirect(new URL("/favicon-default.ico", request.url), 302);
}
