import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getUserWorkspaces } from "@/lib/workspaces";

export default async function AppIndexPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces(session.id);

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          No workspace yet
        </h1>
        <p className="text-sm text-muted-foreground">
          Register or create a workspace to get started.
        </p>
      </div>
    );
  }

  redirect(`/${workspaces[0].slug}`);
}
