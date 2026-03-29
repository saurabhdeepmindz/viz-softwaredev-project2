import { describe, it, expect, vi, beforeEach } from "vitest";

// Must be declared before vi.mock so the factory can close over it
const mockCreate = vi.fn();

vi.mock("openai", () => {
  // Use a real class so `new OpenAI(...)` works
  class MockOpenAI {
    chat = { completions: { create: mockCreate } };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_opts: unknown) {}
  }
  return { default: MockOpenAI };
});

import { generateNotebookCells, type GenerateOptions } from "@/lib/notebook-generator";

const VALID_CELLS_JSON = JSON.stringify([
  { cell_type: "markdown", source: "# Paper Summary\n\nTest paper.", metadata: {} },
  { cell_type: "code", source: "import numpy as np\nimport torch", metadata: {} },
]);

const MOCK_OPTS: GenerateOptions = {
  apiKey: "sk-test-key",
  rawText: "This paper presents a novel attention mechanism...",
};

describe("generateNotebookCells", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed array of RawCells on success", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: VALID_CELLS_JSON } }],
    });

    const cells = await generateNotebookCells(MOCK_OPTS);
    expect(Array.isArray(cells)).toBe(true);
    expect(cells).toHaveLength(2);
    expect(cells[0].cell_type).toBe("markdown");
    expect(cells[1].cell_type).toBe("code");
  });

  it("strips markdown code fences if model wraps output", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "```json\n" + VALID_CELLS_JSON + "\n```" } }],
    });

    const cells = await generateNotebookCells(MOCK_OPTS);
    expect(Array.isArray(cells)).toBe(true);
    expect(cells).toHaveLength(2);
  });

  it("throws /empty response/ when model returns null content", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    });

    await expect(generateNotebookCells(MOCK_OPTS)).rejects.toThrow(/empty response/i);
  });

  it("throws /invalid json/ when response is not valid JSON", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "I cannot process this." } }],
    });

    await expect(generateNotebookCells(MOCK_OPTS)).rejects.toThrow(/invalid json/i);
  });

  it("throws /must be an array/ when JSON is an object not array", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"cells": []}' } }],
    });

    await expect(generateNotebookCells(MOCK_OPTS)).rejects.toThrow(/must be an array/i);
  });

  it("throws /OpenAI API error/ when the SDK call rejects", async () => {
    mockCreate.mockRejectedValueOnce(
      Object.assign(new Error("Incorrect API key"), { status: 401 })
    );

    await expect(generateNotebookCells(MOCK_OPTS)).rejects.toThrow(/OpenAI API error/i);
  });
});
