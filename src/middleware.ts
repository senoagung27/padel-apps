import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  // Create Supabase client and refresh session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes — no auth required
  if (
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
  ) {
    return response;
  }

  // Protected: operator & superadmin dashboards
  const isOperatorRoute = pathname.startsWith("/operator");
  const isSuperadminRoute = pathname.startsWith("/superadmin");

  if (isOperatorRoute || isSuperadminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Fetch role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Role-based access
    if (isSuperadminRoute && role !== "superadmin") {
      return NextResponse.redirect(new URL("/operator/dashboard", request.url));
    }

    if (
      isOperatorRoute &&
      role !== "operator" &&
      role !== "superadmin"
    ) {
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
