type WorkspaceHomePageProps = {
  params: Promise<{ workspaces: string }>;
};

export default async function WorkspaceHomePage({
  params,
}: WorkspaceHomePageProps) {
  const { workspaces: workspaceSlug } = await params;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Task Manager
      </h1>
      <p className="text-sm text-muted-foreground">
        Workspace: <span className="font-medium text-foreground">{workspaceSlug}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Your workspace dashboard will live here.
      </p>
    </div>
  );
}
