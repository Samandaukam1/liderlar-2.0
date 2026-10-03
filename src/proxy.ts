import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (the exported function is
// now named `proxy`, not `middleware`) — see AGENTS.md and
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
//
// This refreshes the Supabase auth cookie on every navigation and does an
// *optimistic* redirect for the candidate dashboard. Per Next's own guidance,
// proxy is not a full authorization solution — every server component/action
// under /kabinet re-checks the session itself.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /*
   * `getClaims()` — JWT imzosini mahalliy tekshiradi (Auth serverga
   * tarmoq so'rovi yo'q) va kerak bo'lsa sessiyani yangilaydi. Avval
   * `getUser()` har navigatsiyada Auth serverga borardi.
   */
  const { data: claims } = await supabase.auth.getClaims();
  const user = claims?.claims?.sub ? { id: claims.claims.sub } : null;

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/kabinet");

  if (isProtected && !user) {
    const redirectUrl = new URL("/kirish", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
