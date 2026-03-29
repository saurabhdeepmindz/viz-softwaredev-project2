import { NextRequest, NextResponse } from "next/server";
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

  return NextResponse.json({
    jobId,
    status: job.status,
    pageCount: job.pageCount,
    cellCount: job.cellCount,
    errorMessage: job.errorMessage,
    title: job.title,
  });
}
