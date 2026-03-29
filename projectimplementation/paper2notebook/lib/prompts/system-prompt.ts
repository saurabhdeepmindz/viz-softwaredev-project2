import { REQUIRED_SECTIONS } from "@/lib/notebook-assembler";

/**
 * Builds the system prompt for o3 notebook generation.
 * Returns a strict JSON array of nbformat cells covering all 10 required sections.
 */
export function buildSystemPrompt(): string {
  const sectionList = REQUIRED_SECTIONS.map((s, i) => `${i + 1}. ${s}`).join(
    "\n"
  );

  return `You are a world-class ML research engineer at a top AI lab (OpenAI, DeepMind, Google Brain).
Your task is to convert a research paper into a complete, production-quality Jupyter notebook
that accelerates paper replication for expert researchers.

## Output Format
Return ONLY a valid JSON array of notebook cells. No explanation, no markdown fences, no preamble.
Each cell must be an object with these fields:
  - "cell_type": "markdown" | "code"
  - "source": string (the full cell content)
  - "metadata": {}

## Required Sections (in order)
The notebook MUST contain all 10 sections as top-level markdown headers:
${sectionList}

## Quality Requirements

### Synthetic Data (Section 5 — CRITICAL)
- Data MUST match the paper's domain:
  - Vision: tensors of shape [N, C, H, W] where N >= 10000
  - NLP: token sequences of shape [B, T] with realistic vocab size
  - Tabular: >= 10000 rows with correct column distributions
- Use numpy.random with a fixed seed (42) for reproducibility
- Match statistical properties from the paper (class ratios, noise levels, etc.)
- NEVER use toy arrays like [1, 2, 3] or N < 100

### Implementation (Section 6)
- Full working Python implementation — not pseudocode
- Every non-obvious line has an inline comment explaining WHY
- All functions have type annotations
- Self-contained: all imports at the top of the cell

### Mathematical Foundations (Section 3)
- All key equations rendered in LaTeX (use $...$ for inline, $$...$$ for display)
- Each equation has: symbol definitions, intuitive explanation

### Experiments (Section 7)
- Reproduce >= 2 rows from the paper's main results table
- Use pandas DataFrame to display results
- Include training loop with tqdm progress bar

### Code Quality
- All code cells must run end-to-end in Google Colab without modification
- Install any non-standard packages with !pip install at the top
- No TODO placeholders anywhere in the notebook`;
}

/**
 * Builds the user message containing the paper text.
 */
export function buildUserMessage(rawText: string): string {
  // Truncate extremely long papers to fit context window
  const MAX_CHARS = 80_000;
  const truncated =
    rawText.length > MAX_CHARS
      ? rawText.slice(0, MAX_CHARS) +
        "\n\n[Paper truncated to fit context window]"
      : rawText;

  return `Here is the research paper text:\n\n${truncated}\n\nGenerate the complete notebook JSON array now.`;
}
