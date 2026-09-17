# Chrome + shared-surface decomposition — Phase 2d spec

**Status:** IMPLEMENTED · 2026-06-12 · final slice of Phase 2 (`docs/UI-MIGRATION-INSPIRA-ATOMIC.md`)
Covers everything outside the four routes: navigation, footer, home insights, the item-breakdown modal, skeletons, and the App shell. (About route: see `docs/design/about-decomposition.md`.)

## Component map

```
App.vue (185 LOC shell: state bus + route wiring only)
├─ organisms/NavBar.vue            + molecules/MobileNavMenu.vue
├─ molecules/AppHeroSplash.vue     champion splash + navy fade
├─ organisms/QuickInsights.vue     + molecules/FlashCompareCard.vue + FlashCompareItem.vue
├─ organisms/ItemBreakdownModal.vue (now owns the overlay; App lost its modal markup)
│  └─ molecules/BreakdownRecipe / BreakdownStatAnalysis / BreakdownUpgrades
├─ molecules/ScrollTopButton.vue
└─ organisms/AppFooter.vue         + molecules/FooterBrand.vue + FooterLinkList.vue
atoms/SkeletonMedia.vue            replaces LoadingSkeleton (grid/table/spinner)
composables: useItems, useRandomComparisons (App stops being a data bus)
api: itemsApi.getMetadata() (GET /api/metadata)
tokens: layer-3 --footer-accent/-bright/-bg/-bg-deep (legacy violet footer theme)
```

## Deliberate changes (non-silent)

1. **Footer metadata fixed (3 stacked bugs).** Legacy Footer fetched `VITE_API_URL` (wrong env name — app uses `VITE_API_BASE_URL`), hit `/api/items/metadata` (doesn't exist — it's `/api/metadata`), and read `lastUpdate` (field is `lastUpdated`). Production footer showed "Fetching…"/"200+" forever. Now via shared `itemsApi.getMetadata()`; verified showing real values.
2. **QuickInsights card-click fixed.** App's `loadRandomComparison` referenced an undefined `activeTab` — clicking a flash-comparison card threw and navigated nowhere. Now `router.push('/compare')`.
3. **Efficiency verdicts unified** onto EfficiencyBadge in QuickInsights and the breakdown modal (each had its own 110/100/90 copy with legacy feedback colors). The modal's unique 6-tier rating *label* and modal-specific item-tier taxonomy are kept verbatim.
4. **Dead code dropped:** `LazyImage.vue` (zero importers), LoadingSkeleton's `compare`/`about` variants (never used), `app-styles.css` (never imported), App.vue's unused champion-splash list/`headerBg`/`refreshItems`/`handleLogoError` + ~200 lines of orphaned CSS (tab-nav, app-header, modal styles), duplicate camelCase event listeners (Vue normalizes case).
5. **Kept verbatim:** stale DDragon image patches (14.20.1 in flash cards via `buildItemImageUrl`), off-palette violet footer/skeleton theme (now layer-3 `--footer-*` tokens, Phase 3 retheme candidate), NavBar's scoped reduced-motion block replaced by the global tokens.css guard (equivalent).

## Done when

All four routes + chrome render correctly (smoke suites pass 24/24), every component ≤200 LOC, all monoliths deleted, `src/components/` contains only `atoms/ molecules/ organisms/`.
