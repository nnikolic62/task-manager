"use client";

import { useDroppable } from "@dnd-kit/core";

import { COLUMN_CONFIG } from "@/lib/kanban";
import type { KanbanTask, TaskStatus } from "@/schemas/task.schema";

import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  status: TaskStatus;
  tasks: KanbanTask[];
  projectId: string;
  projectPath: string;
};

export function KanbanColumn({
  status,
  tasks,
  projectId,
  projectPath,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 transition-colors ${
        isOver ? "border-zinc-600 bg-zinc-800/80" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${config.dotClassName}`}
            aria-hidden
          />
          <h2 className="text-sm font-medium text-foreground">
            {config.label}
          </h2>
        </div>
        <span className="flex size-6 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <CreateTaskDialog
        projectId={projectId}
        projectPath={projectPath}
        defaultStatus={status}
      />
    </div>
  );
}
