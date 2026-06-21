"use client";

import { Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createProject } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { TextareaField } from "@/components/ui/TextareaField";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/Toast";
import { todayDateString } from "@/lib/dates";

type CreateProjectButtonProps = {
  workspaceId: string;
  workspaceSlug: string;
};

export function CreateProjectButton({
  workspaceId,
  workspaceSlug,
}: CreateProjectButtonProps) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDueDate, setProjectDueDate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setProjectName("");
    setProjectDescription("");
    setProjectDueDate(null);
    open();
  }

  function handleCreate() {
    const name = projectName.trim();

    if (!name) {
      return;
    }

    startTransition(async () => {
      const result = await createProject(
        workspaceId,
        workspaceSlug,
        name,
        projectDescription.trim() || undefined,
        projectDueDate ?? undefined,
      );

      if (!result.ok) {
        toast.error(result.toast ?? "Could not create project");
        return;
      }

      close();
      router.refresh();
    });
  }

  return (
    <>
      <Button intent="primary" appearance="filled" onClick={handleOpen}>
        New project
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title="New project"
        centered
        size="sm"
      >
        <Stack gap="md">
          <TextField
            label="Name"
            placeholder="Website redesign"
            value={projectName}
            onChange={(event) => setProjectName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleCreate();
              }
            }}
            data-autofocus
          />
          <TextareaField
            label="Description"
            placeholder="A project for the website redesign"
            value={projectDescription}
            rows={4}
            onChange={(event) =>
              setProjectDescription(event.currentTarget.value)
            }
          />
          <DatePickerField
            label="Due date"
            placeholder="Select due date"
            value={projectDueDate}
            onChange={setProjectDueDate}
            minDate={todayDateString()}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              intent="neutral"
              appearance="subtle"
              onClick={close}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              intent="primary"
              appearance="filled"
              loading={isPending}
              disabled={!projectName.trim()}
              onClick={handleCreate}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
