"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { parseDueDate } from "@/lib/dates";
import { getSession } from "@/lib/session";
import {
  createTaskSchema,
  isTaskStatus,
  type TaskPriority,
  type TaskStatus,
} from "@/schemas/task.schema";

export type CreateTaskResult = { ok: true } | { ok: false; toast?: string };

export async function createTask(
  projectId: string,
  projectPath: string,
  status: TaskStatus,
  title: string,
  description?: string,
  priority?: TaskPriority,
  dueDate?: string,
): Promise<CreateTaskResult> {
  const session = await getSession();

  if (!session) {
    return { ok: false, toast: "You must be signed in" };
  }

  if (!isTaskStatus(status)) {
    return { ok: false, toast: "Invalid column" };
  }

  const parsed = createTaskSchema.safeParse({
    title,
    description,
    priority: priority ?? "medium",
    dueDate,
  });

  if (!parsed.success) {
    return { ok: false, toast: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [{ nextPosition }] = await db
    .select({
      nextPosition: sql<number>`coalesce(max(${tasks.position}), -1) + 1`,
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  try {
    await db.insert(tasks).values({
      projectId,
      title: parsed.data.title,
      description: parsed.data.description?.trim() || null,
      status,
      priority: parsed.data.priority,
      dueDate: parseDueDate(parsed.data.dueDate),
      position: nextPosition ?? 0,
      createdBy: session.id,
    });
  } catch {
    return { ok: false, toast: "Could not create task" };
  }

  revalidatePath(projectPath);

  return { ok: true };
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  revalidateProjectPath?: string,
) {
  if (!isTaskStatus(status)) {
    throw new Error("Invalid task status");
  }

  await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));

  if (revalidateProjectPath) {
    revalidatePath(revalidateProjectPath);
  }
}
