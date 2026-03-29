/**
 * Assembles raw LLM cell output into a valid nbformat v4 Jupyter notebook.
 */

export const REQUIRED_SECTIONS = [
  "Paper Summary",
  "Core Contributions",
  "Mathematical Foundations",
  "Algorithm Walkthrough",
  "Synthetic Data Generation",
  "Core Implementation",
  "Experiments & Ablations",
  "Visualization",
  "Discussion & Limitations",
  "References",
] as const;

export interface RawCell {
  cell_type: "markdown" | "code";
  source: string;
  metadata: Record<string, unknown>;
}

interface MarkdownCell {
  cell_type: "markdown";
  source: string[];
  metadata: Record<string, unknown>;
}

interface CodeCell {
  cell_type: "code";
  source: string[];
  metadata: Record<string, unknown>;
  outputs: unknown[];
  execution_count: null;
}

type NotebookCell = MarkdownCell | CodeCell;

export interface Notebook {
  nbformat: 4;
  nbformat_minor: 5;
  metadata: {
    kernelspec: {
      display_name: string;
      language: string;
      name: string;
    };
    language_info: {
      name: string;
      version: string;
    };
  };
  cells: NotebookCell[];
}

/**
 * Convert a raw text string into nbformat source array (list of lines with \n).
 */
function toSourceLines(text: string): string[] {
  const lines = text.split("\n");
  return lines.map((line, i) => (i < lines.length - 1 ? line + "\n" : line));
}

/**
 * Assemble a valid nbformat v4 notebook from raw cells.
 * @throws if cells array is empty
 */
export function assembleNotebook(cells: RawCell[], _title: string): Notebook {
  if (cells.length === 0) {
    throw new Error("Cannot assemble notebook: at least one cell is required");
  }

  const notebookCells: NotebookCell[] = cells.map((raw) => {
    if (raw.cell_type === "markdown") {
      return {
        cell_type: "markdown" as const,
        source: toSourceLines(raw.source),
        metadata: raw.metadata ?? {},
      };
    }
    return {
      cell_type: "code" as const,
      source: toSourceLines(raw.source),
      metadata: raw.metadata ?? {},
      outputs: [],
      execution_count: null,
    };
  });

  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: {
        name: "python",
        version: "3.10.0",
      },
    },
    cells: notebookCells,
  };
}
