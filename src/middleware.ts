import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/venues") ||
    pathname.startsWith("/api/courts") ||
    pathname.startsWith("/api/bookings") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/cron") ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isOperatorRoute = pathname.startsWith("/operator");
  const isSuperadminRoute = pathname.startsWith("/superadmin");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isOperatorRoute || isSuperadminRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicPath(pathname)) {
    return response;
  }

  if (isOperatorRoute || isSuperadminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (isSuperadminRoute && role !== "superadmin") {
      return NextResponse.redirect(new URL("/operator/dashboard", request.url));
    }

    if (isOperatorRoute && role === "superadmin") {
      if (pathname.startsWith("/operator/bookings")) {
        const suffix = pathname.slice("/operator/bookings".length);
        return NextResponse.redirect(new URL(`/superadmin/bookings${suffix}`, request.url));
      }
      return NextResponse.redirect(new URL("/superadmin/dashboard", request.url));
    }

    if (isOperatorRoute && role !== "operator" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|uploads).*)",
  ],
};
