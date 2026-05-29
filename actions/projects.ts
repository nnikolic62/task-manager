"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { parseDueDate } from "@/lib/dates";
import { getSession } from "@/lib/session";

export type CreateProjectResult =
  | { ok: true }
  | { ok: false; toast?: string };

export async function createProject(
  workspaceId: string,
  workspaceSlug: string,
  name: string,
  description?: string,
  dueDate?: string,
): Promise<CreateProjectResult> {
  const session = await getSession();

  if (!session) {
    return { ok: false, toast: "You must be signed in" };
  }

  const trimmed = name.trim();

  if (!trimmed) {
    return { ok: false, toast: "Project name is required" };
  }

  const trimmedDescription = description?.trim();

  await db.insert(projects).values({
    workspaceId,
    name: trimmed,
    description: trimmedDescription || null,
    createdBy: session.id,
    dueDate: parseDueDate(dueDate),
  });

  revalidatePath(`/${workspaceSlug}`, "page");

  return { ok: true };
}
