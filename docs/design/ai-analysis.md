# Gemini AI analysis system — Phase B spec

**Status:** SHIPPED (frontend + backend wiring) · 2026-06-13
**Plan:** `~/.claude/plans/...` (research revamp + AI). Decisions: curated subset (~80 items/patch) ·
keep efficiency pure (AI estimates separate + labeled speculative) · key server-side only.

## Architecture

Gemini runs **server-side only**; the public SPA never holds the key. Results are precomputed and
cached in Mongo (`ai_analysis` collection), served from cache, patch-gated.

```
weekly ETL (or POST /api/ai/refresh)
  → ai.enrich.run_ai_enrichment
      → select_curated_items (~80 legendary/epic items with <passive>/<active>)
      → per item: build_effect_prompt (grounded in efficiency.py STAT_VALUES) → Gemini → ai_analysis doc
      → build_digest_prompt → Gemini → {_id:'research_digest'} doc
GET /api/items/{id}/ai   → cached per-item analysis  (patch-gated → 'pending')
GET /api/research        → cached patch digest       (patch-gated → 'pending')
POST /api/ai/refresh     → BackgroundTasks enrichment (no-op if key unset)
```

Backend: `backend/ai/{gemini_client,prompts,enrich}.py` (B1). `gemini_client` returns None on ANY
failure (never logs the key). Enrichment is resumable (skips items already done for the patch) and
throttled (`AI_CALL_DELAY_SECONDS`, default 4s ≈ 15 RPM). Chained after the weekly ETL, guarded so AI
failures never break item data.

## Frontend surfaces (B2/B3)

- **Per-item** (`molecules/AiEffectPanel.vue` in `ItemBreakdownModal`): the effect→base-stat→gold
  "map" per effect, reasoning, confidence, summary + caveats, under a "SPECULATIVE ESTIMATE · NOT THE
  EFFICIENCY NUMBER" header. `atoms/AiBadge.vue` is azure + "AI est." — never mistakable for the gold
  efficiency. Lazy via `useAiAnalysis`; graceful pending/empty/error.
- **`/research`** (`organisms/ResearchBoard.vue` + `Research*` molecules): mispriced-items (green
  undervalued / red overvalued), effect spotlights, experimental builds (→ `/builds?b=…`). Prominent
  "AI-generated hypotheses, not ground truth" banner. `useResearch`; pending state until enrichment.
- **Modal reconnected**: a shared `useItemDetail` store + "full breakdown" buttons on `ItemCard`/
  `ItemRow` (the modal had been orphaned since the Phase 2 decomposition).

## Data honesty

The canonical gold-efficiency % stays formula-only everywhere. AI estimates are always visually
distinct (azure, never gold), textually labeled speculative, and never blended into efficiency.

## Operational prerequisites (outside this repo)

1. Set `GEMINI_API_KEY` in the Render dashboard (`backend/.env` for local). **AI surfaces serve
   'pending' until then.**
2. **The key Christian provided authenticates but its AI Studio project returns 429
   RESOURCE_EXHAUSTED (prepay credits depleted)** — restore credits (or use a key with quota), then
   `POST /api/ai/refresh` once. Rotate the shared key.

## Verification

`scripts/ai-smoke.mjs` (8 checks: modal entry points, speculative labeling, graceful pending,
route-mocked ready-state effect map, /research pending + ready, "Try this build" link) +
`nav-smoke.mjs` (20 tab sequences incl. /research). Backend logic validated with a mocked client
(curated selection, grounded prompts, resumable enrichment, digest shape) — no credits spent.
