"use client";

import { useDisclosure } from "@mantine/hooks";

import type { UserWorkspace } from "@/actions/workspaces";
import type { SessionUser } from "@/lib/session";

import { AppHeader } from "./AppHeader";
import { AppNavDrawer } from "./AppNavDrawer";

type AppShellProps = {
  user: SessionUser;
  workspaces: UserWorkspace[];
  activeWorkspaceSlug: string;
  children: React.ReactNode;
};

export function AppShell({
  user,
  workspaces,
  activeWorkspaceSlug,
  children,
}: AppShellProps) {
  const [menuOpened, { toggle, close }] = useDisclosure(false);

  return (
    <>
      <AppHeader
        user={user}
        menuOpened={menuOpened}
        onMenuToggle={toggle}
        workspaceSlug={activeWorkspaceSlug}
      />
      <AppNavDrawer
        opened={menuOpened}
        onClose={close}
        workspaces={workspaces}
        activeWorkspaceSlug={activeWorkspaceSlug}
      />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
