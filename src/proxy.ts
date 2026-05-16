import { NextRequest, NextResponse } from "next/server";
import { publicRoutes, authRoutes, apiAuthPrefix, DEFAULT_LOGIN_REDIRECT } from "./routes";

/**
 * Next.js 16 Edge Proxy
 * Handles Authentication and Dynamic Subdomain Routing.
 */
export function proxy(req: NextRequest) {
  const { nextUrl } = req;

  // 1. Session Check (Cookie-based for Edge Compatibility)
  const sessionToken =
    req.cookies.get("better-auth.session_token") ||
    req.cookies.get("__secure-better-auth.session_token");
  const isLoggedIn = !!sessionToken;

  // 2. Route Classification
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some((route) => {
    if (route instanceof RegExp) return route.test(nextUrl.pathname);
    return route === nextUrl.pathname;
  });

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isSetupUsernameRoute = nextUrl.pathname === "/atur-akun";

  // 3. API Auth Routes - Always allowed
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // 4. Setup Username Route - Special handling
  // Allow logged-in users to access this route (client-side will redirect if username exists)
  if (isSetupUsernameRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/masuk", nextUrl));
    }
    return NextResponse.next();
  }

  // 5. Auth Routes (Login/Register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // 6. Landing Page Redirect - logged-in users go to dashboard
  if (isLoggedIn && nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/beranda", nextUrl));
  }

  // 7. Private Route Protection
  // All routes are private unless they are in publicRoutes
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/masuk", nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
