import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { jobRegistry } from "@/app/api/generate/route";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = jobRegistry.get(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "complete" || !job.notebookPath) {
    return NextResponse.json(
      { error: "Notebook not ready", status: job.status },
      { status: 202 }
    );
  }

  let content: string;
  try {
    content = await readFile(job.notebookPath, "utf-8");
  } catch {
    return NextResponse.json({ error: "Notebook file not found" }, { status: 404 });
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="notebook-${jobId.slice(0, 8)}.ipynb"`,
      "Content-Length": String(Buffer.byteLength(content, "utf-8")),
    },
  });
}
