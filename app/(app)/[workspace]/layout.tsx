import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceContent } from "@/components/workspaces/WorkspaceContent";
import { getSession } from "@/lib/session";
import { getUserWorkspaces } from "@/lib/workspaces";

type WorkspaceLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
};

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspace: workspaceSlug } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces(session.id);

  if (workspaces.length === 0) {
    redirect("/");
  }

  const activeWorkspace = workspaces.find((w) => w.slug === workspaceSlug);

  if (!activeWorkspace) {
    redirect(`/${workspaces[0].slug}`);
  }

  return (
    <AppShell
      user={session}
      workspaces={workspaces}
      activeWorkspaceSlug={activeWorkspace.slug}
    >
      <WorkspaceContent>{children}</WorkspaceContent>
    </AppShell>
  );
}
