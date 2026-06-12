# BuildValue design tokens — Phase 1 spec

**Status:** IMPLEMENTED (Phase 1 of `docs/UI-MIGRATION-INSPIRA-ATOMIC.md`) · 2026-06-11
**Files:** `gold-league/src/assets/css/tokens.css` (layers 1–2 + motion), `gold-league/src/style.css` (Tailwind entry + `@theme` map + legacy aliases)

Three layers: **primitives** (raw oklch values, never consumed by components) → **semantic** (what components consume) → **component** (`--btn-*`, `--card-*`, … added as components are built in Phase 2+). Every oklch value below is an exact round-trip-verified conversion of the legacy rgb value, so Phase 1 is pixel-identical by construction.

## Layer 1 — primitives (`--p-*`)

| Token | Value | Source |
|---|---|---|
| `--p-gold-400` | `oklch(0.8419 0.1439 75.53)` | derived hover step (+L) |
| `--p-gold-500` | `oklch(0.7819 0.1539 75.53)` | = legacy `rgb(240,168,41)` |
| `--p-gold-600` | `oklch(0.7019 0.1539 75.53)` | derived press step (−L) |
| `--p-gold-tint` | gold-500 @ 12% alpha | derived |
| `--p-rust-400/500/600/tint` | `0.5309 / 0.4609 / 0.4009 · 0.0992 28.88` | 500 = legacy `rgb(135,64,55)` |
| `--p-azure-400/500/600/tint` | `0.80 / 0.75 / 0.67 · 0.10 230` | NEW cool support accent (AP/magic data, info, chart contrast) |
| `--p-neutral-950…50` | exact conversions of the existing zinc-ish ramp | see table below |
| `--p-feedback-success/warning/error/info` | exact conversions of current values | unchanged |

Neutral ramp (steps named by depth; all exact conversions):

| Step | Legacy rgb | oklch |
|---|---|---|
| 950 | 12,12,14 (`--bg-primary`) | `oklch(0.1553 0.0042 285.90)` |
| 925 | 18,18,20 (`--bg-secondary`) | `oklch(0.1831 0.0040 285.99)` |
| 900 | 24,24,27 (`--bg-tertiary`) | `oklch(0.2103 0.0059 285.89)` |
| 850 | 32,32,36 (`--bg-hover`) | `oklch(0.2452 0.0075 285.83)` |
| 800 | 39,39,42 (`--border-primary`) | `oklch(0.2739 0.0055 286.03)` |
| 700 | 63,63,70 (`--border-secondary`) | `oklch(0.3703 0.0119 285.81)` |
| 550 | 100,100,108 (`--slate`) | `oklch(0.5060 0.0125 285.94)` |
| 500 | 113,113,122 (`--text-tertiary`) | `oklch(0.5517 0.0138 285.94)` |
| 400 | 161,161,170 (`--text-secondary`) | `oklch(0.7118 0.0129 286.07)` |
| 50 | 250,250,250 (`--text-primary`) | `oklch(0.9851 0 89.88)` |

## Layer 2 — semantic (what components consume)

| Token | → primitive | Role |
|---|---|---|
| `--bg-canvas` | neutral-950 | page background |
| `--bg-surface` | neutral-925 | cards, panels |
| `--bg-elevated` | neutral-900 | raised surfaces, inputs |
| `--bg-overlay` | neutral-850 | hover surfaces, scrims |
| `--border` / `--border-strong` | neutral-800 / 700 | dividers / emphasized |
| `--fg-primary` / `--fg-secondary` / `--fg-muted` | neutral-50 / 400 / 500 | text. **muted is canvas-only (AA rule)** |
| `--accent-lead(-hover/-press/-tint/-foreground)` | gold-500/400/600/tint, fg = neutral-950 | THE brand accent |
| `--accent-support(-tint)` | azure-500/tint | cool counter-accent |
| `--eff-positive` | `oklch(0.6959 0.1491 162.48)` (= current `#10b981`) | efficiency ≥ threshold |
| `--eff-neutral` | `oklch(0.7686 0.1647 70.08)` (= current `#f59e0b`) | mid efficiency |
| `--eff-negative` | `oklch(0.6368 0.2078 25.33)` (= current `#ef4444`) | poor efficiency |
| `--fb-success/-warning/-error/-info` | feedback primitives | status |

Note: the current 4-tier display (excellent/good/fair/poor with blue `#3b82f6` for "good") stays hardcoded inside the monoliths until Phase 2 decomposes them; `EfficiencyBadge` will collapse onto the 3 `--eff-*` tokens (the blue tier maps to `--accent-support` territory — decide at EfficiencyBadge spec time).

## Motion tokens + reduced-motion guard

`--dur-instant: 75ms` · `--dur-fast: 150ms` · `--dur-base: 250ms` · `--dur-slow: 400ms`
`--ease-standard: cubic-bezier(0.2, 0, 0, 1)` · `--ease-exit: cubic-bezier(0.4, 0, 1, 1)`

Global guard in `tokens.css`: `@media (prefers-reduced-motion: reduce)` collapses all animation/transition durations to 0.01ms. Component-level motion (motion-v) must ALSO branch per the plan's ground rules — the guard is the backstop, not the strategy.

## Tailwind `@theme` mapping

Only **semantic** tokens are mapped (via `@theme inline` in `style.css`) — primitives are unreachable from utilities by design:
`bg-canvas/surface/elevated/overlay`, `border-border(-strong)`, `text-fg-primary/secondary/muted`, `*-accent(-hover/-press/-tint/-foreground)`, `*-support(-tint)`, `*-eff-positive/neutral/negative`, `*-success/warning/error/info`, `ease-standard/exit`.

## Legacy aliases (transitional — delete with Phase 2)

Every pre-existing `:root` var in `style.css` now resolves through the token layer: `--gold`→`--accent-lead`, `--bg-primary`→`--bg-canvas`, `--bg-secondary`→`--bg-surface`, `--bg-tertiary`→`--bg-elevated`, `--bg-hover`→`--bg-overlay`, `--border-primary/secondary`→`--border(-strong)`, `--text-primary/secondary/tertiary`→`--fg-primary/secondary/muted`, `--success/warning/error/info`→`--fb-*`, `--rust`→`--p-rust-500`, `--slate`→`--p-neutral-550` (rust/slate get semantic slots when first consumed post-migration). Shadows/radii stay as-is in `style.css` for now.

## Deliberate Phase 1 deferrals

1. **Tailwind preflight is NOT imported** (`theme.css` + `utilities.css` only). Preflight would reset headings/lists/buttons and break pixel-identity. Adopt it (or scoped fixes) in Phase 2/3 when visual churn is intentional and QA'd.
2. **Neutral "warming" toward gold hue (~80, chroma ≤0.01) is deferred** for the same reason — the plan describes it, but Phase 1's gate is pixel-identical. It's a 10-line primitive edit whenever a visual phase wants it.
3. `src/app-styles.css` is imported nowhere (dead file) — left untouched; delete during Phase 2.
4. Component tokens (layer 3) intentionally empty until atoms exist.
