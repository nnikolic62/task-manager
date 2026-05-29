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
import { emailExists } from "@/lib/users";
import { loginUserSchema } from "@/schemas/user.schema";

import { getUserWorkspaces } from "./workspaces";

export type LoginActionState = {
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  toast?: string;
};

function zodFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Partial<Record<"email" | "password", string>> {
  const fieldErrors: Partial<Record<"email" | "password", string>> = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (field === "email" || field === "password") {
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
  }

  return fieldErrors;
}

export async function loginAction(
  _prev: LoginActionState | null,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error.issues) };
  }

  const result = await loginUser(parsed.data);

  if (!result) {
    return { toast: "Invalid email or password" };
  }

  redirect(result.redirectTo);
}

export type RegisterResult =
  | { ok: true }
  | { ok: false; toast?: string };

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  if (await emailExists(data.email)) {
    return {
      ok: false,
      toast: "This email is already in use",
    };
  }

  const passwordHash = await hashPassword(data.password);

  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        passwordHash,
      })
      .returning();

    let baseSlug = data.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (!baseSlug) {
      baseSlug = "workspace";
    }

    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const [existing] = await tx
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, slug))
        .limit(1);

      if (!existing) {
        break;
      }

      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

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
  });

  return { ok: true };
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
