import { KpiCard } from "@/components/analytics/KpiCard";
import { CreateProjectButton } from "@/components/projects/CreateProjectButton";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getProjectsByWorkspaceId } from "@/lib/projects";
import { getSession } from "@/lib/session";
import { getWorkspaceBySlug } from "@/lib/workspaces";
import { redirect } from "next/navigation";

type WorkspaceHomePageProps = {
  params: Promise<{ workspaces: string }>;
};

export default async function WorkspaceHomePage({
  params,
}: WorkspaceHomePageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { workspaces: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    redirect("/");
  }

  const projects = await getProjectsByWorkspaceId(workspace.id);
  

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Good morning, {session.name}
          </h1>
          <p className="text-sm text-gray-500">
            Workspace: <span className="font-medium text-foreground">{workspaceSlug}</span>
          </p>
        </div>
        <CreateProjectButton
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total projects"
          value={projects.length}
          hint="Total projects in the workspace"
          tone="default"
        />
        <KpiCard
          label="Total projects"
          value={projects.length}
          hint="Total projects in the workspace"
          tone="default"
        />
        <KpiCard
          label="Total projects"
          value={projects.length}
          hint="Total projects in the workspace"
          tone="default"
        />
        <KpiCard
          label="Active projects"
          value={projects.filter((project) => project.status === "active").length}
          hint="Active projects in the workspace"
          tone="default"
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Projects
        </h2>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects yet. Create one to get started.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                name={project.name}
                description={project.description}
                status={project.status}
                taskCount={project.taskCount}
                progressPercent={project.progressPercent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
