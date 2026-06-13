"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { acceptWorkspaceInvitation } from "@/actions/workspaces";
import { MailIcon } from "@/components/auth/icons";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { WorkspaceRoleBadge } from "@/components/workspaces/WorkspaceRoleBadge";
import type { WorkspaceRole } from "@/schemas/workspace.schema";

type AcceptInviteCardProps = {
  invitationId: string;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  role: WorkspaceRole;
  inviteEmail: string;
  sessionEmail: string;
};

function InviteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function AcceptInviteCard({
  invitationId,
  workspaceId,
  workspaceSlug,
  workspaceName,
  role,
  inviteEmail,
  sessionEmail,
}: AcceptInviteCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const emailMatches =
    sessionEmail.trim().toLowerCase() === inviteEmail.trim().toLowerCase();

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptWorkspaceInvitation(
        invitationId,
        workspaceId,
        workspaceSlug,
      );

      if (!result.ok) {
        toast.error(result.toast ?? "Could not accept invitation");
        return;
      }

      toast.success(`You joined ${workspaceName}`);
      router.push(`/${workspaceSlug}`);
      router.refresh();
    });
  }

  return (
    <div className="relative w-full max-w-md">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-accent/60 blur-2xl"
      />

      <div className="relative space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-accent text-primary">
            <InviteIcon />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Workspace invitation
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Join {workspaceName}
            </h1>
            <p className="text-sm text-muted-foreground">
              You&apos;ve been invited to collaborate on projects and tasks.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your role
              </p>
              <p className="mt-1 truncate text-sm font-medium text-foreground">
                {workspaceName}
              </p>
            </div>
            <WorkspaceRoleBadge role={role} />
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
            <MailIcon size={16} />
            <span className="truncate">Invited as {inviteEmail}</span>
          </div>
        </div>

        {!emailMatches ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
            This invitation was sent to{" "}
            <span className="font-medium">{inviteEmail}</span>, but you&apos;re
            signed in as <span className="font-medium">{sessionEmail}</span>.
            Switch accounts to accept.
          </div>
        ) : null}

        <div className="space-y-3">
          <Button
            intent="primary"
            appearance="filled"
            fullWidth
            size="md"
            loading={isPending}
            disabled={!emailMatches}
            onClick={handleAccept}
          >
            Accept invitation
          </Button>

          <Link
            href="/"
            className="block text-center text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground hover:no-underline"
          >
            Not now
          </Link>
        </div>
      </div>
    </div>
  );
}
