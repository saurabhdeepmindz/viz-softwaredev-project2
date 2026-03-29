import { describe, it, expect } from "vitest";
import {
  assembleNotebook,
  REQUIRED_SECTIONS,
  type RawCell,
} from "@/lib/notebook-assembler";

// Minimal cell array covering all 10 required sections
function makeCells(): RawCell[] {
  return REQUIRED_SECTIONS.map((section, i) => ({
    cell_type: i % 2 === 0 ? ("markdown" as const) : ("code" as const),
    source: `# ${section}\n\nContent for ${section}`,
    metadata: {},
  }));
}

describe("assembleNotebook", () => {
  it("produces valid nbformat v4 structure", () => {
    const nb = assembleNotebook(makeCells(), "Test Paper");
    expect(nb.nbformat).toBe(4);
    expect(nb.nbformat_minor).toBeGreaterThanOrEqual(5);
    expect(nb.metadata).toHaveProperty("kernelspec");
    expect(nb.metadata.kernelspec).toMatchObject({
      display_name: "Python 3",
      language: "python",
      name: "python3",
    });
    expect(Array.isArray(nb.cells)).toBe(true);
  });

  it("includes all cells from input", () => {
    const cells = makeCells();
    const nb = assembleNotebook(cells, "Test Paper");
    expect(nb.cells).toHaveLength(cells.length);
  });

  it("sets correct cell_type on each cell", () => {
    const cells = makeCells();
    const nb = assembleNotebook(cells, "Test Paper");
    nb.cells.forEach((cell, i) => {
      expect(cell.cell_type).toBe(cells[i].cell_type);
    });
  });

  it("markdown cells have source as array of strings", () => {
    const cells: RawCell[] = [
      { cell_type: "markdown", source: "# Hello\nworld", metadata: {} },
    ];
    const nb = assembleNotebook(cells, "Paper");
    const mdCell = nb.cells[0];
    expect(mdCell.cell_type).toBe("markdown");
    expect(Array.isArray(mdCell.source)).toBe(true);
  });

  it("code cells have outputs array and execution_count", () => {
    const cells: RawCell[] = [
      { cell_type: "code", source: "import numpy as np", metadata: {} },
    ];
    const nb = assembleNotebook(cells, "Paper");
    const codeCell = nb.cells[0];
    expect(codeCell.cell_type).toBe("code");
    expect(Array.isArray((codeCell as { outputs: unknown[] }).outputs)).toBe(
      true
    );
    expect(
      (codeCell as { execution_count: null }).execution_count
    ).toBeNull();
  });

  it("throws when cells array is empty", () => {
    expect(() => assembleNotebook([], "Paper")).toThrow(/at least one cell/i);
  });
});

describe("REQUIRED_SECTIONS", () => {
  it("has exactly 10 sections", () => {
    expect(REQUIRED_SECTIONS).toHaveLength(10);
  });
});
