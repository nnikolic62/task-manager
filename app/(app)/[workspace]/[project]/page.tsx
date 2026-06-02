import { redirect } from "next/navigation";

import { ProjectBoardHeader } from "@/components/projects/ProjectBoardHeader";
import { getProjectBySlug } from "@/lib/projects";
import { getTasksByProjectId } from "@/lib/tasks";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { KanbanBoard } from "@/components/projects/KanbanBoard";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ workspace: string; project: string }>;
}) {
  const { workspace: workspaceSlug, project: projectSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    redirect("/");
  }

  const project = await getProjectBySlug(workspace.id, projectSlug);

  if (!project) {
    redirect(`/${workspace.slug}`);
  }

  const tasks = await getTasksByProjectId(project.id);
  const projectPath = `/${workspace.slug}/${project.slug}`;

  return (
    <div className="flex w-full flex-col gap-8">
      <ProjectBoardHeader
        project={project}
        tasks={tasks}
        workspaceSlug={workspace.slug}
      />
      <KanbanBoard
        initialTasks={tasks}
        projectId={project.id}
        projectPath={projectPath}
      />
    </div>
  );
}
