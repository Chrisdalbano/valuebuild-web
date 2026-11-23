# November 2026 overhaul: parity, TFT, feel

Production record for the branch `feature/tft-and-parity`, cut from `main` at `2b2c350`.

How this work was done: Christian D'Albano owns BuildValue and set the goals, the order of work and the boundaries for this overhaul. The build work on this branch (reading the code, research, implementation, tests, this record) was done by an AI coding agent (Claude) working under that direction, in one working session. There were no meetings or ceremonies; decisions below are the agent's, taken inside the brief, and are open to his review before anything goes live. This file was written as the work went, in the order the sections are dated. Entries are not rewritten afterwards; corrections are added as new log lines.

## 1. Plan (written 2026-11-23, before any feature code)

### Goals, from the owner's brief

1. Restore what the September 17 Forza migration removed (he reported hover previews and a reduced AI explanation at the time).
2. Add Teamfight Tactics, using Riot's TFT API where a key is needed and keyless static data where it is not.
3. Analytics that are not the usual tracker tables; AI research that is useful and labelled.
4. Better feel: interactive, with motion that explains state changes.
5. Do not break the live site. It is named on an application in front of Riot Games with "23 browser tests" and "Not endorsed by Riot Games".

### Scope list

| # | Item | In scope |
|---|---|---|
| A | Green baseline: backend pytest, typecheck, Playwright suite | yes |
| B | Parity audit against pre-migration source `ebb1f49`; restore what is still missing, with tests | yes |
| C | TFT research from primary sources: Riot Developer Portal API docs, key types, rate limits, policies | yes |
| D | TFT static-data layer (units, traits, items, augments) from Community Dragon, no key | yes |
| E | TFT "what is this worth" calculators, each constant sourced | yes |
| F | TFT match-history analytics behind a backend-only `RIOT_API_KEY`, with a clear "needs a key" state | yes, if policy allows |
| G | Motion and UI pass across League and TFT together | yes |
| H | Tests for everything added; browser check of the new flows | yes |
| I | Deploy, push to `main`, env or hosting changes, Gemini enrichment runs | no (owner's review first) |

### Order of work and why

1. **Baseline first.** A regression can only be called a regression against a measured starting point. If the baseline is not green, that is a finding in itself.
2. **Parity before new features.** The owner already lost features once to a rebuild that passed its own tests. Fixing that debt first means the TFT work is added to a complete League app, and the parity tests then guard the later UI pass.
3. **TFT research before TFT design.** The key type and Riot's policy decide which features are allowed at all. Designing match analytics before reading the policy risks building something that cannot ship.
4. **Static-data features before key-gated ones.** They work for every visitor with no key, so they are the part of TFT that is certain to be usable on review day. The key-gated part is built last and degrades to a labelled state.
5. **Motion pass after the features exist.** Motion should explain state changes that are real; styling screens that are still moving wastes the pass. Doing it once over both games is also what makes it read as one product.
6. **Verify last, and continuously.** Suites rerun after each stage; final counts recorded here.

### What triggers a production deploy (checked 2026-11-23, in `CLAUDE.md`, `backend/render.yaml`, `firebase.json`, `.github/workflows/`)

- Backend: Render auto-deploys on any push to `main` (`autoDeploy: true`, `branch: main`).
- Frontend: manual only, `firebase deploy --only hosting --project buildvalue-b202d` after `npm run build`. No workflow deploys it.
- CI (`ci.yml`) runs on pushes to `main` and `development` and on pull requests to `main`. It tests; it does not deploy.
- `weekly-refresh.yml` runs on a Monday cron against the live API. Unrelated to this branch.

So nothing on this branch can deploy unless it is merged to `main` and pushed, or someone runs the Firebase command. Neither is done here. The branch is local and has not been pushed.

## 2. Cut list

Features considered and dropped or deferred, with the reason. Added to as decisions are made.

| Date | Feature | Decision | Reason |
|---|---|---|---|

## 3. Risk list

| # | Risk | What was done about it |
|---|---|---|
| R1 | The live site breaks while it is under review at Riot | Branch only; no push, merge or deploy. Existing routes and tests kept; release checklist below lists what to check and how to roll back. |
| R2 | A repeat of September: new work passes its own tests while older features quietly disappear | Parity audit against `ebb1f49` done before new features; existing suite must stay green at every stage. |
| R3 | TFT numbers that look authoritative but are wrong for the current set | Every constant gets a named source and a retrieval date; formulas get unit tests against hand-worked cases; set-specific numbers are labelled with the set they apply to. |
| R4 | Riot API key leaks or is used in a way policy forbids | Key read from a backend environment variable only; never sent to the browser, never committed. Policy read before design (section 4 log). |
| R5 | Riot policy or branding breach on the TFT side | Notice kept and extended to TFT; assets loaded from Riot/Community Dragon CDNs, not rehosted; findings recorded before features are chosen. |
| R6 | Paid quota spent by accident (Gemini enrichment) | No enrichment or refresh route is called. Any new AI surface reads cached data or shows a labelled pending state. |
| R7 | Motion makes the app slower or harder to use | Transform and opacity only; `prefers-reduced-motion` honoured; the suite already runs with reduced motion and the accessibility scans stay in. |
| R8 | The "23 browser tests" line on the Riot application becomes untrue | Tests are only added, never removed. The count can only go up; the note in `BuildValue.md` already explains the 23 refers to the September migration. |

## 4. Log

**2026-11-23**

- Read `README.md`, `CLAUDE.md`, CI and deploy config, backend entrypoint, the vault project note and both October audits. Repo was on `development`, clean, with `main`, `development` and both remotes all at `2b2c350`. Created `feature/tft-and-parity` from there. Nothing stashed.
- Baseline, backend: `python -m pytest -q` in `backend/`: **94 passed**. `python -c "import app"`: exit 0. (Local Python is 3.13; CI and Render use 3.11.)
- Baseline, typecheck: `npm run typecheck`: clean.
- Baseline, browser: first run of `npm run test:app` reported **25 failed, 0 passed**. Cause: the Playwright Chromium build the installed `@playwright/test` expects was not on this machine ("Executable doesn't exist ... chromium_headless_shell-1243"). This is an environment gap, not an app failure. Next step is the README's own `npx playwright install chromium`, then rerun.
- Ran `npx playwright install chromium` (downloads the test browser to the user cache; no repo change). Reran `npm run test:app`: **25 passed, 0 failed** in 23.1 s. That is the browser baseline.
- Riot key check: no `RIOT_API_KEY`, `RGAPI` string, `X-Riot-Token` header or `api.riotgames.com` call anywhere in the working tree or in git history; no `backend/.env` on this machine; no Riot variable in `render.yaml` (it lists `MONGO_URI`, `CORS_ORIGINS`, `GEMINI_API_KEY`). `backend/riot_client.py` only talks to Data Dragon, which needs no key. What is set in the Render dashboard cannot be seen from here. Working assumption: there is no Riot API key yet.
- Owner asked, through the coordinating session, for this record to be kept as the work goes. Started this file before writing feature code.

## 5. Release checklist

To be completed as the branch takes shape.

## 6. Closing note

To be written when the work stops.
