import Link from "next/link";

import type { Project } from "@/schemas/project.schema";
import type { KanbanTask } from "@/schemas/task.schema";
import { getInitials } from "@/lib/kanban";

type ProjectBoardHeaderProps = {
  project: Project;
  tasks: KanbanTask[];
  workspaceSlug: string;
};

function projectStatusStyle(status: Project["status"]) {
  switch (status) {
    case "archived":
      return {
        dotClassName: "bg-zinc-400",
        badgeClassName: "bg-muted text-muted-foreground",
      };
    case "done":
    case "active":
    default:
      return {
        dotClassName: "bg-emerald-500",
        badgeClassName:
          "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      };
  }
}

function countDueThisWeek(tasks: KanbanTask[]): number {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") {
      return false;
    }

    const due = new Date(task.dueDate);
    return due >= now && due <= weekEnd;
  }).length;
}

function uniqueAssignees(tasks: KanbanTask[]) {
  const seen = new Set<string>();
  const members: { id: string; name: string }[] = [];

  for (const task of tasks) {
    if (!task.assigneeId || !task.assigneeName || seen.has(task.assigneeId)) {
      continue;
    }

    seen.add(task.assigneeId);
    members.push({ id: task.assigneeId, name: task.assigneeName });
  }

  return members;
}

export function ProjectBoardHeader({
  project,
  tasks,
  workspaceSlug,
}: ProjectBoardHeaderProps) {
  const status = project.status ?? "active";
  const style = projectStatusStyle(status);
  const members = uniqueAssignees(tasks);
  const dueThisWeek = countDueThisWeek(tasks);
  const taskLabel =
    tasks.length === 1 ? "1 task" : `${tasks.length} tasks`;
  const dueLabel =
    dueThisWeek === 0
      ? "None due this week"
      : dueThisWeek === 1
        ? "1 due this week"
        : `${dueThisWeek} due this week`;

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <Link
            href={`/${workspaceSlug}`}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to workspace"
          >
            <BackIcon />
          </Link>
          <span
            className={`size-2 shrink-0 rounded-full ${style.dotClassName}`}
            aria-hidden
          />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {project.name}
          </h1>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style.badgeClassName}`}
          >
            {status}
          </span>
        </div>
      </div>

      {project.description ? (
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ChecklistIcon />
          {taskLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon />
          {dueLabel}
        </span>
        {members.length > 0 ? (
          <span className="inline-flex items-center gap-2">
            <span className="flex -space-x-2" aria-hidden>
              {members.slice(0, 4).map((member, index) => (
                <span
                  key={member.id}
                  title={member.name}
                  className={`flex size-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold text-white ${avatarColor(
                    index,
                  )}`}
                >
                  {getInitials(member.name)}
                </span>
              ))}
            </span>
            <span>
              {members.length} member{members.length === 1 ? "" : "s"}
            </span>
          </span>
        ) : null}
      </div>
    </header>
  );
}

function avatarColor(index: number): string {
  const colors = [
    "bg-indigo-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-violet-600",
  ];
  return colors[index % colors.length];
}

function BackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
