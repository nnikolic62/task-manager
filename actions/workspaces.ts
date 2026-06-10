"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  jobs,
  workspaceInvitations,
  workspaceMembers,
  workspaces,
} from "@/db/schema";
import {
  getWorkspaceMemberRole,
  hasPendingWorkspaceInvitation,
  isWorkspaceMemberEmail,
} from "@/lib/workspaces";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/utils";
import {
  inviteWorkspaceMemberSchema,
  type InviteWorkspaceRole,
} from "@/schemas/workspace.schema";
import { UserWorkspace } from "@/lib/workspaces";

export type InviteWorkspaceMemberResult =
  | { ok: true }
  | { ok: false; toast?: string };

export async function createWorkspace(
  name: string,
): Promise<UserWorkspace | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const slug = slugify(name);

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

export async function inviteWorkspaceMember(
  workspaceId: string,
  workspaceSlug: string,
  email: string,
  role: InviteWorkspaceRole,
): Promise<InviteWorkspaceMemberResult> {
  const session = await getSession();

  if (!session) {
    return { ok: false, toast: "You must be signed in" };
  }

  const parsed = inviteWorkspaceMemberSchema.safeParse({ email, role });

  if (!parsed.success) {
    return {
      ok: false,
      toast: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const actorRole = await getWorkspaceMemberRole(workspaceId, session.id);

  if (!actorRole || (actorRole !== "owner" && actorRole !== "admin")) {
    return { ok: false, toast: "You do not have permission to invite members" };
  }

  if (role === "admin" && actorRole !== "owner") {
    return { ok: false, toast: "Only owners can invite admins" };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  if (await isWorkspaceMemberEmail(workspaceId, normalizedEmail)) {
    return { ok: false, toast: "This user is already a workspace member" };
  }

  if (await hasPendingWorkspaceInvitation(workspaceId, normalizedEmail)) {
    return { ok: false, toast: "An invitation is already pending for this email" };
  }

  try {
    await db.insert(workspaceInvitations).values({
      workspaceId,
      email: normalizedEmail,
      role: parsed.data.role,
      invitedBy: session.id,
      status: "pending",
    });
  } catch {
    return { ok: false, toast: "Could not send invitation" };
  }

  revalidatePath(`/${workspaceSlug}/members`);

  return { ok: true };
}
