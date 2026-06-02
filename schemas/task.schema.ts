import { z } from "zod";

import { tasks } from "@/db/schema";

export type Task = typeof tasks.$inferSelect;

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type KanbanTask = Task & {
  assigneeName: string | null;
};

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "review",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export function isTaskPriority(value: string): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  dueDate: z.string().optional(),
});