import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const publicPaths = ["/login", "/register", "/api/auth/refresh"];

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
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const hasAccess = await hasValidAccessToken(request);

  if (isPublic && hasAccess) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const hasRefresh = Boolean(request.cookies.get("refreshToken")?.value);

  if (!isPublic && !hasAccess && hasRefresh) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(refreshUrl);
  }

  if (!isPublic && !hasAccess) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
