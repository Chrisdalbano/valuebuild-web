# About → research landing — Phase A spec

**Status:** SHIPPED · 2026-06-12 · Phase A of `docs/design/...` (plan: research revamp + AI system)

Reframes `/about` from product/portfolio copy into a **research/studies** narrative — BuildValue as a
living study of what gold buys in League. Frontend-only; no API/contract changes.

## Section flow (organism `organisms/AboutSection.vue`)

1. **AboutHero** — research thesis. Live `NumberTicker` stats (items studied, current patch via
   `itemsApi.getMetadata()`), gradient wordmark, "Browse the Database" CTA.
2. **AboutResearchAreas** (new; replaced `AboutFeatureGrid`) — "What We Study": efficiency baselines ·
   effect valuation · patch deltas · outlier detection · experimental builds. Accent-tinted icons via a
   per-card `--area-tint`; decorative icons hide on error.
3. **AboutFormulaSection** + **AboutStatValuesTable** — "Methodology": the gold-efficiency formula and
   the base-stat gold-value table (mirrors `efficiency.py STAT_VALUES`).
4. **AboutTheGap** (new) — "The Open Problem: Valuing Effects": measurable stats vs unpriced effects
   split; teases the AI work. CTA gated by `researchLive` (false in Phase A → "coming soon"; flip to
   true + add `/research` in Phase B3).
5. **AboutTechStack** — "The Research Pipeline" (badges tokenized to support/eff-positive/violet).
6. **AboutShowcase** — "Engineering the Study".
7. **AboutCta** — research-framed close; Riot disclaimer kept verbatim.

## Conventions

- Every component ≤200 LOC, scoped styles, semantic tokens. Legacy raw rgba tints replaced with
  semantic tokens + `color-mix(... transparent)`; the only raw colors left are the hand-tuned hero
  navy fade and the MongoDB brand leaf (`#00ED64`), both commented.
- Reused atoms: `NumberTicker`. (`ParticlesBg`/`BorderBeam` available but the hero keeps the champion
  splash; particles would over-busy it.)

## Done when

`/about` reads as a research landing, all sections render (screenshot-QA), `nav-smoke` green (About
route + all 12 tab sequences), build green. → promote.
