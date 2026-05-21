import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
} from "@/lib/auth";
import { clearAuthCookies, setCookie } from "@/lib/cookies";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

function refreshExpiresAt() {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function loadUser(userId: string): Promise<SessionUser | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function issueSession(userId: string) {
  const accessToken = await generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: refreshTokenHash,
    expiresAt: refreshExpiresAt(),
  });

  await setCookie(accessToken, refreshToken);
}

/** Route Handler only — sets cookies (not RSC / not page render). */
export async function refreshSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return null;
  }

  const activeTokens = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    );

  for (const row of activeTokens) {
    const match = await bcrypt.compare(refreshToken, row.tokenHash);

    if (!match) {
      continue;
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, row.id));

    await issueSession(row.userId);

    return loadUser(row.userId);
  }

  await clearAuthCookies();
  return null;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  const userId = await verifyAccessToken(accessToken);

  if (!userId) {
    return null;
  }

  return loadUser(userId);
}
