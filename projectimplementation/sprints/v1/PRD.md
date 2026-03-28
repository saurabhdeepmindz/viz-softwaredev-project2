# Sprint v1 — PRD: Paper2Notebook

## Overview
A web application that takes a research paper PDF as input and generates a production-quality
Google Colab-ready Jupyter notebook (.ipynb) that implements the paper's core algorithms and
methodology as a hands-on tutorial. The user provides their OpenAI API key in the browser on
load; no backend auth is required in v1.

## Goals
- User can enter their OpenAI API key and upload a PDF in a clean web UI
- Backend parses the PDF, calls OpenAI o3 to generate a structured research-grade notebook
- Notebook is saved to `projectimplementation/output/` as a `.ipynb` file
- User can download the `.ipynb` directly from the browser
- "Open in Colab" button opens the notebook in Google Colab via a GitHub Gist URL
- Animated processing screen keeps users engaged during the 30–120s generation wait

## User Stories
- As a researcher, I want to upload a PDF and receive a tutorial notebook, so I can replicate the paper's algorithm without writing boilerplate from scratch
- As a researcher, I want the notebook to use realistic synthetic data, so I can see how the method performs at meaningful scale
- As a researcher, I want to open the notebook directly in Colab, so I can run it immediately without any local setup
- As a user, I want to see live progress messages while waiting, so I know what the system is doing
- As a user, I want a clean, minimal UI, so the tool feels professional and focused

## Technical Architecture

### Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Font & Theme**: Geist font, dark background, purple accent — minimal and focused
- **Backend**: Next.js API routes
- **PDF Parsing**: `pdf-parse` (Node.js) — extracts full text from uploaded PDF
- **LLM**: OpenAI `o3` via `openai` Node SDK — reasoning model for deep paper comprehension
- **Notebook Output**: nbformat v4 JSON, written to `projectimplementation/output/<slug>.ipynb`
- **Colab Integration**: Base64-encode notebook → GitHub Gist (anonymous) → Colab open URL

### Component Diagram
```
Browser
  │
  ├── / (Landing)
  │     ├── ApiKeyInput (masked text field)
  │     └── PdfUpload (drag-drop or click) → POST /api/generate
  │
  ├── /processing?jobId=...
  │     └── ProgressFeed (animated step messages, SSE or polling)
  │
  └── /result?jobId=...
        ├── DownloadButton  →  GET /api/download/:jobId
        └── OpenInColabButton  →  POST /api/colab/:jobId → Gist URL

Server (Next.js API Routes)
  │
  ├── POST /api/generate
  │     ├── receive: apiKey + PDF (multipart)
  │     ├── pdf-parse → extract full text
  │     ├── call o3 with system prompt
  │     └── write projectimplementation/output/<jobId>.ipynb
  │
  ├── GET /api/download/:jobId  →  serve .ipynb as file download
  │
  └── POST /api/colab/:jobId
        ├── read .ipynb
        ├── POST to GitHub Gist API (anonymous)
        └── return colab.research.google.com/gist/... URL
```

### Data Flow
```
PDF Upload
  → pdf-parse (raw text)
  → o3 (structured system prompt: paper analyst + notebook architect)
  → JSON array of notebook cells
  → nbformat v4 assembly
  → projectimplementation/output/<jobId>.ipynb
  → download / Colab via Gist
```

### Generated Notebook Structure
Each notebook produced by o3 must include these sections:

1. **Paper Summary** — title, authors, venue, one-paragraph abstract
2. **Core Contributions** — bulleted list of what the paper introduces
3. **Mathematical Foundations** — all key equations in LaTeX markdown cells
4. **Algorithm Walkthrough** — pseudocode cell + line-by-line explanation
5. **Synthetic Data Generation** — realistic data (correct shapes, distributions, scale)
6. **Core Implementation** — full Python implementation of the algorithm
7. **Experiments & Ablations** — reproduce the paper's key results table
8. **Visualization** — plots that match key figures from the paper
9. **Discussion & Limitations** — what the paper doesn't address
10. **References** — formatted citations

### o3 Prompt Strategy
- Role: "You are a world-class ML research engineer. Generate a complete, runnable Jupyter notebook..."
- Output: strict JSON array of nbformat cells (cell_type, source, metadata)
- Requirements: realistic synthetic data, all imports included, inline comments explaining *why*

## Out of Scope (v2+)
- User authentication / accounts
- Usage tracking and rate limiting
- Persistent job history / dashboard
- Multiple simultaneous jobs
- Custom notebook templates
- Fine-tuned models
- Support for multi-paper batch input

## Dependencies
- None (greenfield project)
- OpenAI API key provided by user at runtime — never stored server-side
- Optional: GitHub token env var for authenticated Gist creation (Colab feature)
