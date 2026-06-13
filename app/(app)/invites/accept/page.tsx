import Link from "next/link";
import { redirect } from "next/navigation";

import { AcceptInviteCard } from "@/components/workspaces/AcceptInviteCard";
import { InviteStatusCard } from "@/components/workspaces/InviteStatusCard";
import { getSession } from "@/lib/session";
import { getWorkspaceInvitationById } from "@/lib/workspaces";

type AcceptInvitePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const { token } = await searchParams;
  const session = await getSession();

  if (!session) {
    const returnPath = token
      ? `/invites/accept?token=${encodeURIComponent(token)}`
      : "/invites/accept";
    redirect(`/login?redirect=${encodeURIComponent(returnPath)}`);
  }

  if (!token) {
    return (
      <InvitePageShell>
        <InviteStatusCard
          title="Invalid invitation link"
          description="This link is missing an invitation token. Ask the workspace admin to send a new invite."
        />
      </InvitePageShell>
    );
  }

  const invitation = await getWorkspaceInvitationById(token);

  if (!invitation) {
    return (
      <InvitePageShell>
        <InviteStatusCard
          title="Invitation not found"
          description="This invitation may have been revoked or the link is incorrect."
        />
      </InvitePageShell>
    );
  }

  if (invitation.status !== "pending") {
    return (
      <InvitePageShell>
        <InviteStatusCard
          title="Invitation no longer available"
          description={
            invitation.status === "accepted"
              ? "This invitation has already been accepted."
              : "This invitation is no longer valid."
          }
          actionLabel={
            invitation.status === "accepted"
              ? `Open ${invitation.workspaceName}`
              : "Go home"
          }
          actionHref={
            invitation.status === "accepted"
              ? `/${invitation.workspaceSlug}`
              : "/"
          }
        />
      </InvitePageShell>
    );
  }

  return (
    <InvitePageShell>
      <AcceptInviteCard
        invitationId={invitation.id}
        workspaceId={invitation.workspaceId}
        workspaceSlug={invitation.workspaceSlug}
        workspaceName={invitation.workspaceName}
        role={invitation.role}
        inviteEmail={invitation.email}
        sessionEmail={session.email}
      />
    </InvitePageShell>
  );
}

function InvitePageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-primary no-underline hover:underline"
        >
          Task Manager
        </Link>
      </div>
      {children}
    </div>
  );
}
