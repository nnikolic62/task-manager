import { WORKSPACE_ROLE_STYLES } from "@/lib/workspace-roles";
import type { WorkspaceRole } from "@/schemas/workspace.schema";

type WorkspaceRoleBadgeProps = {
  role: WorkspaceRole;
};

export function WorkspaceRoleBadge({ role }: WorkspaceRoleBadgeProps) {
  const style = WORKSPACE_ROLE_STYLES[role];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${style.className}`}
    >
      {style.label}
    </span>
  );
}
