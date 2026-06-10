import type { WorkspaceInvitation } from "@/lib/workspaces";

import { WorkspaceRoleBadge } from "./WorkspaceRoleBadge";

type PendingInvitationsListProps = {
  invitations: WorkspaceInvitation[];
};

function formatInvitedAt(date: Date | null) {
  if (!date) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function PendingInvitationsList({
  invitations,
}: PendingInvitationsListProps) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Pending invitations
        </h2>
        <p className="text-sm text-muted-foreground">
          Invites waiting to be accepted
        </p>
      </div>

      {invitations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
          No pending invitations.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {invitation.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Invited {formatInvitedAt(invitation.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <WorkspaceRoleBadge role={invitation.role} />
                <span className="rounded-full border border-warning/30 bg-warning/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-warning">
                  Pending
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
