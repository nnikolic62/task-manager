"use client";

import { Drawer, Group, Modal, NavLink, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createWorkspace } from "@/actions/workspaces";
import type { UserWorkspace } from "@/actions/workspaces";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

import { getAppNavItems } from "@/lib/navigation/app-nav-items";
import { SelectField } from "../ui/Select";

type AppNavDrawerProps = {
  opened: boolean;
  onClose: () => void;
  workspaces: UserWorkspace[];
  activeWorkspaceSlug: string;
};

export function AppNavDrawer({
  opened,
  onClose,
  workspaces,
  activeWorkspaceSlug,
}: AppNavDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const activeWorkspace = workspaces.find((w) => w.slug === activeWorkspaceSlug);
  const activeWorkspaceId = activeWorkspace?.id ?? workspaces[0]?.id ?? null;

  function handleOpenCreate() {
    setWorkspaceName("");
    openCreate();
  }

  function handleCreateWorkspace() {
    const name = workspaceName.trim();

    if (!name) {
      return;
    }

    startTransition(async () => {
      const workspace = await createWorkspace(name);

      if (workspace) {
        router.push(`/${workspace.slug}`);
      }

      router.refresh();
      closeCreate();
    });
  }

  function handleChange(workspaceId: string | null) {
    if (!workspaceId) {
      return;
    }

    const workspace = workspaces.find((w) => w.id === workspaceId);

    if (workspace && workspace.slug !== activeWorkspaceSlug) {
      router.push(`/${workspace.slug}`);
    }
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      title="Menu"
      size="xs"
      padding="md"
      overlayProps={{ backgroundOpacity: 0.35 }}
      styles={{
        content: {
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
        },
        body: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        },
      }}
    >
      <div className="flex h-full min-h-0 flex-col">
        <Stack gap="md" className="min-h-0 flex-1 overflow-y-auto">
          <SelectField
            label="Workspace"
            placeholder={
              workspaces.length === 0 ? "No workspaces" : "Select workspace"
            }
            options={workspaces.map((workspace) => ({
              value: workspace.id,
              label: workspace.name,
            }))}
            value={activeWorkspaceId}
            onChange={handleChange}
            disabled={workspaces.length === 0}
            allowDeselect={false}
            comboboxProps={{ withinPortal: false }}
          />
          {getAppNavItems(activeWorkspaceSlug).map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              active={pathname === item.href}
              onClick={onClose}
            />
          ))}
        </Stack>

        <div className="mt-auto shrink-0 pt-4">
          <Button
            intent="primary"
            appearance="filled"
            fullWidth
            onClick={handleOpenCreate}
          >
            New workspace
          </Button>
        </div>
      </div>

      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title="New workspace"
        centered
        size="sm"
        zIndex={400}
      >
        <Stack gap="md">
          <TextField
            label="Name"
            placeholder="My workspace"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleCreateWorkspace();
              }
            }}
            data-autofocus
          />
          <Group justify="flex-end" gap="sm">
            <Button
              intent="neutral"
              appearance="subtle"
              onClick={closeCreate}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              intent="primary"
              appearance="filled"
              loading={isPending}
              disabled={!workspaceName.trim()}
              onClick={handleCreateWorkspace}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Drawer>
  );
}
