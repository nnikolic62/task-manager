"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";

import { updateTaskStatus } from "@/actions/tasks";
import { KANBAN_COLUMNS } from "@/lib/kanban";
import {
  isTaskStatus,
  type KanbanTask,
  type TaskStatus,
} from "@/schemas/task.schema";

import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";

type KanbanBoardProps = {
  initialTasks: KanbanTask[];
  projectId: string;
  projectPath: string;
};

function resolveDropStatus(
  tasks: KanbanTask[],
  dropTargetId: string,
): TaskStatus | null {
  if (isTaskStatus(dropTargetId)) {
    return dropTargetId;
  }

  const overTask = tasks.find((task) => task.id === dropTargetId);
  if (overTask?.status && isTaskStatus(overTask.status)) {
    return overTask.status;
  }

  return null;
}

export function KanbanBoard({
  initialTasks,
  projectId,
  projectPath,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!active || !over) {
      return;
    }

    const activeId = String(active.id);
    const dropTargetId = String(over.id);

    if (activeId === dropTargetId) {
      return;
    }

    const newStatus = resolveDropStatus(tasks, dropTargetId);
    if (!newStatus) {
      return;
    }

    const activeTaskRow = tasks.find((task) => task.id === activeId);
    if (!activeTaskRow || activeTaskRow.status === newStatus) {
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === activeId ? { ...task, status: newStatus } : task,
      ),
    );

    await updateTaskStatus(activeId, newStatus, projectPath);
  }

  return (
    <DndContext
      id={projectId}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
            projectId={projectId}
            projectPath={projectPath}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
