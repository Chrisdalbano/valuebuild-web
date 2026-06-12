# CLAUDE.md — BuildValue / gold-league (project doctrine)

BuildValue: a League of Legends item gold-efficiency tool, live at **https://buildvalue.chrisdalbano.com** (repo `valuebuild-web`). Full-stack: Vue 3 SPA + FastAPI + MongoDB Atlas, with a weekly Riot/DDragon ETL. This file is the operating contract for any Claude session working in this repo. It is self-contained: nothing here depends on Christian's other projects.

## Map

- `gold-league/` — the **frontend** (Vue 3.5 `<script setup>`, Vite 7, Vue Router 4, Chart.js 4 via vue-chartjs, axios). Plain JS today; styling is custom CSS variables in `src/style.css` (dark-first, gold accent). 11 components, ~11.5k LOC, several monoliths (ItemTable, ItemCompare, BuildOptimizer).
- `backend/` — **FastAPI** (`app.py` entry), `efficiency.py` (gold-per-stat constants + formula), `etl/data_pipeline.py` (DDragon fetch → validate → calc → MongoDB, APScheduler weekly Mon 02:00 UTC), `db.py`, MongoDB collections `items_cache` + `etl_metadata`.
- `netlify.toml` — frontend deploy (base `gold-league/`, `npm ci && npm run build`, publish `dist`, SPA redirect).
- `backend/render.yaml` — backend deploy IaC (Render web service, branch `main`, uvicorn, healthCheckPath `/api/health`, autoDeploy).
- `.github/workflows/deploy.yml` — CI build checks on push/PR to `main` (no deploy logic; deploys are Netlify/Render webhooks).
- Root `*.md` guides — historical docs (DEPLOY_TO_PRODUCTION, ETL_TRIGGER_GUIDE, START_BACKEND_GUIDE, etc.). Treat as reference, not doctrine; THIS file wins on conflict.
- `docs/UI-MIGRATION-INSPIRA-ATOMIC.md` — the active UI migration plan (Inspira UI + atomic architecture). Read it before any frontend design/build work.

## Commands

```bash
# Frontend (run inside gold-league/)
npm run dev          # Vite dev server (localhost:5173)
npm run build        # production build → dist/
npm run preview      # serve the built dist locally

# Backend (run inside backend/)
python app.py                          # dev server on :8000 (or: uvicorn app:app --reload --port 8000)

# Both at once (repo root)
./start.bat          # Windows  |  ./start.sh  # Unix

# ETL (production)
curl -X POST https://valuebuild-web.onrender.com/api/items/refresh   # trigger (background)
curl https://valuebuild-web.onrender.com/api/metadata                # verify lastUpdated/status/patch
```

Local frontend needs `VITE_API_BASE_URL` (defaults to `http://localhost:8000`); local backend needs `MONGO_URI` in `backend/.env` (see `.env.example` files). **Never commit or print secret values.** Secret NAMES: `MONGO_URI`, `CORS_ORIGINS` (Render dashboard); `VITE_API_BASE_URL`, `VITE_ENVIRONMENT` (Netlify UI).

## Branch + deploy model

- `development` = working branch. All day-to-day work lands here.
- `main` = production. **Pushing `main` deploys**: Netlify rebuilds the frontend AND Render rebuilds the backend (autoDeploy webhooks). Live in ~2–5 min.
- Promotion: `git checkout main && git merge development --ff-only && git push origin main && git checkout development`. Prefer ff-only; if it won't fast-forward, stop and reconcile on development first.

### Standing authorization (granted by Christian, 2026-06-11)

On this repo, Claude may WITHOUT re-asking each time:
1. Commit and push to `development`.
2. Promote `development` → `main` (= production deploy) **when the verification gate below passes**.
3. Trigger the production ETL refresh and poll `/api/metadata` after stat-calculation changes.
4. Create feature branches and open PRs.

NOT covered (ask first): changing Render/Netlify service config or env vars, MongoDB schema migrations or destructive data operations, deleting branches with unmerged work, anything touching billing/plan settings.

### Verification gate (before any `main` push)

1. `npm run build` passes in `gold-league/` (zero errors).
2. Backend imports clean: `python -c "import app"` in `backend/` (catches syntax/dep breaks; full server boot needs Mongo).
3. If frontend behavior changed: screenshot-QA the affected screens against a local `npm run preview` (playwright headless is fine) before deploying — visual bugs that build fine are the known failure mode.
4. If efficiency math changed: trigger prod ETL after deploy and confirm `/api/metadata` shows a fresh successful run; spot-check one known item's efficiency on the live site.
5. After deploy: `curl https://valuebuild-web.onrender.com/api/health` and load https://buildvalue.chrisdalbano.com once.

Note Render free tier cold-starts: the first prod API call after idle can take ~50s. Don't diagnose that as an outage.

## Engineering rules

- **Frontend stack is locked**: Vue 3 + Vite SPA. No Nuxt rewrite, no framework swap. The UI migration (Tailwind v4 + Inspira UI + atomic structure) happens INSIDE this stack per `docs/UI-MIGRATION-INSPIRA-ATOMIC.md`.
- **Tokens, not hex** (post-migration): components consume semantic CSS variables; raw color values live only in the token layer. Until the token layer ships, extend the existing `:root` vars in `src/style.css` rather than inlining colors.
- **Atomic discipline** (post-migration): atoms → molecules → organisms under `src/components/{atoms,molecules,organisms}/`; one component per file, ≤200 LOC hard cap; new work must not grow the existing monoliths — decompose as you touch.
- **Motion**: motion-v only (once installed). Every animation gets a `prefers-reduced-motion` fallback. Compositor-friendly properties only (transform/opacity).
- **Data honesty**: efficiency numbers come from `efficiency.py` constants — if a number on screen can't be traced to the backend response, it's a bug. Never hardcode item data in the frontend; DDragon via the ETL is the single source.
- **Riot compliance**: keep the "not endorsed by Riot Games" disclaimer intact; image URLs stay on DDragon CDN.
- Backend changes that alter response shapes must update `gold-league/src/api/items.js` and every consumer in the same commit.

## Working agreement

- Plans and audits live in `docs/` (create it as needed): design specs under `docs/design/`, migration phases tracked in the migration plan itself (checkboxes per phase).
- Prefer the two-phase pattern that works: write/refresh a short spec in `docs/design/` first (anatomy, tokens, states, reduced-motion), then implement against it. Don't compensate for a missing spec in code.
- Verification scripts (playwright screenshots, smoke checks) live in `scripts/` at repo root. Keep them runnable headless.
- When a bug ships, add the regression check that would have caught it before closing the round.
