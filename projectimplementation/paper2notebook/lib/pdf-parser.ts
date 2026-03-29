// pdf-parse v1 is CJS; require at module level so vitest can intercept in tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (
  buf: Buffer
) => Promise<{ text: string; numpages: number }>;

export interface PdfParseResult {
  text: string;
  pageCount: number;
}

/**
 * Parses a PDF buffer and extracts its full text content.
 * Throws with a descriptive message if the buffer is not a valid PDF.
 */
export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  // Validate PDF magic bytes before attempting parse
  const header = buffer.slice(0, 5).toString("ascii");
  if (!header.startsWith("%PDF")) {
    throw new Error("Invalid PDF: file does not start with %PDF header");
  }

  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text ?? "",
      pageCount: data.numpages ?? 0,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse PDF: ${msg}`);
  }
}
