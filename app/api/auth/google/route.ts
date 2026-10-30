import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

import { google } from "@/lib/google";

const isProduction = process.env.NODE_ENV === "production";

const secureCookies =
  process.env.COOKIE_SECURE !== undefined
    ? process.env.COOKIE_SECURE === "true"
    : isProduction;

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const cookieStore = await cookies();

  cookieStore.set("google_state", state, {
    httpOnly: true,
    secure: secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });

  cookieStore.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  return Response.redirect(url.toString());
}
