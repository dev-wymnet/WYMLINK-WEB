import { NextResponse, type NextRequest } from "next/server";

// Optimistic route guard: no session cookie → straight to sign-in, and signed-in
// users skip the auth pages. Real authorization still happens on the backend.

const PROTECTED = ["/dashboard", "/onboarding"];
const AUTH_PAGES = ["/auth/login", "/auth/signup"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin console: its own session cookie, its own sign-in page.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const hasAdmin = Boolean(request.cookies.get("wl_adm_rt")?.value);
    const isLogin = pathname === "/admin/login";
    if (!hasAdmin && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    if (hasAdmin && isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get("wl_rt")?.value);

  if (!hasSession && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/auth/login", "/auth/signup", "/admin", "/admin/:path*"],
};
