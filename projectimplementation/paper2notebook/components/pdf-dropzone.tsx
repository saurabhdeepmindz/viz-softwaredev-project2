"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { FileText, UploadCloud } from "lucide-react";

interface PdfDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function PdfDropzone({ file, onFileChange }: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      onFileChange(dropped);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type === "application/pdf") {
      onFileChange(selected);
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[#7d8590] mb-2">
        Research Paper (PDF)
      </label>
      <div
        data-testid="pdf-dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-all ${
          dragging
            ? "border-[#8b5cf6] bg-[#8b5cf6]/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
            : file
            ? "border-[#30363d] bg-[#161b22]"
            : "border-[#30363d] bg-[#161b22] hover:border-[#8b5cf6]/60 hover:bg-[#8b5cf6]/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="sr-only"
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText size={32} className="text-[#8b5cf6]" />
            <p className="text-sm font-medium text-[#e6edf3]">{file.name}</p>
            <p className="text-xs text-[#7d8590]">
              {(file.size / 1024).toFixed(0)} KB — click to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud size={32} className="text-[#7d8590]" />
            <p className="text-sm font-medium text-[#e6edf3]">
              Drop your PDF here, or{" "}
              <span className="text-[#8b5cf6]">click to browse</span>
            </p>
            <p className="text-xs text-[#7d8590]">PDF files only</p>
          </div>
        )}
      </div>
    </div>
  );
}
