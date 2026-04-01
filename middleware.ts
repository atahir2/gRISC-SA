import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/src/lib/supabase/middleware";

/**
 * Protects SAQ workflow routes; `/saq` remains public (login/signup CTA when logged out).
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    const redirectResponse = NextResponse.redirect(login);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/saq/assessment/:path*", "/saq/dashboard/:path*", "/saq/report/:path*"],
};
