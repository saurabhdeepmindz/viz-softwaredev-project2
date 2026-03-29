import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { parsePdf } from "@/lib/pdf-parser";

// Output directory — relative to project root (not Next.js app)
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

  // Validate required fields
  const apiKey = formData.get("apiKey");
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json(
      { error: "apiKey is required" },
      { status: 400 }
    );
  }

  const pdfFile = formData.get("pdf");
  if (!pdfFile || !(pdfFile instanceof Blob)) {
    return NextResponse.json(
      { error: "pdf file is required" },
      { status: 400 }
    );
  }

  // Validate MIME type
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

  // Create job directory and persist raw text
  const jobId = randomUUID();
  const jobDir = path.join(OUTPUT_ROOT, jobId);
  try {
    await mkdir(jobDir, { recursive: true });
    await writeFile(path.join(jobDir, "raw.txt"), parseResult.text, "utf-8");
    // Store API key in job metadata (in-memory only — never persisted to disk)
    // The key will be used by the async generation pipeline
    jobRegistry.set(jobId, {
      status: "parsed",
      apiKey: apiKey.trim(),
      pageCount: parseResult.pageCount,
      rawTextPath: path.join(jobDir, "raw.txt"),
      createdAt: Date.now(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Storage error";
    return NextResponse.json(
      { error: `Failed to create job: ${msg}` },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { jobId, pageCount: parseResult.pageCount },
    { status: 200 }
  );
}

// In-memory job registry — intentionally simple for v1 (single server process)
export type JobStatus = "parsed" | "generating" | "complete" | "error";

export interface JobRecord {
  status: JobStatus;
  apiKey: string;
  pageCount: number;
  rawTextPath: string;
  createdAt: number;
  notebookPath?: string;
  errorMessage?: string;
  title?: string;
}

// Module-level singleton — accessible from other route handlers
export const jobRegistry = new Map<string, JobRecord>();
