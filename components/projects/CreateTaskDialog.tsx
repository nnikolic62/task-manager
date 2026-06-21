"use client";

import { Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { createTask } from "@/actions/tasks";
import { Button } from "@/components/ui/Button";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { SelectField } from "@/components/ui/Select";
import { TextareaField } from "@/components/ui/TextareaField";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/Toast";
import { COLUMN_CONFIG } from "@/lib/kanban";
import type { TaskPriority, TaskStatus } from "@/schemas/task.schema";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

type CreateTaskDialogProps = {
  projectId: string;
  projectPath: string;
  defaultStatus: TaskStatus;
  trigger?: ReactNode;
};

export function CreateTaskDialog({
  projectId,
  projectPath,
  defaultStatus,
  trigger,
}: CreateTaskDialogProps) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const columnLabel = COLUMN_CONFIG[defaultStatus].label;

  function handleOpen() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(null);
    open();
  }

  function handleCreate() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    startTransition(async () => {
      const result = await createTask(
        projectId,
        projectPath,
        defaultStatus,
        trimmedTitle,
        description.trim() || undefined,
        priority,
        dueDate ?? undefined,
      );

      if (!result.ok) {
        toast.error(result.toast ?? "Could not create task");
        return;
      }

      close();
      router.refresh();
    });
  }

  return (
    <>
      {trigger ? (
        <span onClick={handleOpen} className="block w-full">
          {trigger}
        </span>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="mt-3 w-full rounded-lg px-2 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-zinc-800 hover:text-foreground"
        >
          + Add task
        </button>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={`New task · ${columnLabel}`}
        centered
        size="sm"
      >
        <Stack gap="md">
          <TextField
            label="Title"
            placeholder="Set up OpenAPI schema"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
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
            placeholder="Optional details for this task"
            value={description}
            rows={3}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
          <SelectField
            label="Priority"
            value={priority}
            onChange={(value) =>
              setPriority((value as TaskPriority) ?? "medium")
            }
            options={[...PRIORITY_OPTIONS]}
          />
          <DatePickerField
            label="Due date"
            placeholder="Select due date"
            value={dueDate}
            onChange={setDueDate}
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
              disabled={!title.trim()}
              onClick={handleCreate}
            >
              Create task
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
