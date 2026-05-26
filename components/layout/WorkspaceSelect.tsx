"use client";

import { useRouter } from "next/navigation";

import type { UserWorkspace } from "@/actions/workspaces";
import { SelectField } from "@/components/ui/Select";

type WorkspaceSelectProps = {
  workspaces: UserWorkspace[];
  activeWorkspaceSlug: string;
};

export function WorkspaceSelect({
  workspaces,
  activeWorkspaceSlug,
}: WorkspaceSelectProps) {
  const router = useRouter();

  const activeWorkspace = workspaces.find((w) => w.slug === activeWorkspaceSlug);
  const activeId = activeWorkspace?.id ?? workspaces[0]?.id ?? null;

  const options = workspaces.map((workspace) => ({
    value: workspace.id,
    label: workspace.name,
  }));

  function handleChange(workspaceId: string | null) {
    if (!workspaceId) {
      return;
    }

    const workspace = workspaces.find((w) => w.id === workspaceId);

    if (workspace && workspace.slug !== activeWorkspaceSlug) {
      router.push(`/${workspace.slug}`);
    }
  }

  return (
    <SelectField
      label="Workspace"
      placeholder={
        workspaces.length === 0 ? "No workspaces" : "Select workspace"
      }
      options={options}
      value={activeId}
      onChange={handleChange}
      disabled={workspaces.length === 0}
      allowDeselect={false}
      comboboxProps={{ withinPortal: false }}
    />
  );
}
