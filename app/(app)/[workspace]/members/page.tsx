import Link from "next/link";
import { redirect } from "next/navigation";

import { InviteMemberForm } from "@/components/workspaces/InviteMemberForm";
import { MemberList } from "@/components/workspaces/MemberList";
import { PendingInvitationsList } from "@/components/workspaces/PendingInvitationsList";
import { getSession } from "@/lib/session";
import {
  getPendingWorkspaceInvitations,
  getWorkspaceBySlug,
  getWorkspaceMemberRole,
  getWorkspaceMembers,
} from "@/lib/workspaces";

type WorkspaceMembersPageProps = {
  params: Promise<{ workspace: string }>;
};

export default async function WorkspaceMembersPage({
  params,
}: WorkspaceMembersPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    redirect("/");
  }

  const [members, invitations, currentRole] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getPendingWorkspaceInvitations(workspace.id),
    getWorkspaceMemberRole(workspace.id, session.id),
  ]);

  const canManageMembers = currentRole === "owner" || currentRole === "admin";

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href={`/${workspace.slug}`}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground hover:no-underline"
        >
          ← Back to workspace
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Members
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to {workspace.name}
          </p>
        </div>
      </div>

      {canManageMembers ? (
        <InviteMemberForm
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          canInviteAdmin={currentRole === "owner"}
        />
      ) : null}

      <PendingInvitationsList invitations={invitations} />
      <MemberList members={members} />
    </div>
  );
}
