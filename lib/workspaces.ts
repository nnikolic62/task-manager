import { db } from "@/db";
import {
  users,
  workspaceInvitations,
  workspaceMembers,
  workspaces,
} from "@/db/schema";
import type { WorkspaceRole } from "@/schemas/workspace.schema";
import { and, asc, eq, sql } from "drizzle-orm";

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
};

export type UserWorkspace = {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
};

export type WorkspaceInvitation = {
  id: string;
  email: string;
  role: WorkspaceRole;
  createdAt: Date | null;
};

export async function getWorkspaceBySlug(slug: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  return workspace;
}

export async function getWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRole | null> {
  const [row] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .limit(1);

  return row?.role ?? null;
}

export async function getWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(asc(users.name));
}

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

export async function getPendingWorkspaceInvitations(
  workspaceId: string,
): Promise<WorkspaceInvitation[]> {
  try {
    return await db
      .select({
        id: workspaceInvitations.id,
        email: workspaceInvitations.email,
        role: workspaceInvitations.role,
        createdAt: workspaceInvitations.createdAt,
      })
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.workspaceId, workspaceId),
          eq(workspaceInvitations.status, "pending"),
        ),
      )
      .orderBy(asc(workspaceInvitations.createdAt));
  } catch {
    return [];
  }
}

export async function isWorkspaceMemberEmail(
  workspaceId: string,
  email: string,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();

  const [member] = await db
    .select({ id: users.id })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        sql`lower(${users.email}) = ${normalizedEmail}`,
      ),
    )
    .limit(1);

  return Boolean(member);
}

export async function hasPendingWorkspaceInvitation(
  workspaceId: string,
  email: string,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [invitation] = await db
      .select({ id: workspaceInvitations.id })
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.workspaceId, workspaceId),
          eq(workspaceInvitations.status, "pending"),
          sql`lower(${workspaceInvitations.email}) = ${normalizedEmail}`,
        ),
      )
      .limit(1);

    return Boolean(invitation);
  } catch {
    return false;
  }
}
