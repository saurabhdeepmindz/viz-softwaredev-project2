"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

function ResultContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") ?? "";

  const [colabLoading, setColabLoading] = useState(false);
  const [colabError, setColabError] = useState<string | null>(null);

  async function handleOpenColab() {
    setColabLoading(true);
    setColabError(null);
    try {
      const res = await fetch(`/api/colab/${jobId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create Colab link");
      window.open(data.colabUrl, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      setColabError(err instanceof Error ? err.message : "Failed to open Colab");
    } finally {
      setColabLoading(false);
    }
  }

  const downloadUrl = `/api/download/${jobId}`;

  return (
    <main
      data-testid="result-container"
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#30363d] bg-[#161b22]">
              <FileText size={28} className="text-[#8b5cf6]" />
            </div>
          </div>
          <h1
            className="text-2xl font-semibold tracking-tight text-[#e6edf3]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Your notebook is ready
          </h1>
          <p className="mt-2 text-sm text-[#7d8590]">
            Download the .ipynb file or open directly in Google Colab.
          </p>
        </div>

        {/* Action card */}
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 space-y-3">
          {/* Download */}
          <a href={downloadUrl} download>
            <Button
              data-testid="download-button"
              className="w-full h-12 rounded-lg bg-[#e8705a] text-white font-medium hover:bg-[#d4604a] transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download .ipynb
            </Button>
          </a>

          {/* Open in Colab */}
          <Button
            data-testid="colab-button"
            onClick={handleOpenColab}
            disabled={colabLoading}
            className="w-full h-12 rounded-lg border border-[#30363d] bg-transparent text-[#e6edf3] font-medium hover:bg-[#1c2128] transition-colors flex items-center justify-center gap-2"
          >
            {colabLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ExternalLink size={16} />
            )}
            Open in Google Colab
          </Button>

          {colabError && (
            <p className="text-xs text-red-400 pt-1">{colabError}</p>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-[#7d8590] underline underline-offset-4 hover:text-[#e6edf3]"
          >
            ← Generate another notebook
          </a>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[#7d8590]">Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}
