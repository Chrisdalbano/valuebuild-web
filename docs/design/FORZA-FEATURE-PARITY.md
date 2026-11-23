# Forza migration: feature parity repair

Reference: production commit ebb1f49, before the Forza migration. The September 17 rebuild preserved routes and backend endpoints but omitted several application capabilities. The user correctly identified hover previews and diminished AI presentation. Passing the initial tests did not establish feature parity.

## Component boundaries

- ItemPreview accepts an Item and a trigger slot. Reka supplies hover intent, pointer transit, keyboard dismissal, collision handling, and portal positioning; Forza tokens supply the surface. It performs no network requests. Click and touch retain the original inspect action.
- EffectValuation receives one returned effect and displays its estimate, alternative stat equivalents, confidence, and reasoning. ItemAnalysis owns the cancelable request and renders loading, pending, failure, empty, and ready states.
- CatalogTable receives items and selection IDs, emitting inspect, compare, and add actions. ItemExplorer owns filters and view mode.
- ItemSwap receives the item and target selection. Workspace actions replace the ID in place and preserve build undo.
- BuildSuggestions derives candidates from role and existing selection. ComparisonInsights and BuildInsights derive numbers from backend-priced values; they do not generate AI or recalculate item efficiency.
- SavedBuilds owns its rename dialog; the workspace validates and persists the name.

## Source-to-feature check

| Previous capability | Forza repair |
| --- | --- |
| ItemHoverCard / ItemStatsCard | Hover previews across catalog cards/table, build tray/editor, comparison, item sets, suggestions, and swap candidates. Pointer transit, Escape, keyboard focus, and touch inspection checked. |
| AiEffectPanel | Gold estimates, confidence, stat equivalence, each comparison amount and gold value, reasoning, summary, caveats, patch/date. |
| ItemBestOnPanel | Champion names, reasons, confidence, and synergyStat restored; separate missing-estimate message. |
| Dense table and filters | Card/table switch, tier filter, income-item exclusion, stat keyword aliases, expanded tag categories. |
| SwapItemModal | In-place comparison and build swaps, duplicate exclusion, stat/name search; build undo retained. |
| SavedBuildsPanel rename | Rename the existing saved record rather than saving a duplicate. |
| BuildRolePicker / BuildSuggestionsPanel | Role-filtered item suggestions ranked by stat efficiency, excluding current build items. |
| Add Compared Items | Bulk handoff to remaining build slots with a clear limit message. |
| BuildInsightsCard | Gold difference, average purchase, and stat interaction notes. |
| Comparison insights / charts | Cost/value bars, totals, average cost, highest stat efficiency, direct recipe counts, and existing per-stat comparison table. |
| Flash comparisons | Shuffle a three-item sample and open it in the comparison workspace. |

## Deliberate presentation differences

The former Chart.js radar and pie widgets are represented by labeled bars and numeric tables. Explicit pagination replaces infinite scrolling. The current budget planner filters by stat profile; role selection controls the separate suggestion list. Champion portraits are not duplicated in the item estimate list; the names, explanations, and confidence remain available. These are differences, not claims of identical presentation.

## AI availability

Read-only checks on September 17 returned current-patch effect and champion estimates for Bloodthirster, Zhonya's Hourglass, Rabadon's Deathcap, and Blade of the Ruined King. Infinity Edge returned pending with AI configured. No enrichment job was triggered. Missing cached data is displayed explicitly; it is not replaced by a fabricated estimate or mixed into base-stat efficiency.

## Regression coverage

Tests cover hover stability and no AI request on hover; keyboard/Escape; one-tap mobile inspection; effect equivalents, confidence and champion estimates; pending/error/retry/empty states; table/stat search actions; swap/undo; saved rename persistence; role suggestions; comparison-to-build handoff; and populated mobile geometry. The existing seven-route responsive/accessibility checks remain. Production-preview screenshots include actual cached AI, hover, table, and build surfaces.

## November 23, 2026: second repair

A file-by-file audit of `ebb1f49` against the current tree found that the September repair had restored the hover preview and the AI text, but not three larger groups. This pass restores them. Calculations are unchanged; every number still comes from the backend response.

| Previous capability | Now |
| --- | --- |
| EfficiencyBadge, TierPill (four bands at 120 / 100 / 80, tier labels, count-up) | `domain/verdict.ts` and `shared/EfficiencyMark.vue`, used on catalog cards, table rows, the hover preview, the drawer, the comparison and build totals. The lowest band is labelled "Low" instead of "Poor": a low base-stat number means unpriced effects, not a bad item. |
| ItemStatsCard header and sections | Hover preview shows the tier label, the banded efficiency, and Stats and Effects headings. It no longer opens on top of the drawer after a quick click. |
| ItemBreakdownModal, BreakdownRecipe, BreakdownStatAnalysis | Drawer shows stat value, combine cost, per-stat bars with share, a share ring, component efficiency, a components / combine / final cost breakdown, and Passive / Active labels kept from Data Dragon's markup. |
| CompareItemCard, StatBreakdownBars, RecipeSection, WinnerCard, AddItemCard, CompareSingleItemNotice | Comparison has stat value and gain, "where the value comes from" bars on one scale, the recipe with its cost split, the lead in points, an in-page item picker, a one-item prompt, and the AI study per item on request (no request until asked). |
| CompareCharts, ChampionBuildCharts, ChampionTimelineChart, ResearchEfficiencyChart | Inline SVG charts in `components/charts/` (ring, bars with a 100% reference line, line chart with keyboard and pointer readout). Chart.js was not brought back. |
| ItemBestOnPanel portraits, ResearchExperimentalBuilds champion | Champion portraits next to AI output that names a champion; the roster is fetched once and only when needed. |
| ResearchOutliers, ResearchEffectSpotlights | The page reads `efficiency`, `estimatedEffectGold`, `effectName` and `forChampion` again, and no longer cuts the lists to 8 and 6. |
| ItemTableView sorting, SortControls, TypeFilter | Table headers sort both ways; sort by stat value; Tank and Starter categories. |
| SavedBuildsPanel thumbnails, BuildSlot efficiency | Restored. |
| AboutStatValuesTable | Rate table on the method page, read from the reference items in the loaded catalog. |
| Mouseflow page views on route change | Restored in the router. |
| FlashCompare winner | The quick comparison names the highest of the three and its lead; the stray `?` separator is fixed. |

Not restored, by decision (reasons in `docs/production/2026-11-overhaul.md`): the pre-migration default sort and default support filter, the search suggestions dropdown, page-size choice and infinite scroll, the floating selection tray, the particle hero and card beam, the hamburger menu and the long footer.

Coverage: `gold-league/tests/app/parity.spec.ts`, ten tests, each named after the component it stands in for.
