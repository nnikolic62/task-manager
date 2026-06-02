import type { TaskPriority, TaskStatus } from "@/schemas/task.schema";

export const KANBAN_COLUMNS: TaskStatus[] = [
  "todo",
  "in_progress",
  "review",
  "done",
];

type ColumnConfig = {
  label: string;
  dotClassName: string;
};

export const COLUMN_CONFIG: Record<TaskStatus, ColumnConfig> = {
  todo: { label: "Todo", dotClassName: "bg-zinc-400" },
  in_progress: { label: "In progress", dotClassName: "bg-blue-500" },
  review: { label: "Review", dotClassName: "bg-violet-500" },
  done: { label: "Done", dotClassName: "bg-emerald-500" },
};

type PriorityStyle = {
  label: string;
  className: string;
};

export function priorityStyle(priority: TaskPriority | null): PriorityStyle {
  switch (priority) {
    case "urgent":
      return {
        label: "urgent",
        className: "bg-rose-500/20 text-rose-400",
      };
    case "high":
      return {
        label: "high",
        className: "bg-amber-500/20 text-amber-400",
      };
    case "low":
      return {
        label: "low",
        className: "bg-zinc-700/80 text-zinc-400",
      };
    case "medium":
    case null:
      return {
        label: "medium",
        className: "bg-zinc-700/80 text-zinc-400",
      };
  }
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
