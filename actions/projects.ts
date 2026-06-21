"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { parseDueDate } from "@/lib/dates";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/utils";

export type CreateProjectResult = { ok: true } | { ok: false; toast?: string };

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

  const baseSlug = slugify(trimmed) || "project";
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (!existing) {
      break;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  try {
    await db.insert(projects).values({
      workspaceId,
      name: trimmed,
      slug,
      description: trimmedDescription || null,
      createdBy: session.id,
      dueDate: parseDueDate(dueDate),
    });
  } catch {
    return { ok: false, toast: "Could not create project" };
  }

  revalidatePath(`/${workspaceSlug}`, "page");

  return { ok: true };
}
