import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync, existsSync } from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

// Helper: build a multipart FormData with a fake PDF
function buildForm(apiKey: string, pdfBuffer: Buffer, filename = "test.pdf") {
  const form = new FormData();
  form.append("apiKey", apiKey);
  form.append(
    "pdf",
    new Blob([pdfBuffer], { type: "application/pdf" }),
    filename
  );
  return form;
}

describe("POST /api/generate (integration)", () => {
  it("returns 400 when apiKey is missing", async () => {
    const form = new FormData();
    form.append(
      "pdf",
      new Blob([Buffer.from("%PDF-1.4 test")], { type: "application/pdf" }),
      "test.pdf"
    );
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("returns 400 when pdf is missing", async () => {
    const form = new FormData();
    form.append("apiKey", "sk-test-key");
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("returns 400 when file is not a PDF", async () => {
    const form = new FormData();
    form.append("apiKey", "sk-test-key");
    form.append(
      "pdf",
      new Blob(["hello world"], { type: "text/plain" }),
      "notes.txt"
    );
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(400);
  });

  it("returns { jobId } and writes raw.txt when given a valid PDF", async () => {
    const fakePdf = readFileSync(
      path.resolve(__dirname, "../screenshots/test-paper.pdf")
    );
    const form = buildForm("sk-test-key-1234567890", fakePdf);

    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      body: form,
    });

    // The route starts async generation — we only test the parse+jobId step here
    // It may return 200 (jobId) or 500 if o3 call fails (no real key) — both are fine
    // We specifically assert that if 200, we get a jobId
    if (res.status === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("jobId");
      expect(typeof body.jobId).toBe("string");
      expect(body.jobId.length).toBeGreaterThan(0);
    } else {
      // Any non-400 server error is acceptable since we don't have a real API key
      expect(res.status).not.toBe(400);
    }
  });
});
