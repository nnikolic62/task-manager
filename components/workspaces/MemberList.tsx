import type { WorkspaceMember } from "@/lib/workspaces";
import { getInitials } from "@/lib/kanban";

import { WorkspaceRoleBadge } from "./WorkspaceRoleBadge";

type MemberListProps = {
  members: WorkspaceMember[];
};

export function MemberList({ members }: MemberListProps) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Members
        </h2>
        <p className="text-sm text-muted-foreground">
          {members.length} {members.length === 1 ? "person" : "people"} in this
          workspace
        </p>
      </div>

      {members.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
          No members yet.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {getInitials(member.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>
              <WorkspaceRoleBadge role={member.role} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
