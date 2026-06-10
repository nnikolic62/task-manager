"use client";

import { Group, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { inviteWorkspaceMember } from "@/actions/workspaces";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/Toast";
import type { InviteWorkspaceRole } from "@/schemas/workspace.schema";

type InviteMemberFormProps = {
  workspaceId: string;
  workspaceSlug: string;
  canInviteAdmin: boolean;
};

const BASE_ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
] as const;

export function InviteMemberForm({
  workspaceId,
  workspaceSlug,
  canInviteAdmin,
}: InviteMemberFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteWorkspaceRole>("member");
  const [isPending, startTransition] = useTransition();

  const roleOptions = canInviteAdmin
    ? [{ value: "admin", label: "Admin" }, ...BASE_ROLE_OPTIONS]
    : [...BASE_ROLE_OPTIONS];

  function handleInvite() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    startTransition(async () => {
      const result = await inviteWorkspaceMember(
        workspaceId,
        workspaceSlug,
        trimmedEmail,
        role,
      );

      if (!result.ok) {
        toast.error(result.toast ?? "Could not send invitation");
        return;
      }

      setEmail("");
      setRole("member");
      toast.success("Invitation sent");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <Stack gap="md">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Invite member
          </h2>
          <p className="text-sm text-muted-foreground">
            Send an email invitation to join this workspace
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
          <TextField
            label="Email"
            placeholder="teammate@company.com"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleInvite();
              }
            }}
          />
          <SelectField
            label="Role"
            value={role}
            onChange={(value) =>
              setRole((value as InviteWorkspaceRole) ?? "member")
            }
            options={[...roleOptions]}
          />
          <Button
            intent="primary"
            appearance="filled"
            loading={isPending}
            disabled={!email.trim()}
            onClick={handleInvite}
          >
            Send invite
          </Button>
        </div>

        <Group gap="xs">
          <p className="text-xs text-muted-foreground">
            Members can collaborate on projects. Viewers have read-only access.
          </p>
        </Group>
      </Stack>
    </section>
  );
}
