import type { WorkspaceRole } from "@/schemas/workspace.schema";

type RoleStyle = {
  label: string;
  className: string;
};

export const WORKSPACE_ROLE_STYLES: Record<WorkspaceRole, RoleStyle> = {
  owner: {
    label: "Owner",
    className:
      "border border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  },
  admin: {
    label: "Admin",
    className:
      "border border-violet-500/30 bg-violet-500/15 text-violet-600 dark:text-violet-300",
  },
  member: {
    label: "Member",
    className:
      "border border-sky-500/30 bg-sky-500/15 text-sky-600 dark:text-sky-300",
  },
  viewer: {
    label: "Viewer",
    className:
      "border border-zinc-500/30 bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  },
};
