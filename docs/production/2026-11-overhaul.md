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
| 2026-11-23 | Chart.js for the restored charts | Dropped | Inline SVG covers the five charts; avoids re-adding a dependency removed in September. |
| 2026-11-23 | Efficiency-first default sort and gold-income items hidden by default (pre-migration defaults) | Deferred, owner's call | The current defaults have been live since September and the test suite and smoke scripts assume them. Both options exist; only the default differs. |
| 2026-11-23 | Search suggestions dropdown | Dropped | The list already filters as you type, including stat keywords; a dropdown over a live-filtered list duplicates it. |
| 2026-11-23 | Page-size choice, Load more, infinite scroll | Dropped | Explicit pagination was a documented decision in September. |
| 2026-11-23 | Floating selection tray on the explorer | Dropped | The build tray and the compare count in the header already hold the selection. |
| 2026-11-23 | Particle hero, champion splash background, pointer spotlight and border beam on cards | Dropped | Decoration that does not explain a state change; replaced by the landing page in September. |
| 2026-11-23 | Mobile hamburger menu, long footer | Dropped | The header already wraps and stays reachable at 390 px. |
| 2026-11-23 | Public Riot ID lookup with match-history analytics | Blocked, needs owner | Riot allows self-stats tools only with RSO on a production key. Built as a private, single-account review instead. |
| 2026-11-23 | Leaderboards, rank lookups | Dropped | The brief asked for a player's own decisions, not a leaderboard; every tracker has this. |
| 2026-11-23 | Augment statistics | Dropped | Riot removed augment data from match history (reported for set 13 onward; unconfirmed here) and forbids some augment win rates. |
| 2026-11-23 | AI-written TFT studies | Deferred, needs owner | Generating them spends Gemini quota, which this work may not do. A page that could only show "pending" was not worth building. |
| 2026-11-23 | Board planner (place units, see traits light up) | Dropped | Every TFT site has one. The trait price list answers the "what does this cost" question without it. |
| 2026-11-23 | Lux in the roll odds | Dropped | Nine variants with distribution rules Riot said were still changing; modelling her would be a guess. |

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
| R9 | Set 19 lands about 2026-12-01 and the TFT numbers go stale or the data source stops | Constants are keyed by set with source and date; a set the constants were not checked for shows a visible warning instead of silently reusing old numbers; the snapshot script is one command. Listed in the release checklist. |
| R10 | The private match review is switched on publicly by setting the key on Render | It needs two variables, reviews one fixed account, and the release checklist says not to set them on the public backend before a production key and RSO. |

## 4. Log

**2026-11-23**

- Read `README.md`, `CLAUDE.md`, CI and deploy config, backend entrypoint, the vault project note and both October audits. Repo was on `development`, clean, with `main`, `development` and both remotes all at `2b2c350`. Created `feature/tft-and-parity` from there. Nothing stashed.
- Baseline, backend: `python -m pytest -q` in `backend/`: **94 passed**. `python -c "import app"`: exit 0. (Local Python is 3.13; CI and Render use 3.11.)
- Baseline, typecheck: `npm run typecheck`: clean.
- Baseline, browser: first run of `npm run test:app` reported **25 failed, 0 passed**. Cause: the Playwright Chromium build the installed `@playwright/test` expects was not on this machine ("Executable doesn't exist ... chromium_headless_shell-1243"). This is an environment gap, not an app failure. Next step is the README's own `npx playwright install chromium`, then rerun.
- Ran `npx playwright install chromium` (downloads the test browser to the user cache; no repo change). Reran `npm run test:app`: **25 passed, 0 failed** in 23.1 s. That is the browser baseline.
- Riot key check: no `RIOT_API_KEY`, `RGAPI` string, `X-Riot-Token` header or `api.riotgames.com` call anywhere in the working tree or in git history; no `backend/.env` on this machine; no Riot variable in `render.yaml` (it lists `MONGO_URI`, `CORS_ORIGINS`, `GEMINI_API_KEY`). `backend/riot_client.py` only talks to Data Dragon, which needs no key. What is set in the Render dashboard cannot be seen from here. Working assumption: there is no Riot API key yet.
- Owner asked, through the coordinating session, for this record to be kept as the work goes. Started this file before writing feature code.
- Parity audit finished (read-only pass over every file at `ebb1f49` against the current tree, by a delegated agent; nothing was run in a browser for it). Result: the hover preview itself is close to parity already (restored 2026-09-17 in `7078a5b`); what is still gone is larger than the September repair recorded. Three groups carry most of it: (a) the efficiency verdict system (four colour tiers, a rating word, item tier labels, count-up) is absent everywhere; (b) all eight Chart.js charts were replaced by bars, tables or nothing; (c) the compare page lost its per-item cards (stat bars with gold per stat, recipe and cost summary, value and gain, AI panels inline). Smaller losses: drawer depth (stat value, combine cost, share bars), champion portraits in AI output, three research fields the API still returns but the page never reads (`efficiency`, `estimatedEffectGold`, `forChampion`), sortable table headers, value sort, Tank and Starter filters, saved-build thumbnails, the About rate table, SPA page views for Mouseflow, and a stray `?` rendered in the quick comparison.
- Decision: restore groups (a), (b), (c), the drawer depth, portraits, the dropped research fields, table sorting, the two filters, thumbnails, the About table and the page-view call. Charts come back as inline SVG, not Chart.js: the app dropped that dependency in September and five small charts do not justify putting about 200 kB back in the bundle. Items not restored are in the cut list with reasons.
- Plan change, recorded as it happened: while the audit and the Riot research were running in the background, the TFT data layer (`backend/tft/`, `src/domain/tft/`) was started instead of waiting idle. This is ahead of the planned order (parity first). No TFT interface work starts until parity is committed.
- Looked at the keyless TFT data directly. `raw.communitydragon.org/latest/cdragon/tft/en_us.json` is 24.2 MB, last modified 2026-11-23, built from game version 16.23. Highest numbered set is 18. It cannot be shipped to a browser as is; the backend trims it to the live set (about 100 kB) and the frontend bundles a snapshot of that, the same pattern the League catalog uses.
- Riot research finished (delegated agent; every claim below was fetched today from the page named unless marked otherwise; full sources are in `docs/tft/RIOT-API-AND-POLICY.md`). Findings that changed the plan:
  1. **Match history for a named player is not open to this product yet.** Riot's TFT page lists "Showing (self) player stats" and "Training tools that allow players to view their own match histories" as approved only with Riot Sign On, and RSO is "only available to developers with Production Level API Keys". A development key expires every 24 hours and "You may not maintain a public product with a development API key"; a personal key is "for products that are intended for just the developer or a small private community" and may not run "for public consumption". So a public Riot ID lookup cannot ship from this branch whatever is built.
  2. **Any change must be registered.** "Any new features or changes to a product must be audited through the product's page in the Developer Portal". Adding TFT to BuildValue is such a change. Whether BuildValue is registered at all could not be checked from here. This is the owner's step.
  3. **Set 18 (Enchanted Wilds) ends within days.** Patch 18.7 of 2026-11-17 is its last; Riot dates set 19.1 at 2026-12-01 with a new Data Dragon format, and the set 18 data on Community Dragon comes from the legacy client. Every set-specific constant has to be re-pulled then, and Community Dragon may stop carrying TFT.
  4. Riot's TFT policy forbids real-time advice, scouting and anything that "dictates player decisions", and encourages "pre-game best practices or post-game analysis". The calculators planned here are static and pre-game, which is the allowed shape.
- Decisions from that:
  - The static tools (roll odds, item ledger, trait prices) go ahead as planned. They need no key.
  - The match review is built as a private tool only: the backend reads `RIOT_API_KEY` and a fixed `TFT_REVIEW_RIOT_ID` from the environment and reviews that one account. There is no field to look up another player. With either variable missing the page says what is needed. It is not to be enabled on the public site until a production key and RSO exist; that is in the release checklist. It could not be exercised against the real API here because no key exists; it is tested against fixtures shaped like Riot's published schema.
  - Economy constants are stored per set with their source and date, and the interface says so when the live set is not the one they were checked for.
  - Set 18's Wisp mechanic (every other shop has four unit slots) is modelled as an option; Lux's nine variants are left out of the odds tool because Riot's own overview says her distribution rules were still being changed.
- Parity work done and committed. Browser suite: **35 passed** (the 25 existing, untouched, plus 10 new in `parity.spec.ts`). Typecheck clean. Two of the new tests failed on first run because the test was wrong, not the app (a control queried by the wrong role; a stage-marker count); corrected and rerun.
- Found while reviewing screenshots against the live API: (1) a quick click on a catalog card could leave the hover preview drawn over the drawer it had just opened (the hover timer fired after the click). Present before this work; fixed in `ItemPreview.vue`. (2) The live backend reports patch 16.23.1 and has no cached AI study for it, so on the public site the champion and item AI panels currently read "No cached analysis yet". That is the known open item from October (enrichment not run for the current patch). It means the restored AI presentation and champion charts can only be seen against test fixtures today; running enrichment costs Gemini quota and was not done.
- TFT backend committed (`b412d77`). Backend tests: **120 passed** (94 existing + 26 new). One new test failed on first run because its fixture named a variable the item did not have; fixed in the fixture. Ran the real trim against today's Community Dragon file: set 18, 74 unit entries (65 pool units: 14 / 13 / 14 / 14 / 10 by cost, matching the bag counts from the research, plus 9 Lux variants), 35 traits, 39 craftable items, 69 kB.
- Checked two of the research claims directly before relying on them: fetched Riot's `tft-shop-drop-rates-data.json` (the odds table in `economy.py` matches it) and the use-case list on `developer.riotgames.com/docs/tft` (self-stats tools are listed under production keys requiring RSO). Star scaling and the resistance formula were read from the League Wiki's TFT:Champion page.
- TFT frontend committed (`c79f526`): roll odds, item ledger, trait prices, game review, a League / TFT switch in the header, a landing section and a method section. Browser suite: **51 passed** (25 original + 10 parity + 16 TFT). The roll model is tested against hand-worked cases and against a separately written simulation of the same rules (60,000 trials, agreement within 0.008).
- Change of plan on trait tiers and item bands: the first draft named trait tiers (bronze, silver, gold) from a style number and coloured TFT items in bands. Riot's schema and Community Dragon use different style scales and there is no published basis for TFT efficiency bands, so both were removed rather than guessed.
- Found during the build check: importing the TFT state from the header pulled the 68 kB snapshot into the main bundle and made every League page request `/api/tft/set`. Fixed: the TFT data is its own chunk, loaded on TFT pages and by the landing section, and only TFT pages ask the backend for it.
- Ran the TFT routes for real, locally, without MongoDB (`scripts/serve_tft_only.py`): `GET /api/tft/set` answered 200 with 69,168 bytes in 0.60 s (5 ms from cache on the second call); `GET /api/tft/review` answered `needs_key` naming both variables. Pointed the frontend at it and confirmed the pages switch from "Bundled snapshot" to "BuildValue API" and the review page shows the needs-a-key state.
- Motion pass committed (`523e289`). Ran the whole suite once with motion on (`BV_MOTION=1`): 44 passed, 7 failed. All seven are checks taken in the middle of an animation: six accessibility scans reporting colour contrast on fading elements (three of them the original seven-route scan hitting the landing page's existing GSAP intro, which predates this work) and one locator that matched a card still animating out. No interaction was blocked and no content stayed hidden. The suite's normal mode is reduced motion, as it was before; the motion-on run is a diagnostic, not a gate.
- CI's smoke scripts, run locally against a preview of the production build: all nine passed, including the offline PWA check.
- Bundle, measured with `npm run build` at `2b2c350` and at the branch tip: main script 461.3 kB (119.2 kB gzip) to 473.7 kB (123.9 kB gzip); stylesheet 59.9 kB (11.9 kB gzip) to 82.7 kB (16.0 kB gzip); precache 694 KiB to 860 KiB. The TFT data chunk is 67.6 kB (10.5 kB gzip) and is not on the League path.
- Final run before stopping: backend **120 passed**; typecheck clean; production build clean; browser suite **51 passed**; PWA smoke passed. No Riot key value exists anywhere in the tree or the built files (the built review page contains the variable names, as text explaining what is missing).
- Correction to this record after a read-through: the closing note first said the review had been sketched as a lookup "for about an hour", which was not measured, and named a previous bundle hash that could not be confirmed as the live one. Both were removed.

## 5. Release checklist

For whoever promotes this branch. Nothing here has been done.

### Before merging

- [ ] Owner has looked at the branch locally (see "Run locally" in the README).
- [ ] `cd backend && python -m pytest -q` reports 120 passed, and `python -c "import app"` exits 0.
- [ ] `cd gold-league && npm run typecheck && npm run build` are clean.
- [ ] `npm run test:app` reports 51 passed.
- [ ] CI is green on the pull request (it runs the three steps above plus nine smoke scripts against a production-build preview).
- [ ] Decide the open items in section 6. In particular: `RIOT_API_KEY` and `TFT_REVIEW_RIOT_ID` are **not** to be set on the public Render service.
- [ ] If set 19 is already live (expected about 2026-12-01), refresh the TFT snapshot and add its constants first (`docs/tft/RIOT-API-AND-POLICY.md`, last section). Otherwise the TFT pages ship with a "checked for a different set" warning, or with set 18 data for a set that has ended.

### Deploy (two separate steps, as before)

1. Merge to `main` and push. Render redeploys the backend from `main` on its own. This adds two routes and no new required environment variable; `requirements.txt` is unchanged.
2. Frontend, by hand: `cd gold-league && npm run build`, then from the repo root `firebase deploy --only hosting --project buildvalue-b202d`.

### Check on the live site

- [ ] `curl https://valuebuild-web.onrender.com/api/health` is healthy (the first call after idle can take about 50 s).
- [ ] `curl https://valuebuild-web.onrender.com/api/tft/set` returns the set with `"verified": true` in `economy`.
- [ ] `curl https://valuebuild-web.onrender.com/api/tft/review` returns `"status":"needs_key"`. If it returns anything else, a key is set on the public service: remove it.
- [ ] https://buildvalue.chrisdalbano.com loads a new bundle hash; the seven League routes open; the footer still reads "BuildValue is not endorsed by Riot Games."
- [ ] `/items`: a card shows its tier, stat value and verdict; hovering shows the preview; opening an item shows value, combine cost and the cost breakdown; the preview does not sit on top of the drawer.
- [ ] `/builds?items=3031,3072`: an old share link still loads; saved builds from before the deploy are still listed.
- [ ] `/tft`: the headline shows a percentage, the data line reads "BuildValue API", and moving the gold slider moves the number.
- [ ] `/tft/review`: shows "This needs a Riot API key".
- [ ] Open the site once with the network off after a first visit: the workspace still opens (PWA).

### Roll back

- Frontend: Firebase keeps previous releases. Console → Hosting → release history → roll back to the release before this one, or `git checkout 2b2c350 -- gold-league && cd gold-league && npm run build && firebase deploy --only hosting --project buildvalue-b202d` from a clean checkout.
- Backend: `git revert` the merge on `main` and push; Render redeploys. The new routes are additive and touch no collection, so there is no data to restore. Old frontend against new backend, and new frontend against old backend, both work: the TFT pages fall back to their bundled snapshot when `/api/tft/set` is missing.
- Browser storage: this branch reads and writes the same `buildvalue.workspace.v2` key in the same shape. Rolling back needs no migration.

## 6. Closing note

Written 2026-11-23, when the work stopped.

**What is on the branch** (`feature/tft-and-parity`, eight commits on top of `2b2c350`, local only, not pushed):

- The second parity repair: verdict bands and tier labels, drawer depth, per-item comparison detail, five SVG charts, portraits, the dropped research fields, table sorting, two filters, thumbnails, the rate table, page views. One pre-existing bug fixed (preview drawn over the drawer).
- Teamfight Tactics: three keyless tools (roll odds, item ledger, trait prices) and a key-gated game review, with a backend that needs neither MongoDB nor a key for the static part.
- Motion that reports state changes, off under reduced motion.
- Tests: backend 94 → 120, browser 25 → 51. Nothing was removed from the original suite.

**What did not ship, and why:**

- The game review has never run against Riot's API. No key exists here, and Riot's rules put a public version behind a production key and Riot Sign On. It is tested against fixtures in the shape of Riot's schema; the first real run may show a field or an id format that differs.
- No AI-written TFT research. It would have meant spending Gemini quota. The existing League AI panels were restored in presentation, but the live site has no cached studies for the current patch, so they show "pending" there until enrichment is run.
- The items in the cut list.
- Small things seen and left: on a phone the roll result sits below the controls, so changing a slider means scrolling to see the number; the trait and item pages have no hover previews like the League catalog; the `render.yaml` blueprint does not list the two optional TFT variables (changing hosting config was out of bounds).

**For the owner to decide:**

1. Register the TFT addition in Riot's Developer Portal (required for any change to a registered product), and whether to apply for a production key and RSO so the game review can be public.
2. Whether to adopt Riot's full notice wording in the footer.
3. Whether to restore the pre-migration defaults (efficiency-first sort, gold-income items hidden).
4. Whether to run the Gemini enrichment for the current patch.
5. When to redo the TFT constants for set 19.
6. `ADMIN_TOKEN` is still unset on Render (open since October; unchanged by this work).

**What would be done differently:**

- Read Riot's use-case list before designing anything. The match review was first planned as a lookup by Riot ID, while the research was still running; the research then showed that shape cannot be public. The single-account design came from the policy and should have started there.
- Ask for the baseline parity audit to include a browser pass. It was a source read, so the hover-over-drawer bug and the missing AI data on the live site were only found later from screenshots.
- Check the bundle after the first TFT commit, not the last. The snapshot sat in the main chunk for one commit before the build output was read.
- Settle the set-change question with the owner first. Building on a set with a week left was the right call for something to look at now, but it means the first maintenance task is already scheduled.
