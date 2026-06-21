import { and, count, eq, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { projects, tasks } from "@/db/schema";

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: string, text: string) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
}

async function getOpenTaskCount(projectName: string) {
  const [result] = await db
    .select({
      openTasks: count(tasks.id),
    })
    .from(projects)
    .leftJoin(
      tasks,
      and(eq(projects.id, tasks.projectId), ne(tasks.status, "done")),
    )
    .where(eq(projects.name, projectName))
    .limit(1);
  return result;
}

export async function POST(request: NextRequest) {
  const update = await request.json();

  const text = update.message?.text;
  const chatId = update.message?.chat.id;

  if (!text || !chatId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const match = text.match(/^\/tasks\s+(.+)$/i);

  if (!match) {
    await sendMessage(
      chatId,
      "Invalid project name. Please use /tasks <project name>",
    );

    return NextResponse.json(
      { success: true, message: "Handled invalid command input" },
      { status: 200 },
    );
  }

  const projectName = match[1];

  try {
    const result = await getOpenTaskCount(projectName);

    const message =
      result && result.openTasks > 0
        ? `There are ${result.openTasks} open tasks in ${projectName}`
        : `No open tasks found in ${projectName}`;

    await sendMessage(chatId, message);
  } catch (_error) {
    await sendMessage(
      chatId,
      "Error getting open task count. Please try again later.",
    );
    return NextResponse.json(
      { error: "Error getting open task count" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
