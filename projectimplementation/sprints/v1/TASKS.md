# Sprint v1 — Tasks

## Status: In Progress

---

- [x] Task 1: Initialize Next.js 14 project with Tailwind CSS, shadcn/ui, and Geist font (P0)
  - Acceptance: `npm run dev` starts without errors; Geist font renders; shadcn `Button` and `Card` import cleanly; dark mode class applied to root layout
  - Files: `package.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `components.json`
  - Completed: 2026-03-29 — Next.js 14 scaffolded in paper2notebook/; Geist Sans+Mono from next/font/google; shadcn/ui initialized (Button, Card); dark class + #0d1117 bg on body; vitest added; 6 smoke tests pass; build clean; npm audit 0 vulnerabilities

- [x] Task 2: Build Landing page — API key input + PDF upload form (P0)
  - Acceptance: Page renders with dark background, purple accent, Geist font; API key field is masked (type=password); PDF upload supports drag-drop and click-to-browse; "Generate Notebook" button is disabled until both fields are filled; form submits to `POST /api/generate`
  - Files: `app/page.tsx`, `components/api-key-input.tsx`, `components/pdf-dropzone.tsx`
  - Completed: 2026-03-29 — Hero heading, ApiKeyInput (masked + eye toggle), PdfDropzone (drag-drop + click), coral CTA button disabled until both fields filled; 5/5 Playwright E2E tests pass; npm audit clean

- [x] Task 3: Create `POST /api/generate` route — receive upload and parse PDF (P0)
  - Acceptance: Accepts multipart form data (apiKey + pdf file); uses `pdf-parse` to extract full text; creates a unique `jobId`; writes raw text to `projectimplementation/output/<jobId>/raw.txt`; returns `{ jobId }` within 3s
  - Files: `app/api/generate/route.ts`, `lib/pdf-parser.ts`
  - Completed: 2026-03-29 — POST /api/generate validates apiKey + pdf, parses with pdf-parse v1.1.1, writes raw.txt to output/\{jobId\}/, returns {jobId, pageCount}; jobRegistry Map for pipeline state; next.config serverExternalPackages fix; 4 unit + 4 integration tests pass; npm audit clean

- [x] Task 4: Build o3 notebook generation service (P0)
  - Acceptance: `lib/notebook-generator.ts` calls OpenAI `o3` with a structured system prompt; receives JSON array of cells; `lib/notebook-assembler.ts` converts cells to valid nbformat v4; writes `projectimplementation/output/<jobId>/notebook.ipynb`; all 10 required sections present
  - Files: `lib/notebook-generator.ts`, `lib/notebook-assembler.ts`, `lib/prompts/system-prompt.ts`
  - Completed: 2026-03-29 — generateNotebookCells() calls o3, strips code fences, validates JSON array; assembleNotebook() produces valid nbformat v4 with kernelspec; system-prompt enforces 10 sections + realistic synthetic data (N>=10k); 13 unit tests pass; build clean; npm audit 0 vulnerabilities

- [x] Task 5: Wire full pipeline — PDF parse → o3 → save notebook (P0)
  - Acceptance: End-to-end works: upload PDF → parse → call o3 → save `.ipynb` → return `{ jobId, status: "complete" }`; tested manually with one real ML paper PDF; notebook opens in Jupyter without errors
  - Files: `app/api/generate/route.ts` (updated), `app/api/download/[jobId]/route.ts`
  - Completed: 2026-03-29 — lib/pipeline.ts wires readFile→generateNotebookCells→assembleNotebook→writeFile; generate route kicks off pipeline async, updates jobRegistry on complete/error; /api/download/[jobId] streams .ipynb; /api/status/[jobId] returns status+metadata; 4 unit tests pass; build clean

- [ ] Task 6: Build Processing page with animated progress feed (P0)
  - Acceptance: After form submit, user navigates to `/processing?jobId=...`; page shows sequential animated steps ("Parsing PDF...", "Identifying core algorithms...", "Building experiments...", "Assembling notebook..."); polls `GET /api/status/:jobId` every 3s; auto-redirects to `/result?jobId=...` when done
  - Files: `app/processing/page.tsx`, `components/progress-feed.tsx`, `app/api/status/[jobId]/route.ts`

- [ ] Task 7: Build Result page — download + Open in Colab (P1)
  - Acceptance: `/result?jobId=...` shows paper title and notebook section count; "Download .ipynb" button triggers file download via `/api/download/:jobId`; "Open in Colab" button calls `/api/colab/:jobId` which creates an anonymous GitHub Gist and returns a `colab.research.google.com/gist/...` URL that opens in a new tab
  - Files: `app/result/page.tsx`, `components/download-button.tsx`, `components/colab-button.tsx`, `app/api/colab/[jobId]/route.ts`

- [ ] Task 8: Polish UI — error states, loading skeletons, mobile layout (P1)
  - Acceptance: Error shown for invalid API key, non-PDF file, o3 timeout; skeleton loaders on result page; layout works on 375px mobile; no horizontal overflow; consistent visual language across all three pages
  - Files: `components/error-state.tsx`, `components/skeleton-loader.tsx`, updates to all page files

- [ ] Task 9: Validate notebook quality — prompt iteration with real papers (P1)
  - Acceptance: Test with 2 real papers (e.g., "Attention Is All You Need", "LoRA"); verify: realistic synthetic data shapes, LaTeX equations render, all code cells are runnable, no `TODO` placeholders, plots render without errors; iterate `system-prompt.ts` until quality meets bar
  - Files: `lib/prompts/system-prompt.ts` (iterate), `projectimplementation/output/` (review samples)

- [ ] Task 10: Final commit + README (P2)
  - Acceptance: `README.md` documents local setup, required env vars (`GITHUB_TOKEN` optional for Colab), and how to run; `.env.example` included; `git add -A && git push` succeeds
  - Files: `README.md`, `.env.example`
