import OpenAI from "openai";
import { type RawCell } from "@/lib/notebook-assembler";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts/system-prompt";

export interface GenerateOptions {
  apiKey: string;
  rawText: string;
}

/**
 * Calls OpenAI o3 with the paper text and returns a validated array of notebook cells.
 * @throws with a descriptive message on API error or malformed response
 */
export async function generateNotebookCells(
  opts: GenerateOptions
): Promise<RawCell[]> {
  const client = new OpenAI({ apiKey: opts.apiKey });

  let content: string | null;
  try {
    const response = await client.chat.completions.create({
      model: "o3",
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserMessage(opts.rawText) },
      ],
      // o3 reasoning model — no temperature parameter (uses default)
    });
    content = response.choices[0]?.message?.content ?? null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`OpenAI API error: ${msg}`);
  }

  if (!content || content.trim().length === 0) {
    throw new Error("Empty response from OpenAI — model returned no content");
  }

  // Strip markdown code fences if the model wraps output despite instructions
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Invalid JSON from OpenAI: model did not return a JSON array. Got: ${cleaned.slice(0, 200)}`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Invalid response: OpenAI output must be an array of notebook cells"
    );
  }

  // Validate and normalise each cell
  const cells: RawCell[] = parsed.map((item: unknown, idx: number) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Cell ${idx} is not an object`);
    }
    const cell = item as Record<string, unknown>;
    const cellType = cell["cell_type"];
    if (cellType !== "markdown" && cellType !== "code") {
      throw new Error(
        `Cell ${idx} has invalid cell_type: ${String(cellType)}`
      );
    }
    const source =
      typeof cell["source"] === "string"
        ? cell["source"]
        : Array.isArray(cell["source"])
        ? (cell["source"] as string[]).join("")
        : "";

    return {
      cell_type: cellType,
      source,
      metadata: (cell["metadata"] as Record<string, unknown>) ?? {},
    };
  });

  return cells;
}
