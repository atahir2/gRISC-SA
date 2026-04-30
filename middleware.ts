import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/src/lib/supabase/middleware";

/**
 * Refreshes Supabase session cookies on matched routes (required so PostgREST sees auth.uid()
 * on inserts; `/saq` is included even though it stays public).
 *
 * Protects SAQ workflow routes under `/saq/assessment`, `/saq/dashboard`, `/saq/report`.
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth =
    path.startsWith("/saq/assessment") ||
    path.startsWith("/saq/dashboard") ||
    path.startsWith("/saq/report");

  if (needsAuth && !user) {
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
  matcher: [
    /*
     * Match all paths except static assets so Supabase session cookies refresh on every navigation.
     * A narrow matcher can skip /signup, /, etc., leaving PostgREST without a JWT (auth.uid() null)
     * and causing RLS failures on inserts such as "Users create assessments as owner".
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
