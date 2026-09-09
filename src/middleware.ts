import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const expectedPassword = process.env.APP_ACCESS_PASSWORD;

  // If no password configured in environment, allow open access
  if (!expectedPassword) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow public assets and login routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname === "/login" ||
    pathname === "/favicon.ico" ||
    pathname === "/og-image.png" ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("scb_auth_session")?.value;

  if (session === "authenticated") {
    return NextResponse.next();
  }

  // Redirect unauthenticated requests to login page
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
