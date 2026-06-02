import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";


export async function getProjectsByWorkspaceId(workspaceId: string) {
  const rows = await db
    .select({
      id: projects.id,
      workspaceId: projects.workspaceId,
      name: projects.name,
      slug: projects.slug,
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

export async function getProjectBySlug(workspaceId: string, slug: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.workspaceId, workspaceId)))
    .limit(1);

  return project;
}