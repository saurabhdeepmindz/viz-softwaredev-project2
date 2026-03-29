"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiKeyInput } from "@/components/api-key-input";
import { PdfDropzone } from "@/components/pdf-dropzone";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = apiKey.trim().length > 0 && file !== null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("apiKey", apiKey.trim());
      formData.append("pdf", file as File);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      const { jobId } = await res.json();
      router.push(`/processing?jobId=${jobId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs text-[#7d8590]">
          Powered by OpenAI o3
        </div>
        <h1
          data-testid="hero-heading"
          className="text-4xl font-semibold tracking-tight text-[#e6edf3] sm:text-5xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          Turn any research paper
          <br />
          <span className="text-[#8b5cf6]">into a runnable notebook</span>
        </h1>
        <p className="mt-4 max-w-md text-base text-[#7d8590]">
          Upload a PDF, get a production-quality Jupyter notebook implementing
          the core algorithms — ready to run in Google Colab.
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl border border-[#30363d] bg-[#161b22] p-8 shadow-xl"
      >
        <div className="flex flex-col gap-6">
          <ApiKeyInput value={apiKey} onChange={setApiKey} />
          <PdfDropzone file={file} onFileChange={setFile} />

          {error && (
            <p className="rounded-lg border border-red-800/40 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            data-testid="generate-button"
            disabled={!canSubmit || submitting}
            className="h-12 w-full rounded-lg bg-[#e8705a] text-white font-medium text-sm hover:bg-[#d4604a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </span>
            ) : (
              "Generate Notebook"
            )}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-xs text-[#7d8590]">
        Generation takes 30–90 seconds depending on paper length.
      </p>
    </main>
  );
}
