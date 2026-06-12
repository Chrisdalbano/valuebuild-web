# Phase 4 — feature roadmap (frontend-only slice)

**Status:** IN PROGRESS · 2026-06-12 · Phase 4 of `docs/UI-MIGRATION-INSPIRA-ATOMIC.md`
**Scope note:** backend/DB work is deferred per Christian (2026-06-12), so this slice ships the
zero-backend features: shareable builds (§4.1), budget optimizer (§4.3 in plan), PWA (§4.7), CI
hardening (§4.8, frontend smoke only). Deferred until the backend session: patch-diff (§4.2,
needs snapshot collection + endpoint), champion context (§4.4, needs a data-honesty design — a
client-side reweighting of efficiency must be clearly labeled derived, ideally computed by
efficiency.py), high-elo insights (§4.5, needs a data source decision), virtual scrolling (§4.6,
gated on measured jank — none observed at 215 items).

## 4.1 Shareable builds

The 6-item build serializes into the URL: `/builds?b=3071,3153,...`.
- BuildBoard hydrates `currentBuild` from `?b=` once items are loaded (invalid/unknown ids
  silently dropped, max 6, deduped).
- Build changes sync back via `router.replace` (no history spam); clearing the build clears `?b=`.
- "Share build" button (visible when build non-empty) copies the canonical URL via
  `navigator.clipboard`, with a "Copied!" confirmation state. No backend, no OG tags (SPA).

## 4.2 Budget optimizer

"Best build under N gold" — exact 0/1 knapsack, client-side (≤215 items × ≤6 slots × budget/25
steps; milliseconds at this size):
- maximizes **total gold value** (the backend-computed `totalGoldValue` — we only sum backend
  numbers, never invent them) subject to `Σcost ≤ budget` and ≤6 items, each item once.
- candidate pool = completed items (nothing that builds `into` something), with stats, cost > 0,
  not deprecated; respects the BuildBoard role filter.
- UI: budget input (default 15,000g) + "Optimize" in a panel on /builds; replaces the current
  build (explicitly labeled). Composable: `useBudgetOptimizer.js`.

## 4.3 PWA + offline

- `vite-plugin-pwa` (autoUpdate): precached app shell, runtime caching for `/api/items` +
  `/api/metadata` (StaleWhileRevalidate — instant loads from the last snapshot, refreshed in
  background) and DDragon/CDragon images (CacheFirst, 7d, capped entries).
- Manifest: BuildValue, dark theme color from tokens, 192/512 maskable icons (generated gold
  "BV" monogram, committed under public/icons/).

## 4.4 CI hardening (frontend)

`.github/workflows/deploy.yml` grows a smoke job: build against the prod API, `vite preview`,
run all four smoke suites (explorer/compare/builds/hovercard) with the runner's Chrome
(`CHROME_PATH=/usr/bin/google-chrome`). PRs and pushes to main must pass real user flows, not
just a compile. Backend pytest deferred with the rest of the backend work.

## Done when

Each feature lands as its own commit, smoke suites stay green (share/optimizer get their own
checks), promoted to main at the end of the slice.
