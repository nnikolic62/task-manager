import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  const session = await refreshSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
