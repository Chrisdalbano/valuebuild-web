# BuildValue

League of Legends item research, built with Forza UI.

[Open BuildValue](https://buildvalue.chrisdalbano.com) · [Forza integration guide](https://forzaui.chrisdalbano.com/guide/buildvalue)

BuildValue brings item exploration, comparisons, six-slot drafts, champion studies, and a budget planner into one workspace. The interface uses the published `@chrisdalbano/forza-ui` package.

## Run locally

```bash
cd gold-league
npm ci
npm run dev
```

The frontend uses the existing hosted API by default. Set `VITE_API_BASE_URL` to use a local backend. A captured, patch-labeled API response keeps the basic workspace available when requests fail.

```bash
npm run typecheck
npm run test:app
npm run build
npm run preview
```

Install the test browser once with `npx playwright install chromium`. The production-build offline check is `node ../scripts/pwa-smoke.mjs http://localhost:4173` from `gold-league`.

## Application

- `/`: interactive landing and purchase studies.
- `/items`: search, category and budget filters, pagination, item drawer, and persistent build tray.
- `/compare`: up to six items with a baseline, cost differences, stats, and effect descriptions.
- `/builds`: named drafts, undo, saved builds, share links, composition bars, and a constrained budget planner.
- `/champions`: cached champion itemization, progression, situational choices, and illustrative gold timing.
- `/research`: cached hypotheses and patterns across champion studies.
- `/about`: data sources, formula boundaries, AI disclosure, and methodology.

Previous `?b=` share links and `bv:saved-builds` records remain supported. New share links contain item IDs only. Browser storage is local, not an account or cloud backup.

## Architecture

`src/views` composes feature components. `src/state/workspace.ts` owns the shared catalog and draft state. `src/domain` adapts backend records and provides pure aggregation and budget functions. `src/composables/useRemote.ts` handles cancelable research requests. Forza owns generic controls; BuildValue owns game-specific behavior.

GSAP is lazy-loaded by landing components only. Application interactions use Forza and Vue. The old embedded kit, Tailwind/Inspira layer, and legacy global styles have been removed from the frontend.

The FastAPI/MongoDB backend and its scheduled ETL remain in `backend/`. This redesign does not change the backend calculation constants or trigger new AI generation. `npm run data:sync` captures the backend's current item response for the offline fallback.

## Data limits

Gold efficiency measures priced base stats using the backend's maintained constants. It does not price every effect, simulate combat, enforce every item restriction, or predict win rates. Budget optimization maximizes that stat-value model, not in-game performance. AI-generated studies are explicitly speculative and remain separate from calculated totals.

## Deployment

Firebase Hosting project `buildvalue-b202d` serves `gold-league/dist`. After building and verifying:

```bash
firebase deploy --only hosting --project buildvalue-b202d
```

The existing workflow runs build and browser checks on `main`; frontend hosting is deployed separately. Netlify configuration is historical.

## Credits

Independent work by Chrisdalbano, developed with AI assistance across implementation, research, visual iteration, and documentation. AI assistance includes generated code and copy. Review and test changes before relying on them.

BuildValue is not endorsed by Riot Games. League of Legends and its game assets belong to Riot Games. Project code is MIT licensed; that license does not grant rights to Riot's assets. Forza UI is independently available as an open-source library.


### Restored workspace interactions

Item hover previews show cost, stat value, stats, and effects without requesting AI. Open an item for the full AI effect breakdown and champion estimates. The explorer includes card/table views and stat-keyword search. Build and comparison slots support swaps; saved builds support rename. Role suggestions, comparison handoffs, and quick comparisons are available. See [feature parity](docs/design/FORZA-FEATURE-PARITY.md) for the audit and remaining presentation differences.
