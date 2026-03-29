import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/notebook-generator", () => ({
  generateNotebookCells: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue("Mock paper text content"),
}));

import { runGenerationPipeline } from "@/lib/pipeline";
import { generateNotebookCells } from "@/lib/notebook-generator";
import { writeFile } from "fs/promises";

const mockGenerateCells = vi.mocked(generateNotebookCells);
const mockWriteFile = vi.mocked(writeFile);

const FAKE_CELLS = [
  { cell_type: "markdown" as const, source: "# Paper Summary\nTest", metadata: {} },
  { cell_type: "code" as const, source: "import numpy as np", metadata: {} },
];

const BASE_OPTS = {
  jobId: "test-job-id",
  rawTextPath: "/fake/path/raw.txt",
  apiKey: "sk-test",
  outputDir: "/fake/output",
};

describe("runGenerationPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls generateNotebookCells with apiKey and raw text", async () => {
    mockGenerateCells.mockResolvedValueOnce(FAKE_CELLS);
    await runGenerationPipeline(BASE_OPTS);
    expect(mockGenerateCells).toHaveBeenCalledWith({
      apiKey: "sk-test",
      rawText: "Mock paper text content",
    });
  });

  it("writes notebook.ipynb to output directory", async () => {
    mockGenerateCells.mockResolvedValueOnce(FAKE_CELLS);
    await runGenerationPipeline(BASE_OPTS);
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining("notebook.ipynb"),
      expect.any(String),
      "utf-8"
    );
  });

  it("returns notebookPath and cellCount on success", async () => {
    mockGenerateCells.mockResolvedValueOnce(FAKE_CELLS);
    const result = await runGenerationPipeline(BASE_OPTS);
    expect(result.notebookPath).toContain("notebook.ipynb");
    expect(result.cellCount).toBe(2);
  });

  it("throws when generateNotebookCells fails", async () => {
    mockGenerateCells.mockRejectedValueOnce(new Error("o3 timeout"));
    await expect(runGenerationPipeline(BASE_OPTS)).rejects.toThrow("o3 timeout");
  });
});
