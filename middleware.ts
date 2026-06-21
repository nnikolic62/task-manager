import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyAccessToken } from "@/lib/auth";

const publicPaths = [
  "/login",
  "/register",
  "/api/auth/refresh",
  "/api/auth/google",
  "/api/telegram/webhook",
];

function isPublicPath(pathname: string) {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

async function hasValidAccessToken(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return false;
  }

  const userId = await verifyAccessToken(accessToken);
  return userId !== null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const hasValidAccess = await hasValidAccessToken(request);

  if (isPublic && hasValidAccess) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const hasRefresh = Boolean(request.cookies.get("refreshToken")?.value);

  if (!isPublic && !hasValidAccess && hasRefresh) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(refreshUrl);
  }

  if (!isPublic && !hasValidAccess) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
