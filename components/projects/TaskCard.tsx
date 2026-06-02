"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import dayjs from "dayjs";

import type { KanbanTask } from "@/schemas/task.schema";

import { getInitials, priorityStyle } from "@/lib/kanban";

type TaskCardProps = {
  task: KanbanTask;
  isDragging?: boolean;
};

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const isDone = task.status === "done";
  const priority = priorityStyle(task.priority);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      className={`cursor-grab rounded-xl border border-zinc-700/80 bg-zinc-800/90 p-3.5 shadow-sm transition-opacity active:cursor-grabbing ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <h3
        className={`text-sm font-semibold leading-snug text-foreground ${
          isDone ? "text-muted-foreground line-through" : ""
        }`}
      >
        {task.title}
      </h3>

      {task.description ? (
        <p
          className={`mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground ${
            isDone ? "line-through" : ""
          }`}
        >
          {task.description}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priority.className}`}
          >
            {priority.label}
          </span>
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon />
              {dayjs(task.dueDate).format("MMM D")}
            </span>
          ) : null}
        </div>

        {task.assigneeName ? (
          <span
            title={task.assigneeName}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white"
          >
            {getInitials(task.assigneeName)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
