import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/venues") ||
    pathname.startsWith("/api/courts") ||
    pathname.startsWith("/api/bookings") ||
    pathname.startsWith("/api/upload") ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Protected: operator & superadmin dashboards
  const isOperatorRoute = pathname.startsWith("/operator");
  const isSuperadminRoute = pathname.startsWith("/superadmin");

  if (isOperatorRoute || isSuperadminRoute) {
    // Check for session cookie
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify session via Better Auth API
    try {
      const sessionResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/get-session`,
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (!sessionResponse.ok) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const session = await sessionResponse.json();

      if (!session?.user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Role-based access
      if (isSuperadminRoute && session.user.role !== "superadmin") {
        return NextResponse.redirect(new URL("/operator/dashboard", request.url));
      }

      if (
        isOperatorRoute &&
        session.user.role !== "operator" &&
        session.user.role !== "superadmin"
      ) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|uploads).*)",
  ],
};
