import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { projects, tasks, users } from "@/db/schema";
import type { KanbanTask, TaskStatus } from "@/schemas/task.schema";

export async function getTasksByProjectId(
  projectId: string,
): Promise<KanbanTask[]> {
  const rows = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      assigneeId: tasks.assigneeId,
      dueDate: tasks.dueDate,
      position: tasks.position,
      createdBy: tasks.createdBy,
      createdAt: tasks.createdAt,
      assigneeName: users.name,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.position));

  return rows;
}

export async function getTasksByProjectName(
  projectName: string,
  status: string,
) {
  const rows = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      description: tasks.description,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      and(
        eq(projects.name, projectName),
        eq(tasks.status, status as TaskStatus),
      ),
    )
    .orderBy(asc(tasks.position));

  return rows;
}
