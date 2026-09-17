# Compare route decomposition — Phase 2b spec

**Status:** IMPLEMENTED · 2026-06-12 · Phase 2 of `docs/UI-MIGRATION-INSPIRA-ATOMIC.md`
**Contract:** `ItemCompare.vue` (2,818 LOC) → `organisms/CompareBoard.vue` + molecules below. Route props/emits unchanged: props `{ items, allItems }`, emits `clear`, `removeItem(item)`, `swapItem(old, new)`, `addItem(item)` — App.vue untouched. (Legacy emits `viewDetailed`/`addMore`/`browseItems` were declared but never fired from the template; dropped.)

## Component map

```
organisms/CompareBoard.vue          route shell: header, layout, carousel, swap-modal wiring
├─ molecules/CompareEmptyState.vue  0-item state (features strip, browse CTA → full reload "/", legacy behavior)
├─ molecules/CompareSingleItemNotice.vue  1-item dashed notice + "Add Another Item"
├─ molecules/CompareInsightsPanel.vue     insights grid shell
│  ├─ molecules/WinnerCard.vue            most-efficient item + gap vs runner-up
│  ├─ molecules/EffBarsCard.vue           normalized efficiency bars
│  ├─ molecules/GoldAnalysisCard.vue      totals / net gain rows
│  └─ molecules/ComplexityCard.vue        build-complexity counters
├─ molecules/CompareCharts.vue      3 Chart.js canvases (logic: composables/useCompareCharts.js)
├─ molecules/CompareItemCard.vue    per-item detail column
│  ├─ molecules/RecipeSection.vue   build path + nested recipe tooltip + cost summary
│  └─ molecules/StatBreakdownBars.vue     per-stat gold bars (utils/statIcons)
├─ molecules/AddItemCard.vue        dashed "add another" grid card (2–5 items, desktop)
├─ molecules/CompareAnalysisPanel.vue     recommendation text + range stats
└─ molecules/SwapItemModal.vue      teleported search modal (add or swap mode)
```

Logic extraction: `composables/useCompareInsights.js` (winner/gap/totals/complexity/ranges/recommendation computeds), `composables/useCompareCharts.js` (chart create/destroy/watch; Chart.js registration). `utils/itemHelpers.js` gains `getComponents/getComponentsCost/getCombineCost` (recipe lookups vs `allItems`) and `formatRiotDescription` (the v-html formatter — trusted DDragon data, scripts stripped, unchanged logic).

`EfficiencyBadge` grows compare's display needs: `variant: 'label'` (colored verdict word, no pill), `decimals`, `prefix`, `suffix` props. Reused: `GoldValue`.

## Deliberate changes (non-silent)

1. **Verdict-green unified.** ItemCompare hardcoded `#22c55e` for "excellent" while the explorer used `#10b981`; both now resolve to `--eff-positive` (`#10b981`) via EfficiencyBadge. Side-by-side delta is sub-perceptual; one verdict system is the point of the atom.
2. Image-error behavior here is the legacy grey-placeholder swap (`imgPlaceholderOnError` util), NOT ItemIcon's CDragon-fallback chain — compare never filtered failed items; kept faithful.
3. Chart.js config colors stay as raw values in `useCompareCharts.js` — they're data-viz JS, not CSS; tokenizing charts is an explicit Phase 3 item (plan §3.5).
4. Mobile carousel `.detail-card` flex sizing lives in CompareBoard's scoped CSS (parent scope reaches child component root), since it's a layout concern of the carousel container.

## Done when

`/compare` renders pixel-near-identical for 0/1/2+ item states, every new file ≤200 LOC, `ItemCompare.vue` + `ItemChart.vue` (orphaned) deleted, build green, smoke checks pass.
