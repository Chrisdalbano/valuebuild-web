# Phase 3 — Inspira pass + visual core fixes

**Status:** SHIPPED · 2026-06-12 · Phase 3 of `docs/UI-MIGRATION-INSPIRA-ATOMIC.md`
**Brief from Christian:** professional, usable, steady UI; fix broken visuals — popups/z-index, non-reused components, icon availability, lazy loading. Item icons become ONE component reused everywhere, able to "extend into" a floating stats card. Full rebuild authority.

## Slice 1 — The item-icon system (the core fix)

**`atoms/ItemIcon.vue` (rebuilt).** The single way an item image renders anywhere in the app:
- Source of truth: `item.imageUrl` (ETL-validated, correct patch — fixes every stale-patch 404; the old hardcoded `14.20.1`/`15.19.1` URLs are gone). Fallback chain: validated URL → CommunityDragon → gold-glyph placeholder. No broken-image squares, ever.
- **Lazy loading: skeleton shimmer → fade-in** (chosen over blur-up: DDragon icons are 64px sprites with no LQIP source; a token-tinted shimmer matches the existing SkeletonMedia language and costs nothing). IntersectionObserver with 200px rootMargin; `loading="lazy"` + `decoding="async"` as backstop.
- Sizes via prop (`sm 32 / md 40 / lg 48 / xl 56 / hero 64+`), square, token border.

**`molecules/ItemStatsCard.vue`.** THE stats card — one shared popover body (icon, name, tier, cost, EfficiencyBadge, per-stat lines, effects text). Replaces the 4 divergent tooltip bodies (ItemTooltip, BuildSlotTooltip, NestedRecipeTooltip, table-row tooltip).

**`molecules/ItemHoverCard.vue`.** The "extend into parent" mechanic: wraps any anchor (default ItemIcon), and on hover (desktop, 150ms intent delay) or tap (mobile, with scrim) floats an ItemStatsCard:
- **Teleported to `<body>` + positioned with `@floating-ui/vue`** (flip + shift + offset, autoUpdate). This kills the entire class of z-index/overflow bugs — the legacy tooltips were absolutely-positioned INSIDE overflow-hidden cards/table rows with `z-index: 99999 !important` wars, so they clipped under sticky headers, modals, and grid edges.
- Motion: motion-v scale/fade entrance (0.96→1, --dur-fast, --ease-standard); instant under reduced motion.
- z-index from the new token scale, NOT magic numbers.

**z-index scale (tokens.css):** `--z-nav: 100 · --z-tray: 90 · --z-popover: 600 · --z-modal: 800 · --z-scrim: 790 · --z-toast: 900`. Every fixed/absolute layer in the app moves onto it; `99999 !important` is banned.

**Rollout:** every item image in the app renders through ItemIcon, and every item icon is hover-card-enabled: explorer grid/table, tray, search suggestions, compare cards + recipes (incl. nested), swap modal rows, build slots + suggestions, flash comparisons, breakdown modal recipe/upgrades. Legacy tooltip CSS deleted.

## Slice 2 — Inspira moments (explorer)

1. **Hero band** above Flash Comparisons: display-type app name + one-line value prop, **NumberTicker** rolling live item count and current patch (from `itemsApi.getMetadata()`), over a low-opacity gold **ParticlesBg** (canvas, paused off-screen via IntersectionObserver + `document.hidden`, static dots under reduced motion).
2. **EfficiencyBadge count-up** on first reveal (IntersectionObserver, once; instant under reduced motion).
3. **ItemCard spotlight** — pointer-tracked gold sheen (CSS vars + radial-gradient overlay, compositor-only) + existing lift.
4. **BorderBeam** on the top-3 efficiency items in the current explorer view (slow gold beam circling the border; hidden under reduced motion).

## Slice 3 — Boards + chrome

- CompareBoard: EffBars draw in staggered (scaleX, per-bar delay); winner insight card gets a soft gold glow.
- BuildBoard: slot-fill "seat + settle" animation (motion-v spring on enter); totals re-roll via NumberTicker.
- NavBar: active-route underline becomes a spring-animated shared indicator.
- Router: fast fade/slide page transitions (`<Transition>`, out-in, --dur-fast; disabled under reduced motion). Gold `::selection`.

## Slice 4 — Retheme + polish + QA

- **Footer + skeletons leave the violet theme** → gold-on-dark per the brand (the violet was an off-palette one-off; `--footer-*` tokens get re-pointed, so it's a token-layer change).
- Density/consistency pass: shared section spacing, consistent card radii/borders.
- QA gate: 24/24 smoke checks, all-route screenshots, reduced-motion sweep (emulate via CDP), build green, then promote.

## Anti-goals (per plan)

No cursor gimmicks, no WebGL, no marquee-everything. Motion serves scannability; the data is the show.
