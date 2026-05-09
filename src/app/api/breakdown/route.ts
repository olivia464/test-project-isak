import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a helpful assistant that breaks a single todo item into 3-6 concrete, actionable subtasks.

Each subtask must be a short imperative phrase (max 100 chars), specific, and ordered logically. Do not include the original task itself.`;

const SUBMIT_TOOL = {
  name: "submit_subtasks",
  description: "Submit the list of subtasks for the user's todo.",
  input_schema: {
    type: "object" as const,
    properties: {
      subtasks: {
        type: "array",
        items: { type: "string", maxLength: 100 },
        minItems: 3,
        maxItems: 6,
        description: "The ordered list of concrete, actionable subtasks.",
      },
    },
    required: ["subtasks"],
  },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  let body: { title?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 500) {
    return NextResponse.json(
      { error: "Title must be a non-empty string up to 500 chars." },
      { status: 400 },
    );
  }

  const client = new Anthropic();

  let response;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [SUBMIT_TOOL],
      tool_choice: { type: "tool", name: SUBMIT_TOOL.name },
      messages: [
        {
          role: "user",
          content: `Break this todo into subtasks: ${title}`,
        },
      ],
    });
  } catch (err) {
    console.error("[breakdown] Claude request failed:", err);
    const message = err instanceof Error ? err.message : "Claude request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json(
      { error: "Claude did not call the expected tool." },
      { status: 502 },
    );
  }

  const input = toolUse.input as { subtasks?: unknown };
  const subtasks = Array.isArray(input.subtasks)
    ? input.subtasks
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= 500)
        .slice(0, 6)
    : [];

  if (subtasks.length === 0) {
    return NextResponse.json(
      { error: "Claude returned no usable subtasks." },
      { status: 502 },
    );
  }

  return NextResponse.json({ subtasks });
}
