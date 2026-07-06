import { Anthropic } from "@anthropic-ai/sdk";

import { getOpenTaskCount } from "./projects";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tools = [
  {
    name: "get_open_task_count",
    description:
      "Returns the number of open (not done) tasks for a given project",
    input_schema: {
      type: "object" as const,
      properties: {
        projectName: { type: "string", description: "Project name" },
      },
      required: ["projectName"],
    },
  },
  {
    name: "list_tasks",
    description: "List tasks for a project, optionally filtered by status",
    input_schema: {
      type: "object" as const,
      properties: {
        projectName: { type: "string" },
        status: { type: "string", enum: ["todo", "in_progress", "done"] },
        limit: { type: "number", default: 10 },
      },
      required: ["projectName"],
    },
  },
  // ... ostale operacije koje želiš da izložiš
];

async function executeTool(toolName: string, input: unknown) {
  switch (toolName) {
    case "get_open_task_count": {
      const { projectName } = input as { projectName: string };
      return await getOpenTaskCount(projectName);
    }
    default:
      throw new Error(`Tool ${toolName} not found`);
  }
}

async function handleUserQuery(userText: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: userText,
    },
  ];

  while (true) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages,
      system:
        "You are a helpful assistant that can use tools to get information about projects and tasks.",
      tools,
      tool_choice: { type: "auto" },
    });

    const toolUseBlocks = response.content.filter(
      (block) => block.type === "tool_use",
    );

    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find((block) => block.type === "text");
      return textBlock?.text ?? "I couldn't find the answer to your question.";
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        try {
          const result = await executeTool(block.name, block.input);

          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: JSON.stringify(result),
          };
        } catch (error) {
          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: JSON.stringify({ error: "Tool execution failed" }),
            is_error: true,
          };
        }
      }),
    );

    messages.push({ role: "user", content: toolResults });
  }
}

export { handleUserQuery };
