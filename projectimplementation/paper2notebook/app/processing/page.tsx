"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProgressFeed } from "@/components/progress-feed";
import { Suspense } from "react";

type PollStatus = "generating" | "complete" | "error" | "polling";

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [status, setStatus] = useState<PollStatus>("polling");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const poll = useCallback(async () => {
    if (!jobId) {
      setStatus("error");
      setErrorMessage("No job ID provided.");
      return;
    }

    try {
      const res = await fetch(`/api/status/${jobId}`);
      if (!res.ok) {
        setStatus("error");
        setErrorMessage("Could not find your job. Please try again.");
        return;
      }
      const data = await res.json();

      if (data.status === "complete") {
        setStatus("complete");
        setTimeout(() => router.push(`/result?jobId=${jobId}`), 800);
      } else if (data.status === "error") {
        setStatus("error");
        setErrorMessage(data.errorMessage ?? "Generation failed. Please try again.");
      } else {
        setStatus("generating");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error while checking status.");
    }
  }, [jobId, router]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [poll]);

  return (
    <main
      data-testid="processing-container"
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
    >
      {/* Animated gradient progress bar */}
      {status !== "error" && (
        <div className="fixed top-0 left-0 right-0 h-0.5">
          <div
            className={`h-full bg-gradient-to-r from-[#8b5cf6] to-[#e8705a] transition-all duration-1000 ${
              status === "complete" ? "w-full" : "w-3/4"
            }`}
            style={{
              animation: status === "complete" ? undefined : "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            data-testid="processing-heading"
            className="text-2xl font-semibold tracking-tight text-[#e6edf3]"
            style={{ letterSpacing: "-0.02em" }}
          >
            {status === "complete"
              ? "Notebook ready!"
              : status === "error"
              ? "Something went wrong"
              : "Generating your notebook..."}
          </h1>
          <p className="mt-2 text-sm text-[#7d8590]">
            {status === "complete"
              ? "Redirecting to your results..."
              : status === "error"
              ? "See the error below."
              : "This takes 30–90 seconds. Sit tight."}
          </p>
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <ProgressFeed status={status} errorMessage={errorMessage} />
        </div>

        {status === "error" && (
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-[#8b5cf6] underline underline-offset-4 hover:text-[#a78bfa]"
            >
              ← Start over
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[#7d8590]">Loading...</div>}>
      <ProcessingContent />
    </Suspense>
  );
}
