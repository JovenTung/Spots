import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// API routes are excluded from the redirect: their handlers run their own
// getUser() check and return a proper 401 JSON instead of an HTML redirect.
// Icon routes must stay public — iOS fetches apple-touch-icon without cookies.
const PUBLIC_PATHS = ["/login", "/auth", "/api", "/icon", "/apple-icon"];

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() revalidates the JWT against the auth server on every request;
  // never trust getSession() here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/places";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Must return the same response object so refreshed auth cookies survive.
  return supabaseResponse;
};
