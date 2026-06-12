# Explorer route decomposition — Phase 2a spec

**Status:** IMPLEMENTED · 2026-06-12 · Phase 2 of `docs/UI-MIGRATION-INSPIRA-ATOMIC.md`
**Contract:** `ItemTable.vue` (2,355 LOC) → `organisms/ItemExplorer.vue` + atoms/molecules below. Pixel-near-identical, structure only. Route props/emits unchanged: props `{ items }`, emits `compare(items[])`, `addToBuild(items[])` — App.vue untouched.

## Component map

```
organisms/ItemExplorer.vue      route shell: owns state, composes everything below
├─ LoadingSkeleton (existing)   while items empty
├─ molecules/CompareTray.vue    floating selection tray (slide-up transition)
│  └─ molecules/TrayItem.vue    icon + name + EfficiencyBadge + remove
├─ molecules/SearchBar.vue      search box + smart-suggestions dropdown (presentational;
│                               suggestion list computed by the organism)
├─ molecules/ViewToggle.vue     grid/table switch (v-model)
├─ molecules/FilterChips.vue    tier chips (v-model, toggle-off on reclick)
├─ molecules/SortControls.vue   sort select + direction button (v-model:key/:dir)
├─ molecules/RoleFilter.vue     role icon buttons (v-model)
├─ molecules/ItemCard.vue       grid unit: ItemIcon, TierPill, checkbox, stats,
│  └─ molecules/ItemTooltip.vue   EfficiencyBadge ×2, hover ItemTooltip
├─ molecules/ItemTableView.vue  table + sortable headers, hosts ItemRow
│  └─ molecules/ItemRow.vue     row unit (ItemIcon, EfficiencyBadge, GoldValue, ItemTooltip)
└─ molecules/PaginationBar.vue  showing-count + page-size select + load-more
```

Atoms: `EfficiencyBadge` (THE signature atom: `value` + `variant: text|rating`; 4 visual tiers — excellent/good/fair/poor at ≥120/≥100/≥80/<80 — colored by `--eff-positive`/`--fb-info`/`--eff-neutral`/`--eff-negative`), `GoldValue` (monospace gold `Ng`), `TierPill` (legendary/epic/component/basic badge), `ItemIcon` (DDragon img → CommunityDragon fallback → emits `failed` so the list filters the item out; replaces the old DOM-poking `handleImageError`).

Logic extraction (no behavior change):
- `composables/useItemFilters.js` — search/tier/role filter + sort + pagination + failed-image set (the old `filtered`/`displayedItems` computeds, filter-reset watchers).
- `composables/useItemSuggestions.js` — stat-keyword → suggestion list.
- `composables/useMediaQuery.js` — `isMobile` (resize listener; default table view on mobile preserved).
- `utils/itemHelpers.js` — `efficiencyTier()`, `itemTier()`, `sanitizeDescription()` (pure functions).

## Token additions (tokens.css)

- New primitive `--p-violet-500: oklch(0.6268 0.2325 303.9)` (= legacy epic `rgb(168,85,247)`).
- New semantic block, item tiers: `--tier-legendary` = gold, `--tier-epic` = violet, `--tier-component` = info-blue, `--tier-basic` = neutral-550 (all exact legacy colors).
- Legacy `rgba(…, α)` colors are reproduced with `color-mix(in srgb, var(--token) N%, transparent)` — srgb keeps the math identical to the old rgba values.

## Deliberate ports of legacy quirks (do not "fix" silently)

1. `.comparison-tray` had `background: var(--bg-secondary), 0.99` — invalid CSS; browsers drop it → actual rendering is **transparent + blur**. Ported as explicit `background: transparent`.
2. The 4-tier efficiency display (incl. blue "good") is kept as-is; collapsing onto the 3 `--eff-*` verdicts is a Phase 3 design decision.
3. Mobile-only tooltip-tap code paths (`tooltip-active`, backdrop) are ported verbatim even though the tap handler was only wired in grid view.

## Done when

Route `/` renders pixel-near-identical (screenshot QA), every new file ≤200 LOC, `ItemTable.vue` deleted, router points at `ItemExplorer`, build green.
