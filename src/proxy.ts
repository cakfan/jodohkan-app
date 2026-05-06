import { NextRequest, NextResponse } from "next/server";
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT
} from "./routes";

/**
 * Next.js 16 Edge Proxy
 * Handles Authentication and Dynamic Subdomain Routing.
 */
export function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const hostname = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ichimart.com";

  // 1. Session Check (Cookie-based for Edge Compatibility)
  const sessionToken = req.cookies.get("better-auth.session_token") ||
    req.cookies.get("__secure-better-auth.session_token");
  const isLoggedIn = !!sessionToken;

  // 2. Route Classification
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some((route) => {
    if (route instanceof RegExp) return route.test(nextUrl.pathname);
    return route === nextUrl.pathname;
  });

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // 3. API Auth Routes - Always allowed
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // 4. Auth Routes (Login/Register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // 5. Subdomain Routing (Production)
  const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const isVercelPreview = hostname.includes("vercel.app");

  if (!isLocal && !isVercelPreview) {
    const subdomain = hostname.replace(`.${rootDomain}`, "").replace(rootDomain, "");

    // Subdomain detected (e.g., toko.ichimart.com)
    if (subdomain && subdomain !== "www") {
      // Loop protection
      if (nextUrl.pathname.startsWith(`/${subdomain}`)) {
        return NextResponse.next();
      }

      // Subdomain pages are typically public store pages
      return NextResponse.rewrite(
        new URL(`/${subdomain}${nextUrl.pathname}${nextUrl.search}`, req.url)
      );
    }
  }

  // 6. Private Route Protection
  // All routes are private unless they are in publicRoutes
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/signin", nextUrl);
    // Optional: save the current URL to redirect back after login
    // loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
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
