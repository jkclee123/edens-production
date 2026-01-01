import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Routes that don't require authentication
const publicRoutes = ["/login", "/unauthorized", "/api/auth"];

// TEMPORARY: Bypass auth for localhost testing
const BYPASS_AUTH_FOR_TESTING = process.env.BYPASS_AUTH_FOR_TESTING || false;

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (BYPASS_AUTH_FOR_TESTING) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


