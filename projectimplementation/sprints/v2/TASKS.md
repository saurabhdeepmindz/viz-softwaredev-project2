# Sprint v2 — Tasks

## Status: In Progress

---

- [ ] Task 1: Create model config and two-pass o3 analysis prompt (P0)
  - Acceptance: `lib/config/models.ts` exports `ANALYSIS_MODEL` and `GENERATION_MODEL` (both `"o3"`); `lib/prompts/analysis-prompt.ts` produces a system prompt that instructs o3 to return structured JSON (title, algorithms, equations, datasets, experiments); tested with one paper — output JSON is valid and complete
  - Files: `lib/config/models.ts`, `lib/prompts/analysis-prompt.ts`

- [ ] Task 2: Implement Pass 1 — paper analysis service (P0)
  - Acceptance: `lib/paper-analyzer.ts` calls o3 with analysis prompt + raw PDF text; parses and validates the returned JSON (zod schema); returns typed `PaperAnalysis` object; handles o3 refusal/malformed JSON gracefully
  - Files: `lib/paper-analyzer.ts`, `lib/schemas/paper-analysis.ts`

- [ ] Task 3: Implement Pass 2 — research-grade notebook generation prompt (P0)
  - Acceptance: `lib/prompts/notebook-prompt.ts` takes `PaperAnalysis` and produces a detailed system prompt enforcing all 10 notebook sections; synthetic data requirements embedded (N ≥ 10k, correct distributions, seeded); all code cells must be self-contained and runnable; prompt tested — output notebook has no `TODO` placeholders
  - Files: `lib/prompts/notebook-prompt.ts`

- [ ] Task 4: Implement SSE streaming endpoint `GET /api/stream/:jobId` (P0)
  - Acceptance: Endpoint emits `text/event-stream`; pipeline emits ≥6 named status events at meaningful checkpoints; emits `complete` event with `{ downloadUrl, notebookMeta }`; emits `error` event on failure; job state stored in-memory (Map) keyed by jobId; SSE connection closes cleanly after complete/error
  - Files: `app/api/stream/[jobId]/route.ts`, `lib/job-store.ts`

- [ ] Task 5: Update `POST /api/generate` to use two-pass pipeline + SSE (P0)
  - Acceptance: Route returns `{ jobId }` within 500ms; kicks off async pipeline (Pass 1 → Pass 2 → assemble → write); pipeline emits SSE events via job store; final `.ipynb` written to `projectimplementation/output/<jobId>/notebook.ipynb`; tested end-to-end with a real paper
  - Files: `app/api/generate/route.ts` (rewrite), `lib/pipeline.ts`

- [ ] Task 6: Rebuild Processing page with real SSE feed and claude.ai design (P0)
  - Acceptance: Page connects to `EventSource('/api/stream/:jobId')`; each incoming status message appends to `<ProgressFeed>` with fade-in animation (400ms stagger); animated gradient progress bar at top (not spinner); on `complete` event, redirects to `/result`; on `error`, shows retry state; matches claude.ai color tokens exactly (`#0d1117` bg, `#e8705a` accent)
  - Files: `app/processing/page.tsx` (rewrite), `components/progress-feed.tsx` (rewrite)

- [ ] Task 7: Redesign Landing page to match claude.ai visual language (P1)
  - Acceptance: Hero headline "Turn any research paper into a runnable notebook"; Geist Sans font; `#0d1117` background; `<ApiKeyInput>` with eye-toggle and green validation dot on valid key format; `<PdfDropzone>` with dashed border glow on hover, shows filename + page count on drop; CTA button uses `#e8705a` coral; fully responsive at 375px+
  - Files: `app/page.tsx` (redesign), `components/api-key-input.tsx` (redesign), `components/pdf-dropzone.tsx` (redesign)

- [ ] Task 8: Redesign Result page with notebook metadata card (P1)
  - Acceptance: `<NotebookCard>` shows: paper title, detected venue/year, section count (should be 10), estimated cell count, estimated Colab runtime; "Download .ipynb" and "Open in Colab" buttons side-by-side; Colab button triggers `/api/colab/:jobId` which creates anonymous Gist and opens `colab.research.google.com/gist/...` in new tab; loading state on both buttons
  - Files: `app/result/page.tsx` (redesign), `components/notebook-card.tsx`, `components/action-buttons.tsx`, `app/api/colab/[jobId]/route.ts`

- [ ] Task 9: Add global error handling and edge case states (P1)
  - Acceptance: Invalid OpenAI API key → clear error on processing page ("Invalid API key — please go back and check"); PDF with no extractable text → "Could not parse PDF — try a text-based PDF"; o3 timeout (>3min) → "Generation timed out — try a shorter paper"; all errors show a "← Start Over" button that returns to `/`; no unhandled promise rejections in server logs
  - Files: `components/error-state.tsx`, `app/processing/page.tsx`, `app/api/generate/route.ts`

- [ ] Task 10: Validate notebook quality + commit (P2)
  - Acceptance: Test with 2 real papers ("Attention Is All You Need" + one other); verify: all 10 sections present, synthetic data N ≥ 10k, LaTeX renders in Colab, all code cells run without error, no `TODO` in output; git commit with test artifacts in `projectimplementation/output/samples/`; push to GitHub
  - Files: `lib/prompts/notebook-prompt.ts` (iterate if needed), `projectimplementation/output/samples/`, git commit
