import { readFile, writeFile } from "fs/promises";
import path from "path";
import { generateNotebookCells } from "@/lib/notebook-generator";
import { assembleNotebook } from "@/lib/notebook-assembler";

export interface PipelineOptions {
  jobId: string;
  rawTextPath: string;
  apiKey: string;
  outputDir: string;
}

export interface PipelineResult {
  notebookPath: string;
  cellCount: number;
}

/**
 * Runs the full generation pipeline:
 * 1. Read raw text from disk
 * 2. Call o3 to generate notebook cells
 * 3. Assemble into nbformat v4
 * 4. Write .ipynb to output directory
 */
export async function runGenerationPipeline(
  opts: PipelineOptions
): Promise<PipelineResult> {
  // Step 1: Read raw paper text
  const rawText = await readFile(opts.rawTextPath, "utf-8");

  // Step 2: Generate cells via o3
  const cells = await generateNotebookCells({
    apiKey: opts.apiKey,
    rawText,
  });

  // Step 3: Assemble into valid nbformat v4
  const notebook = assembleNotebook(cells, opts.jobId);

  // Step 4: Write to disk
  const notebookPath = path.join(opts.outputDir, "notebook.ipynb");
  await writeFile(notebookPath, JSON.stringify(notebook, null, 2), "utf-8");

  return { notebookPath, cellCount: cells.length };
}
