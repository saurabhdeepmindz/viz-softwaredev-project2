"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

const STEPS = [
  "Parsing PDF structure...",
  "Extracting algorithms and equations...",
  "Planning notebook sections...",
  "Generating synthetic data strategy...",
  "Writing core implementation...",
  "Building experiments and ablations...",
  "Assembling notebook...",
];

type StepState = "pending" | "active" | "done";

interface StepStatus {
  label: string;
  state: StepState;
}

interface ProgressFeedProps {
  status: "generating" | "complete" | "error" | "polling";
  errorMessage?: string;
}

export function ProgressFeed({ status, errorMessage }: ProgressFeedProps) {
  const [steps, setSteps] = useState<StepStatus[]>(
    STEPS.map((label, i) => ({ label, state: i === 0 ? "active" : "pending" }))
  );
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status === "complete") {
      setSteps(STEPS.map((label) => ({ label, state: "done" })));
      return;
    }
    if (status === "error") return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = Math.min(prev + 1, STEPS.length - 1);
        setSteps(
          STEPS.map((label, i) => ({
            label,
            state: i < next ? "done" : i === next ? "active" : "pending",
          }))
        );
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div data-testid="progress-feed" className="w-full space-y-3">
      {steps.map((step, i) => (
        <div
          key={i}
          data-testid="progress-step"
          className={`flex items-center gap-3 transition-all duration-500 ${
            step.state === "pending" ? "opacity-30" : "opacity-100"
          }`}
          style={{
            animation: step.state === "active" ? "fadeIn 0.4s ease-in" : undefined,
          }}
        >
          {step.state === "done" ? (
            <CheckCircle size={18} className="text-green-500 shrink-0" />
          ) : step.state === "active" ? (
            <Loader2 size={18} className="text-[#8b5cf6] animate-spin shrink-0" />
          ) : (
            <Circle size={18} className="text-[#30363d] shrink-0" />
          )}
          <span
            className={`text-sm ${
              step.state === "active"
                ? "text-[#e6edf3] font-medium"
                : step.state === "done"
                ? "text-[#7d8590] line-through"
                : "text-[#7d8590]"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}

      {status === "error" && errorMessage && (
        <div className="mt-4 rounded-lg border border-red-800/40 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
