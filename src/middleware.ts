import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/auth/callback"];
const PROTECTED_ROUTES = ["/dashboard", "/children"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // Authenticated user visiting auth pages -> redirect to dashboard
  if (isAuthenticated && isPublicRoute(pathname)) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Unauthenticated user visiting protected pages -> redirect to login
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/children/:path*", "/login", "/signup", "/forgot-password"],
};
