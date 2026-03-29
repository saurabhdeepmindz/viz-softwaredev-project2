import { describe, it, expect } from "vitest";
import { parsePdf } from "@/lib/pdf-parser";

describe("parsePdf — validation layer", () => {
  it("throws immediately when buffer does not start with %PDF header", async () => {
    const buf = Buffer.from("not a pdf at all");
    await expect(parsePdf(buf)).rejects.toThrow(/Invalid PDF/);
  });

  it("throws immediately for empty buffer", async () => {
    const buf = Buffer.alloc(0);
    await expect(parsePdf(buf)).rejects.toThrow(/Invalid PDF/);
  });

  it("throws immediately for buffer with wrong magic bytes", async () => {
    const buf = Buffer.from("PK\x03\x04"); // ZIP/docx magic
    await expect(parsePdf(buf)).rejects.toThrow(/Invalid PDF/);
  });

  it("accepts buffer starting with %PDF (passes header check, delegates to pdf-parse)", async () => {
    // A buffer that passes header check but may fail deeper parse — we only
    // test that the header guard passes (error changes from /Invalid PDF/ to /Failed to parse/)
    const buf = Buffer.from("%PDF-1.4 truncated");
    await expect(parsePdf(buf)).rejects.toThrow(/Failed to parse PDF/);
  });
});
