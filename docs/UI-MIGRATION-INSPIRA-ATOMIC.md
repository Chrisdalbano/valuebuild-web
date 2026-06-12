# BuildValue UI Migration — Inspira UI + Atomic Architecture

**Status:** PLANNED · authored 2026-06-11 · owner: Christian (+ Claude under CLAUDE.md standing authorization)
**Goal:** take BuildValue from "functional dark dashboard" to a genuinely impressive product UI — token-driven design system, atomic component architecture, Inspira-UI-grade motion — without a framework rewrite and without ever breaking the live site.

The identity stays: **gold on near-black**. League players read gold as value; the entire app is about gold. We are not rebranding; we are giving the existing brand a real system.

---

## 0. Ground rules (binding for every phase)

- Vue 3 + Vite SPA stays. No Nuxt, no SSR. Inspira UI components are copy-paste Vue + Tailwind + motion-v — they fit this stack natively.
- Ship behind the existing routes; every phase ends deployable. No long-lived broken branch: each phase merges to `development` green, promotes to `main` when verified.
- **Tokens, not hex.** After Phase 1 lands, a raw color in a component is a review-blocker.
- **≤200 LOC per component** (hard cap), one component per file. The current monoliths get decomposed as they're touched, never extended.
- **Every animation has a reduced-motion branch.** Motion is motion-v only; transform/opacity only; loops pause off-screen (IntersectionObserver) and tab-hidden.
- Efficiency data stays backend-sourced. The UI never invents or caches numbers the API didn't return.
- Verification per phase: `npm run build` green + headless screenshot QA of the touched screens + a manual pass of the live preview before `main`.

---

## Phase 1 — Foundation: Tailwind v4 + design tokens (1 session)

**Install:** `tailwindcss@^4` + `@tailwindcss/vite`, `motion-v`, `clsx`, `tailwind-merge`, `class-variance-authority` (the Inspira UI prerequisite set). Add the Vite plugin; create `src/assets/css/tokens.css` + keep `style.css` as the import shell during transition.

**Three-layer token system** (primitives → semantic → component), porting the current palette into oklch and giving it real range:

```
Layer 1 primitives (never consumed by components):
  --p-gold-400/500/600 + tint     from rgb(240,168,41) → oklch ramp (hover/base/press/12% tint)
  --p-rust-400/500/600 + tint     from rgb(135,64,55) — the secondary/danger-adjacent warm
  --p-azure-400/500/600 + tint    NEW support accent (cool counter to gold — for "magic/AP"
                                  data, info states, and chart contrast; pick ~oklch(0.75 0.10 230))
  --p-neutral-950…100             from the existing rgb(12,12,14)→rgb(250,250,250) ramp,
                                  warmed very slightly toward gold (hue ~75–85, chroma ≤0.01)
  feedback: success/warn/error    keep current values, tokenized

Layer 2 semantic (what components consume):
  --bg-canvas / --bg-surface / --bg-elevated / --bg-overlay
  --border / --border-strong
  --fg-primary / --fg-secondary / --fg-muted   (muted = canvas-only, AA rule)
  --accent-lead(-hover/-press/-tint/-foreground) = gold
  --accent-support(-tint) = azure
  --eff-positive / --eff-neutral / --eff-negative   (efficiency verdict colors — the app's
                                                     core semantic: ≥100% gold-positive, etc.)

Layer 3 component: --btn-*, --card-*, --pill-*, --tray-*, --bar-* as they're built.
```

Map ONLY semantic+component tokens into Tailwind's `@theme` (primitives stay unreachable from utilities). Add duration/easing tokens (`--dur-instant/fast/base/slow`, standard/exit easings) and the global reduced-motion guard in CSS.

**Deliverable:** tokens live, `style.css` legacy vars aliased to the new semantic tokens (so nothing visually changes yet), build green, deployed. Zero-risk phase.

**Done when:** every legacy `--gold`/`--bg-primary`-style var resolves through the new layer; site pixel-identical.

## Phase 2 — Atomic decomposition (2–3 sessions, the structural one)

Restructure `src/components/` into `atoms/ molecules/ organisms/` and decompose the monoliths. Target map (current ~11.5k LOC across 11 files → ~30 focused components):

**Atoms** (token-only, no business logic):
`BaseButton` (primary/ghost/icon via cva) · `Pill` (stat tags, item categories) · `StatIcon` (wraps utils/statIcons) · `EfficiencyBadge` (the % verdict — color from `--eff-*`, THE signature atom) · `GoldValue` (formatted cost with gold glyph) · `SkeletonMedia` (shimmer placeholder, replaces LoadingSkeleton's per-type sprawl) · `LazyImage` (keep, tokenize) · `Heading/Text` (type scale)

**Molecules** (compose 2–4 atoms):
`ItemCard` (icon + name + cost + EfficiencyBadge; grid unit) · `ItemRow` (table unit) · `StatLine` (icon + label + value + per-gold) · `SearchBar` · `FilterChips` · `CompareTray` (the floating selection tray) · `BuildSlot` (one of six) · `EfficiencyBar` (animated stat-value bar) · `InsightCard` (QuickInsights unit)

**Organisms** (own layout + state wiring):
`ItemExplorer` (grid/table shell + search/filter/sort — the slimmed ItemTable) · `CompareBoard` (column layout of per-item molecules) · `BuildBoard` (6 BuildSlots + totals panel) · `ItemBreakdownModal` (keep modal mechanics, recompose innards) · `NavBar` · `AppFooter` · `QuickInsights`

Method: decompose ONE route per PR (explorer → compare → builds → about), screenshot-QA before/after each. No visual redesign in this phase — structure only, pixel-near-identical. This is also the moment to lift shared state (selected items, build) out of prop-drilling into a tiny composable store (`src/composables/useSelection.js`) — App.vue stops being the state bus.

**Done when:** old monolith files deleted, every component ≤200 LOC, routes render identically, build green.

## Phase 3 — The Inspira pass: make it impressive (2–3 sessions)

Now the payoff. Inspira UI components adapted INTO the token system (copy-paste, retheme, strip what doesn't fit). Targets, in order of visitor impact:

1. **Landing/Explorer hero moment** — the app currently opens cold on a table. Add a compact hero band: app name in display type, one-line value prop, an animated **NumberTicker** rolling the live item count + current patch (from `/api/items/metadata`), over a faint Inspira **Particles/grid** background in gold at very low opacity (paused off-screen, static under reduced motion).
2. **EfficiencyBadge micro-charisma** — count-up on first reveal (NumberTicker logic), color-graded by `--eff-*`. This number is the product; it should feel alive everywhere it appears.
3. **ItemCard hover** — Inspira **Spotlight/Glare card** treatment (pointer-tracked gold sheen) + lift. Cheap, dramatic in a grid of 200 items.
4. **Featured/God-tier items** — **BorderBeam** on the top-N efficiency items in the explorer (a slow gold beam circling the card border). Instant "which items matter" scannability + spectacle.
5. **CompareBoard** — animated **EfficiencyBars** that draw in staggered per column; winner column gets a subtle gold glow. Chart.js panels get token colors + entrance animation.
6. **BuildBoard** — slot-fill animation (item "seats" into the slot with a settle), total-efficiency NumberTicker that re-rolls on every change; budget remaining as an animated bar.
7. **App chrome** — NavBar active-route indicator on a spring; page transitions (fast fade/slide via router transition, instant under reduced motion); scroll-to-top button; themed scrollbar + `::selection` in gold.
8. **Skeletons everywhere data loads** — SkeletonMedia shimmer (gold-tint sweep) for grid, compare, builds; no more layout pop.

Anti-goals: no cursor gimmicks, no WebGL, no marquee-everything. The data IS the show; motion serves scannability.

**Done when:** the explorer/compare/builds screens each have their moments, Lighthouse perf ≥85 mobile, reduced-motion sweep clean.

## Phase 4 — Feature roadmap (the "future features" backlog, one per session)

Ordered by impact-per-effort; each is independently shippable:

1. **Shareable builds** — serialize the 6-item build into the URL (`/builds?b=3071,3153,...`); OG-friendly share. Zero backend work, huge utility.
2. **Patch-diff view** — ETL already stores patch + timestamps: persist the previous patch's snapshot and render "what changed this patch" (new/removed items, efficiency deltas with up/down indicators). This is the feature LoL players return for every two weeks. Backend: one new collection + endpoint.
3. **Budget optimizer** — "best efficiency build under N gold" (greedy/knapsack over cached items, client-side is fine at 200 items); makes BuildOptimizer genuinely smart instead of manual.
4. **Champion context** — weight stat values by champion class (AD/AP/tank presets first, per-champion later via DDragon champion stats): "efficiency for Jinx" vs raw gold math. The analytical flex feature.
5. **High-elo insights** — revive the existing `feature/high-elo-insights` branch concept: most-built items at high MMR vs their efficiency rank (needs a data source decision — Riot match-v5 sampling or third-party dataset; decide before building).
6. **Virtual scrolling** in the explorer (200+ items × spotlight cards = perf risk; `vue-virtual-scroller` or hand-rolled) — gate: only if Phase 3 measurement shows jank.
7. **PWA + offline cache** of the last item snapshot; install prompt. Cheap, impressive.
8. **CI hardening** — real frontend smoke tests (playwright: explorer renders N items, compare flow, build flow) wired into the existing GitHub Action; backend pytest for `efficiency.py` math (golden-file per patch).

## Sequencing + risk

- Phases are strictly ordered 1→2→3; Phase 4 items can interleave after Phase 2.
- Riskiest moment is Phase 2 (structural churn) — mitigated by per-route PRs and screenshot QA. Phase 1 and most of Phase 3 are additive.
- Render free-tier cold starts make the live API feel down (~50s first hit); any demo/judging scenario should warm it first (hit `/api/health`).
- Keep `development` deployable at every commit; promotion to `main` only at phase boundaries (or hotfixes), per CLAUDE.md's verification gate.

## Progress

- [x] Phase 1 — Tailwind v4 + tokens (pixel-identical) — shipped 2026-06-12, spec: `docs/design/tokens.md`
- [x] Phase 2 — atomic decomposition (explorer / compare / builds / about + chrome) — shipped 2026-06-12, specs: `docs/design/*-decomposition.md`
- [ ] Phase 3 — Inspira pass (hero, badges, spotlight cards, border-beam, boards, chrome, skeletons)
- [ ] Phase 4 — features (shareable builds → patch diff → budget optimizer → champion context → …)
