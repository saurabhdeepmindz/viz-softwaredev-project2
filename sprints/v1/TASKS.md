# Sprint v1 — Tasks

## Status: In Progress

---

- [ ] Task 1: Initialize Next.js 14 project with Tailwind, shadcn/ui, and Geist font (P0)
  - Acceptance: `npm run dev` starts without errors; Geist font renders; shadcn Button and Card components import cleanly; dark mode works
  - Files: `package.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `components.json`

- [ ] Task 2: Build the Landing page — API key input + PDF upload form (P0)
  - Acceptance: Page renders with Geist font, purple accent, dark background (claude.ai style); user can type API key (masked); user can drag-drop or click-to-upload a PDF; "Generate Notebook" button is disabled until both fields are filled; form POSTs to `/api/generate`
  - Files: `app/page.tsx`, `components/api-key-input.tsx`, `components/pdf-upload.tsx`

- [ ] Task 3: Create POST `/api/generate` route — PDF parsing pipeline (P0)
  - Acceptance: Accepts multipart form (apiKey + pdf file); uses `pdf-parse` to extract full text; returns `{ jobId, title, pageCount }` within 3s; writes raw text to `output/<jobId>/raw.txt`
  - Files: `app/api/generate/route.ts`, `lib/pdf-parser.ts`, `output/` directory

- [ ] Task 4: Build o3 notebook generation service (P0)
  - Acceptance: `lib/notebook-generator.ts` calls OpenAI `o3` with a structured system prompt; receives JSON array of cells; assembles valid nbformat v4 JSON; writes to `output/<jobId>/notebook.ipynb`; all 10 required sections present in output
  - Files: `lib/notebook-generator.ts`, `lib/notebook-assembler.ts`, `lib/prompts/system-prompt.ts`

- [ ] Task 5: Wire generation pipeline — connect PDF parse → o3 → save notebook (P0)
  - Acceptance: Full end-to-end works: upload PDF → `/api/generate` parses → calls o3 → saves `.ipynb` → returns `{ jobId, downloadUrl }`; tested with a real ML paper PDF
  - Files: `app/api/generate/route.ts` (updated), `app/api/download/[jobId]/route.ts`

- [ ] Task 6: Build Processing page with animated progress feed (P0)
  - Acceptance: After form submit, user is redirected to `/processing?jobId=...`; page shows animated steps ("Parsing PDF...", "Extracting algorithms...", "Generating experiments...", "Assembling notebook...") cycling every few seconds; uses a clean progress indicator (not a spinner — show meaningful text); auto-redirects to `/result` when job completes
  - Files: `app/processing/page.tsx`, `components/progress-feed.tsx`, `app/api/status/[jobId]/route.ts`

- [ ] Task 7: Build Result page — download + Open in Colab (P1)
  - Acceptance: `/result?jobId=...` shows notebook title, section count, estimated cell count; "Download .ipynb" button triggers file download; "Open in Colab" button creates a GitHub Gist (using a server-side GitHub token or anonymous) and opens `colab.research.google.com/gist/...` in a new tab
  - Files: `app/result/page.tsx`, `components/download-button.tsx`, `components/colab-button.tsx`, `app/api/colab/[jobId]/route.ts`

- [ ] Task 8: Polish UI — loading states, error handling, responsive layout (P1)
  - Acceptance: All pages work on mobile (375px+); error states shown for invalid API key, non-PDF upload, o3 timeout; skeleton loaders on result page; no layout shifts; consistent claude.ai-inspired visual language across all pages
  - Files: `components/error-state.tsx`, `components/skeleton-loader.tsx`, updates to all page files

- [ ] Task 9: Synthetic data quality — validate notebook is research-grade (P1)
  - Acceptance: Manually test with 2 real papers (e.g., Attention Is All You Need, LoRA); verify notebook has: realistic data shapes, proper statistical distributions, runnable code cells, LaTeX equations, plots; no `TODO` placeholders left in generated output
  - Files: `lib/prompts/system-prompt.ts` (iterate prompt), `output/` (review samples)

- [ ] Task 10: Git commit + project README (P2)
  - Acceptance: `git add -A && git commit`; `README.md` explains setup, env vars needed (`OPENAI_API_KEY` optional, `GITHUB_TOKEN` for Colab), and how to run locally
  - Files: `README.md`, `.env.example`
