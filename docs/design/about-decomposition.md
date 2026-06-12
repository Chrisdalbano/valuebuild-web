# About route decomposition — Phase 2d spec

**Status:** IMPLEMENTED · 2026-06-12 · Phase 2 of `docs/UI-MIGRATION-INSPIRA-ATOMIC.md`
**Contract:** `AboutSection.vue` (1,663 LOC) → `organisms/AboutSection.vue` + molecules below. Route contract unchanged: no props, no emits — router import path is the only consumer change. Static marketing/docs page; pixel-identical, structure only.

## Component map

```
organisms/AboutSection.vue          route shell: splash + metadata fetch, section composition
├─ molecules/AboutHero.vue          full-viewport champion-splash hero (prop: splash),
│                                   badge, title, stat pills, "Compare Items" CTA
├─ molecules/AboutFeatureGrid.vue   "Built for Players" 5-card feature grid (3-2 centered layout)
├─ molecules/AboutTechStack.vue     architecture layers (frontend/backend/db badges, dividers)
│                                   + Render/Netlify/Mongo deployment cards
├─ molecules/AboutFormulaSection.vue  gold-efficiency explainer: formula box, Infinity Edge
│  │                                  worked example, caveat note
│  └─ molecules/AboutStatValuesTable.vue  sticky base-stat gold-value table (right column)
├─ molecules/AboutShowcase.vue      "Project Highlights" 01/02/03 cards
└─ molecules/AboutCta.vue           footer CTA + last-update pill (prop: lastUpdate,
                                    owns formatLastUpdate) + Riot disclaimer
```

Logic: none worth extracting — the page is static apart from `useChampionSplash()` (existing, reused) and a one-shot `/api/metadata` fetch.

## Deliberate changes (non-silent)

1. **Metadata fetch switched to the shared `itemsApi.getMetadata()`** (`src/api/items.js`) instead of a duplicated `axios` + `API_BASE_URL` pair inside the component. Same endpoint, same `data.lastUpdate` read (kept verbatim even though the api-layer docs say `lastUpdated` — if that key never matches, the pill simply stays hidden exactly as before). Only the console error message changes.
2. **Dead "Legacy styles for compatibility" block dropped (~350 LOC).** It styled classes absent from the template (`.about-section`, `.info-card`, `.rating-list`, `.eff-*`, `.tips-grid`, `.steps-grid`, `.tech-details`, …). One exception mattered: its duplicate `.disclaimer` rule *won the cascade* over the active one (margin 1rem, padding 1rem, `rgba(255,255,255,0.02)` wash, `--radius-sm`, line-height 1.5) while the earlier rule's border survived. AboutCta ports the **merged computed style**, commented, so the render is unchanged.
3. **Legacy raw colors kept verbatim** (commented per file): the `rgba(10,13,20,…)` hero fade, dark-gold `rgba(193,131,28,…)` glows + `rgb(220,148,21)` gradient stop (NOT the tokenized gold `rgb(240,168,41)` — different hue, so no `color-mix` mapping), `whitesmoke` title, feedback-ish `rgba(234,179,8|59,130,246|168,85,247|34,197,94|239,68,68, …)` tints (incl. inline feature-icon styles), `#00ED64` Mongo leaf, white-alpha glass pills.
4. **Shared section CSS duplicated per molecule.** The monolith's grouped selectors (`.section-features, .section-tech, … { padding }`, `.section-header`) can't cross scoped-style boundaries, so each section molecule carries its copy — same rendered values.
5. **Kept verbatim:** the `.showcase-number` duplicate `display` declaration (inline-block then flex; flex wins), the hardcoded DDragon `15.1.1` Infinity Edge icon, CommunityDragon/GitHub/Netlify hotlinked logos, and the copy itself (incl. the "Item Gap." subtitle).

## Done when

`/about` renders pixel-identical (hero splash persists per session, last-update pill behavior unchanged), every new file ≤200 LOC, `components/AboutSection.vue` deleted, router points at the organism, build green.
