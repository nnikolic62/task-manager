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
import { slugify, getAppBaseUrl } from "@/lib/utils";
import {
  inviteWorkspaceMemberSchema,
  type InviteWorkspaceRole,
} from "@/schemas/workspace.schema";
import { UserWorkspace } from "@/lib/workspaces";
import { eq } from "drizzle-orm";

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
    await db.transaction(async (tx) => {
      const [invitation] = await tx
        .insert(workspaceInvitations)
        .values({
          workspaceId,
          email: normalizedEmail,
          role: parsed.data.role,
          invitedBy: session.id,
          status: "pending",
        })
        .returning({ id: workspaceInvitations.id });

      const acceptUrl = `${getAppBaseUrl()}/invites/accept?token=${invitation.id}`;

      await tx.insert(jobs).values({
        type: "send_email",
        payload: {
          to: normalizedEmail,
          subject: "You have been invited to a workspace",
          html: `<h1>You have been invited to a workspace</h1>
          <p>You can accept the invitation by clicking the link below:</p>
          <a href="${acceptUrl}">Accept invitation</a>`,
        },
      });
    });
    revalidatePath(`/${workspaceSlug}/members`);
    return { ok: true };
  } catch {
    return { ok: false, toast: "Could not send invitation" };
  }
}

export async function acceptWorkspaceInvitation(
  invitationId: string,
  workspaceId: string,
  workspaceSlug: string,
): Promise<InviteWorkspaceMemberResult> {
  const session = await getSession();

  if (!session) {
    return { ok: false, toast: "You must be signed in" };
  }

  const [invitation] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.id, invitationId))
    .limit(1);

  if (!invitation) {
    return { ok: false, toast: "Invitation not found" };
  }

  if (invitation.workspaceId !== workspaceId) {
    return { ok: false, toast: "Invalid invitation" };
  }

  if (invitation.status !== "pending") {
    return { ok: false, toast: "Invitation is no longer valid" };
  }

  const normalizedEmail = session.email.trim().toLowerCase();

  if (invitation.email !== normalizedEmail) {
    return {
      ok: false,
      toast: "This invitation was sent to a different email",
    };
  }

  if (await isWorkspaceMemberEmail(workspaceId, normalizedEmail)) {
    return { ok: false, toast: "You are already a member of this workspace" };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(workspaceMembers).values({
        workspaceId,
        userId: session.id,
        role: invitation.role,
      });

      await tx
        .update(workspaceInvitations)
        .set({ status: "accepted" })
        .where(eq(workspaceInvitations.id, invitationId));
    });

    revalidatePath(`/${workspaceSlug}`, "layout");
    revalidatePath(`/${workspaceSlug}/members`);
    return { ok: true };
  } catch {
    return { ok: false, toast: "Could not accept invitation" };
  }
}
