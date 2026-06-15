import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { google } from "@/lib/google";

export async function GET() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const cookieStore = await cookies();

    cookieStore.set('google_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 5,
    });

    cookieStore.set('google_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 5,
    });

    const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

    return Response.redirect(url.toString());
}