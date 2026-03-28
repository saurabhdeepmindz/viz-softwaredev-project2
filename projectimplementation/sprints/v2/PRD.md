# Sprint v2 — PRD: Paper2Notebook — Research-Grade Quality & UI Polish

## Overview
Sprint v2 elevates the Paper2Notebook app from a working prototype to a tool that researchers
at top AI labs would actually use. The focus is on three pillars: (1) a multi-pass o3 prompt
pipeline that produces genuinely research-grade notebooks with realistic synthetic data,
(2) a streaming SSE-based processing experience with meaningful real-time messages, and
(3) a pixel-perfect UI that matches the visual language of claude.ai — Geist font, dark
background, subtle gradients, and smooth transitions.

> **On model naming:** `gpt-5.4` does not exist in the OpenAI API as of this sprint.
> We use `o3` (OpenAI's top reasoning model) which is architecturally the right choice
> for deep paper comprehension. Switch to `gpt-5` or successor when it becomes available
> via API. The model name is isolated in `lib/config/models.ts` for easy swapping.

## Goals
- Notebook quality bar: a researcher at OpenAI or DeepMind would find it immediately useful
- Synthetic data is statistically realistic (correct distributions, shapes, scale matching paper)
- Processing page streams real status from the server — not fake timers
- UI matches claude.ai visual design: Geist Sans, dark navy/charcoal bg, coral/purple accents
- Output `.ipynb` saved to `projectimplementation/output/` and cleanly downloadable
- "Open in Colab" works via anonymous GitHub Gist without user needing a GitHub account

## User Stories
- As a researcher, I want the notebook's synthetic data to resemble real experimental conditions, so my replication results are meaningful and publishable
- As a researcher, I want all code cells to run end-to-end in Colab without modification, so I can start experimenting immediately
- As a researcher, I want LaTeX equations rendered correctly in markdown cells, so I can follow the math without switching to the paper
- As a user, I want the processing screen to tell me exactly what step is happening (e.g. "Extracting transformer architecture..."), so I feel confident the tool is working
- As a user, I want the UI to feel premium and focused — like claude.ai — so I trust the tool with important research work

## Technical Architecture

### Stack (additions/changes from v1)
- **LLM**: OpenAI `o3` — model name isolated in `lib/config/models.ts`
- **Generation**: Two-pass pipeline — Pass 1: paper analysis (structure, math, algorithm); Pass 2: notebook generation with analysis as context
- **Streaming**: Server-Sent Events (SSE) from `/api/generate` → real-time status to processing page
- **UI theme**: Matches claude.ai exactly — see Design Tokens section below
- **Output path**: `projectimplementation/output/<jobId>/notebook.ipynb`

### Two-Pass o3 Pipeline
```
Pass 1 — Paper Analysis (o3)
  Input: raw PDF text
  Output JSON:
  {
    title, authors, venue, year,
    abstract,
    contributions: string[],
    algorithms: [{ name, pseudocode, complexity }],
    equations: [{ label, latex, description }],
    datasets: [{ name, size, features, distribution }],
    experiments: [{ name, metric, baseline, result }],
    figures: [{ number, description, type }]
  }

Pass 2 — Notebook Generation (o3)
  Input: Pass 1 JSON + system prompt specifying 10-section structure
  Output: nbformat v4 JSON (cells array)
  Constraint: all code must be self-contained and runnable
```

### Notebook Quality Requirements (enforced via prompt)
```
Section 1 — Paper Summary
  - Title, authors, venue in styled markdown
  - 2-paragraph abstract with key insight highlighted

Section 2 — Core Contributions
  - ≥3 bulleted contributions with 1-sentence elaboration each

Section 3 — Mathematical Foundations
  - All equations from Pass 1 analysis, rendered in LaTeX
  - Each equation has: symbol table, derivation note, intuition explanation

Section 4 — Algorithm Walkthrough
  - Pseudocode in a code cell (commented)
  - Complexity analysis: time, space
  - Edge cases and failure modes

Section 5 — Synthetic Data Generation (CRITICAL)
  - Data must match paper's domain (vision: [N, C, H, W] tensors; NLP: [B, T] token sequences)
  - Statistical properties from paper (e.g. class imbalance ratios, vocabulary distributions)
  - Scale: N ≥ 10,000 samples minimum; no toy 10-sample arrays
  - Seed set for reproducibility

Section 6 — Core Implementation
  - Full implementation, not pseudocode
  - Inline comments on every non-trivial line explaining *why*, not *what*
  - Type annotations on all functions
  - Modular: each component in its own function/class

Section 7 — Training / Optimization Loop
  - Full training loop with loss tracking
  - Gradient clipping, LR scheduling if paper uses it
  - Progress bar via `tqdm`

Section 8 — Experiments & Ablations
  - Reproduce ≥2 rows from the paper's main results table
  - DataFrame showing metric comparisons
  - Statistical significance note

Section 9 — Visualization
  - ≥3 plots matching paper figures (use matplotlib/seaborn)
  - Loss curves, attention maps, embedding spaces, etc. as appropriate
  - All figures have titles, axis labels, legends

Section 10 — Discussion, Limitations & Next Steps
  - What the paper doesn't address
  - Known failure modes of the implementation
  - Suggested experiments for further research
```

### Design System (claude.ai-inspired)
```
Colors:
  --bg-primary:     #0d1117   (near-black, GitHub dark)
  --bg-card:        #161b22   (slightly lighter)
  --bg-elevated:    #1c2128
  --accent-coral:   #e8705a   (claude.ai primary CTA)
  --accent-purple:  #8b5cf6
  --text-primary:   #e6edf3
  --text-muted:     #7d8590
  --border:         #30363d

Typography:
  font-family: 'Geist Sans', system-ui, sans-serif
  heading: font-weight 600, letter-spacing -0.02em
  body: font-weight 400, line-height 1.6

Animations:
  - Upload drag zone: glow pulse on hover
  - Processing steps: fade-in sequentially with 400ms stagger
  - Progress indicator: animated gradient bar (not spinner)
  - Result page: slide-up reveal on mount

Components (shadcn/ui base + custom):
  - <ApiKeyInput>: masked field with eye-toggle, validation indicator
  - <PdfDropzone>: dashed border → solid on hover, file name on drop
  - <ProgressFeed>: streaming step list, each step has icon + status dot
  - <NotebookCard>: result summary card (title, sections, estimated cells)
  - <ActionButtons>: Download + Open in Colab side-by-side
```

### SSE Streaming Architecture
```
POST /api/generate
  → returns { jobId } immediately (< 500ms)
  → begins async pipeline in background

GET /api/stream/:jobId  (SSE endpoint)
  → emits events as pipeline progresses:
    { event: "status", data: "Parsing PDF structure..." }
    { event: "status", data: "Identifying core algorithms (Pass 1)..." }
    { event: "status", data: "Extracting 4 equations..." }
    { event: "status", data: "Generating synthetic data plan..." }
    { event: "status", data: "Writing notebook sections (Pass 2)..." }
    { event: "status", data: "Assembling 47 cells..." }
    { event: "complete", data: { downloadUrl, notebookMeta } }
    { event: "error", data: { message } }

Processing page:
  → opens EventSource to /api/stream/:jobId
  → appends each status message to <ProgressFeed>
  → on "complete": redirects to /result
  → on "error": shows error state with retry option
```

### Component Diagram (updated)
```
Browser
  │
  ├── / (Landing)
  │     ├── Hero: "Turn any research paper into a runnable notebook"
  │     ├── <ApiKeyInput> (masked, with validation)
  │     └── <PdfDropzone> → POST /api/generate → redirect /processing
  │
  ├── /processing?jobId=...
  │     ├── Animated gradient progress bar
  │     └── <ProgressFeed> ← SSE from GET /api/stream/:jobId
  │
  └── /result?jobId=...
        ├── <NotebookCard> (title, sections count, estimated run time)
        ├── <DownloadButton> → GET /api/download/:jobId
        └── <ColabButton> → POST /api/colab/:jobId → Gist URL → new tab

Server
  │
  ├── POST /api/generate         → start pipeline, return jobId
  ├── GET  /api/stream/:jobId    → SSE stream of pipeline progress
  ├── GET  /api/download/:jobId  → serve .ipynb file
  └── POST /api/colab/:jobId     → create Gist, return Colab URL
```

## Out of Scope (v3+)
- User authentication and accounts
- Usage tracking and rate limiting
- Job history and notebook library
- Multiple concurrent jobs per session
- Custom notebook section templates
- Fine-tuned or locally hosted models
- Batch PDF processing

## Dependencies
- Sprint v1: core architecture, project scaffolding, basic pipeline
- OpenAI API key provided by user at runtime (never stored)
- Anonymous GitHub Gist API (no token needed for public gists)
- `GITHUB_TOKEN` env var optional for higher Gist rate limits
