"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { refreshTokens, users, workspaces, workspaceMembers } from "@/db/schema";
import { verifyAccessToken } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/cookies";
import { hashPassword, verifyPassword } from "@/lib/password";
import { issueSession } from "@/lib/session";
import { getUserWorkspaces } from "./workspaces";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await hashPassword(data.password);

  return await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        passwordHash,
      })
      .returning();

    const slug = data.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const [workspace] = await tx
      .insert(workspaces)
      .values({
        name: data.name,
        slug,
        ownerId: user.id,
        plan: "free",
      })
      .returning();
    
    await tx.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: user.id,
      role: "owner",
    });

    return {
      user,
      workspace,
    };
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

  const workspaces = await getUserWorkspaces(user.id);
  const redirectTo =
    workspaces.length > 0 ? `/${workspaces[0].slug}` : "/";

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    redirectTo,
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

export async function logoutAndRedirect() {
  await logoutUser();
  redirect("/login");
}
