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
