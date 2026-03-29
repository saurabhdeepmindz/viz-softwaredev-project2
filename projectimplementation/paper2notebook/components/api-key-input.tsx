"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      <label
        htmlFor="api-key"
        className="block text-sm font-medium text-[#7d8590] mb-2"
      >
        OpenAI API Key
      </label>
      <div className="relative">
        <input
          id="api-key"
          data-testid="api-key-input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-..."
          autoComplete="off"
          className="w-full rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-3 pr-12 text-[#e6edf3] placeholder-[#7d8590] text-sm focus:border-[#8b5cf6] focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
        />
        <button
          type="button"
          data-testid="api-key-toggle"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#e6edf3] transition-colors"
          aria-label={visible ? "Hide API key" : "Show API key"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-[#7d8590]">
        Your key is never stored — it&apos;s sent directly to OpenAI per request.
      </p>
    </div>
  );
}
