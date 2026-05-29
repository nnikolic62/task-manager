import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getProjectsByWorkspaceId(workspaceId: string) {
  const rows = await db
    .select({
      id: projects.id,
      workspaceId: projects.workspaceId,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      createdBy: projects.createdBy,
      taskCount: sql<number>`cast(count(${tasks.id}) as int)`,
      doneTaskCount: sql<number>`cast(count(${tasks.id}) filter (where ${tasks.status} = 'done') as int)`,
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(eq(projects.workspaceId, workspaceId))
    .groupBy(projects.id);

  return rows.map((row) => ({
    ...row,
    progressPercent:
      row.taskCount > 0
        ? Math.round((row.doneTaskCount / row.taskCount) * 100)
        : 0,
  }));
}