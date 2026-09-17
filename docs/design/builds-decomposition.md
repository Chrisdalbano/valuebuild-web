# Builds route decomposition — Phase 2c spec

**Status:** IMPLEMENTED · 2026-06-12 · Phase 2 of `docs/UI-MIGRATION-INSPIRA-ATOMIC.md`
**Contract:** `BuildOptimizer.vue` (1,463 LOC) → `organisms/BuildBoard.vue` + molecules below. Route contract unchanged: props `{ items, compareItems, goldIconUrl }`, `v-model:current-build`, emits `browse-items`.

## Component map

```
organisms/BuildBoard.vue        route shell: header, slots grid, quick actions,
│                               analysis composition, suggestions, empty state
├─ molecules/BuildRolePicker.vue   "Build Type" role buttons (v-model)
├─ molecules/BuildSlot.vue         one of six slots (filled/empty, remove)
│  └─ molecules/BuildSlotTooltip.vue  hover tooltip (cost, eff, stats, effects)
├─ molecules/BuildStatsCard.vue    totals/net-gain/avg-efficiency grid
├─ molecules/CombinedStatsCard.vue summed stat list
├─ molecules/BuildInsightsCard.vue recommendation + synergies
└─ molecules/SuggestionCard.vue    smart-suggestion unit (reason, add button)
```

Logic extraction: `composables/useBuildStats.js` (totals, combined stats, recommendation, synergies), `composables/useBuildSuggestions.js` (role-filtered suggestions + reasons + subtitle).

## Deliberate changes (non-silent)

1. **Efficiency verdicts unified onto EfficiencyBadge.** The legacy file used its own thresholds (110/100/90 vs the app-wide 120/100/80) and legacy feedback colors (`--success/--info/--warning/--error`). Items at 110–119% now read "Good" (blue) instead of green, and 80–89% read "Fair" (amber) instead of red. This is the point of THE signature atom — one verdict system.
2. **Stat formatters switched to the shared `api/items.js` versions.** The local copies had drifted: `FlatCritChanceMod` rendered as a raw decimal (e.g. `0.2`) instead of `20.0%`, and regen stats fell back to raw keys. Shared versions fix both.
3. **Dead code dropped:** `metaBuilds`/`loadMetaBuild`/`metaBuildsTemplate` + ~105 lines of `.meta-build-*` CSS were never referenced by the template.
4. **Slot tooltip centering fixed.** The legacy hover rule overwrote the tooltip's `transform` with `translateY(0)` only, dropping `translateX(-50%)` — the tooltip jumped half its width to the right on reveal. The port keeps the centering.
5. **Kept verbatim:** the hardcoded DDragon `14.20.1` image URLs (slots/tooltips/suggestions). They're stale (explorer uses 15.19.1) and likely 404 for newer items — flagged for a follow-up fix, but swapping patches changes rendered icons, which is out of scope for a structure-only pass. Centralized in one constant in BuildBoard's children via `BUILD_IMG` helper in `utils/itemHelpers.js`.

## Done when

`/builds` renders pixel-near-identical (modulo §1/§2 above), every new file ≤200 LOC, `BuildOptimizer.vue` deleted, build green, smoke checks pass.
