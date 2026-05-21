"use server";

import { cookies } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import { verifyAccessToken } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/cookies";
import { hashPassword, verifyPassword } from "@/lib/password";
import { issueSession } from "@/lib/session";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await hashPassword(data.password);

  await db.insert(users).values({
    email: data.email,
    name: data.name,
    passwordHash,
  });
}

export async function loginUser(data: { email: string; password: string }) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (!user?.passwordHash) {
    return null;
  }

  const valid = await verifyPassword(data.password, user.passwordHash);

  if (!valid) {
    return null;
  }

  await issueSession(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const userId = accessToken ? await verifyAccessToken(accessToken) : null;

  if (userId && refreshToken) {
    const activeTokens = await db
      .select()
      .from(refreshTokens)
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );

    for (const token of activeTokens) {
      const match = await bcrypt.compare(refreshToken, token.tokenHash);

      if (match) {
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokens.id, token.id));
        break;
      }
    }
  } else if (userId) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }

  await clearAuthCookies();
}
