"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";

type ViewMembersButtonProps = {
  workspaceSlug: string;
};

export function ViewMembersButton({ workspaceSlug }: ViewMembersButtonProps) {
  return (
    <Button
      component={Link}
      href={`/${workspaceSlug}/members`}
      intent="secondary"
      appearance="outline"
    >
      See members
    </Button>
  );
}
