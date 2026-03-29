import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { parsePdf } from "@/lib/pdf-parser";
import { runGenerationPipeline } from "@/lib/pipeline";

// Output directory lives one level above the Next.js app
const OUTPUT_ROOT = path.resolve(process.cwd(), "..", "output");

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart form data" },
      { status: 400 }
    );
  }

  const apiKey = formData.get("apiKey");
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json({ error: "apiKey is required" }, { status: 400 });
  }

  const pdfFile = formData.get("pdf");
  if (!pdfFile || !(pdfFile instanceof Blob)) {
    return NextResponse.json({ error: "pdf file is required" }, { status: 400 });
  }

  if (pdfFile.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Uploaded file must be a PDF (application/pdf)" },
      { status: 400 }
    );
  }

  // Parse PDF
  const buffer = Buffer.from(await pdfFile.arrayBuffer());
  let parseResult: { text: string; pageCount: number };
  try {
    parseResult = await parsePdf(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "PDF parse failed";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  // Create job directory
  const jobId = randomUUID();
  const jobDir = path.join(OUTPUT_ROOT, jobId);
  const rawTextPath = path.join(jobDir, "raw.txt");

  try {
    await mkdir(jobDir, { recursive: true });
    await writeFile(rawTextPath, parseResult.text, "utf-8");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Storage error";
    return NextResponse.json({ error: `Failed to create job: ${msg}` }, { status: 500 });
  }

  // Register job
  jobRegistry.set(jobId, {
    status: "generating",
    apiKey: apiKey.trim(),
    pageCount: parseResult.pageCount,
    rawTextPath,
    createdAt: Date.now(),
  });

  // Run pipeline asynchronously — client polls /api/status/:jobId
  runGenerationPipeline({
    jobId,
    rawTextPath,
    apiKey: apiKey.trim(),
    outputDir: jobDir,
  })
    .then(({ notebookPath, cellCount }) => {
      const job = jobRegistry.get(jobId);
      if (job) {
        jobRegistry.set(jobId, {
          ...job,
          status: "complete",
          notebookPath,
          cellCount,
        });
      }
    })
    .catch((err: unknown) => {
      const job = jobRegistry.get(jobId);
      if (job) {
        jobRegistry.set(jobId, {
          ...job,
          status: "error",
          errorMessage: err instanceof Error ? err.message : String(err),
        });
      }
    });

  return NextResponse.json({ jobId, pageCount: parseResult.pageCount }, { status: 200 });
}

// In-memory job registry
export type JobStatus = "parsed" | "generating" | "complete" | "error";

export interface JobRecord {
  status: JobStatus;
  apiKey: string;
  pageCount: number;
  rawTextPath: string;
  createdAt: number;
  notebookPath?: string;
  cellCount?: number;
  errorMessage?: string;
  title?: string;
}

export const jobRegistry = new Map<string, JobRecord>();
