import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import type { KanbanTask } from "@/schemas/task.schema";
import { asc, eq } from "drizzle-orm";

export async function getTasksByProjectId(projectId: string): Promise<KanbanTask[]> {
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
