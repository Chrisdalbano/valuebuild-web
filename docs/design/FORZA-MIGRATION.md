# Forza migration / September 17, 2026

Christian authorized a full BuildValue rebrand using Forza UI. This supersedes the former Inspira/Tailwind styling plan and the isolated-preview restrictions in FORZA.md.

## Design and component map

The landing uses large condensed type and an interactive purchase study with actual API-sourced values. Motion introduces the study and reveals the product explanation; reduced motion keeps all content static and readable.

The application uses a compact catalog next to a persistent build tray. Routes compose focused components. Workspace actions own mutations; computed state derives totals. Search and category state stay with the explorer. Generic controls come from the published Forza UI package, not a copied local fork.

- Layout: header, footer, brand mark.
- Workspace: explorer, item details, build tray, editor, saved builds, comparisons, budget planner, stat summaries.
- Analysis: remote states, item sets, champion details, effect studies, composition bars.
- Domain: backend item adapter, totals, ID validation, constrained selection.
- State: catalog, selected IDs, saved entries, undo, status feedback.

## Preservation

The implementation was reconciled with remote main `ebb1f49` before promotion. Existing backend logic and AI routes remain unchanged. Champion studies, research, build planning, installability, and offline behavior are retained in the Forza presentation. Existing saved-build storage is migrated without deleting its original key; old `?b=` links work alongside new `?items=` links.

Item efficiency and breakdowns remain backend-authoritative. No client-side reference-rate recalculation is shipped. A bundled API response supplies the labeled offline fallback. Generated analysis never contributes to formula totals.

## Verification

Type checking, production builds, user-flow tests, responsive/axe checks, API import check, production-preview screenshots, and an offline service-worker smoke check are required before deployment. Existing CI script entry points now invoke the current tests rather than selectors for the retired UI.

## Presentation

Forza documentation includes a BuildValue integration guide with the component mapping, state and persistence boundaries, and actual UI screenshot. BuildValue links back to Forza. Neither project claims Riot endorsement. No outreach or social posts are sent as part of this implementation.


## Feature parity correction

The first release retained routes and backend services but did not preserve every interaction. See `FORZA-FEATURE-PARITY.md` for the source comparison, restored capabilities, deliberate presentation differences, and regression coverage. Future redesign acceptance must include this checklist, not only tests for the new implementation.
