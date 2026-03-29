import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { jobRegistry } from "@/app/api/generate/route";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = jobRegistry.get(jobId);

  if (!job || job.status !== "complete" || !job.notebookPath) {
    return NextResponse.json({ error: "Notebook not ready" }, { status: 404 });
  }

  let notebookContent: string;
  try {
    notebookContent = await readFile(job.notebookPath, "utf-8");
  } catch {
    return NextResponse.json({ error: "Notebook file not found" }, { status: 404 });
  }

  // Create anonymous GitHub Gist
  const gistPayload = {
    description: `Paper2Notebook — ${jobId.slice(0, 8)}`,
    public: true,
    files: {
      "notebook.ipynb": { content: notebookContent },
    },
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "paper2notebook",
      Accept: "application/vnd.github.v3+json",
    };
    // Use GitHub token if available for higher rate limits
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers["Authorization"] = `token ${githubToken}`;
    }

    const gistRes = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers,
      body: JSON.stringify(gistPayload),
    });

    if (!gistRes.ok) {
      const err = await gistRes.text();
      return NextResponse.json(
        { error: `GitHub Gist creation failed: ${err}` },
        { status: 502 }
      );
    }

    const gist = await gistRes.json();
    const gistId = gist.id as string;
    const gistOwner = (gist.owner?.login as string) ?? "anonymous";
    const colabUrl = `https://colab.research.google.com/gist/${gistOwner}/${gistId}/notebook.ipynb`;

    return NextResponse.json({ colabUrl, gistId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to create Gist: ${msg}` },
      { status: 502 }
    );
  }
}
