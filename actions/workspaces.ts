"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { jobs, workspaceMembers, workspaces } from "@/db/schema";
import { getSession } from "@/lib/session";

export type UserWorkspace = {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member" | "viewer";
};

export async function getUserWorkspaces(
  userId: string,
): Promise<UserWorkspace[]> {
  const rows = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(asc(workspaces.name));

  return rows;
}

export async function createWorkspace(
  name: string,
): Promise<UserWorkspace | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const slug = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const workspace = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(workspaces)
      .values({
        name,
        slug,
        ownerId: session.id,
        plan: "free",
      })
      .returning();

    await tx.insert(workspaceMembers).values({
      workspaceId: row.id,
      userId: session.id,
      role: "owner",
    });

    await tx.insert(jobs).values({
      type: "send_email",
      payload: {
        to: session.email,
        subject: "New workspace created",
        html: `<h1>Welcome to the workspace ${name}</h1>`,
      },
    });

    return row;
  });

  revalidatePath(`/${slug}`, "layout");

  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    role: "owner",
  };
}
