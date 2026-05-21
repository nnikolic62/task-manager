import { cookies } from "next/headers";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export async function setCookie(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60,
  });

  cookieStore.set("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30) * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete({ name: "accessToken", ...cookieOptions });
  cookieStore.delete({ name: "refreshToken", ...cookieOptions });
}