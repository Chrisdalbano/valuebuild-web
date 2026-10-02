from fastapi import FastAPI, BackgroundTasks, Header, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uvicorn
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import ETL pipeline
from etl.data_pipeline import ETLScheduler, run_etl_now

# Import AI enrichment (Gemini effect valuation + research digest)
from ai.enrich import run_ai_enrichment
from ai.gemini_client import is_configured as ai_is_configured
from refresh_gate import RefreshGate, is_authorized, run_and_release
from ai.cache_keys import current_sections

app = FastAPI(title="League Item Efficiency Tracker - Cached Edition")

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

# Allow the Firebase Hosting domains for this project (frontend moved off Netlify)
# without needing a CORS_ORIGINS env change. Scoped to this project's domains +
# the custom domain. Override/extend via CORS_ORIGINS env as before.
CORS_ORIGIN_REGEX = os.getenv(
    "CORS_ORIGIN_REGEX",
    r"https://(buildvalue-b202d\.web\.app|buildvalue-b202d\.firebaseapp\.com|buildvalue\.chrisdalbano\.com)",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client['gold_league']
items_collection = db['items_cache']
metadata_collection = db['etl_metadata']
ai_collection = db['ai_analysis']
champions_collection = db['champions_cache']
champion_analysis_collection = db['champion_analysis']


async def _current_patch():
    """Patch of the latest ETL run, used to gate stale AI caches."""
    meta = await metadata_collection.find_one({'_id': 'latest'})
    return (meta or {}).get('patch')

# ETL Scheduler instance
etl_scheduler = None

# Guards for the endpoints that start background work (see refresh_gate.py).
# Set ADMIN_TOKEN in the host environment to require an X-Admin-Token header.
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")
etl_gate = RefreshGate()
ai_gate = RefreshGate()


def _require_admin(token):
    if not is_authorized(token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Missing or invalid X-Admin-Token")


def _gate_response(state, gate):
    """429 body for a refresh that is not allowed to start right now."""
    if state == "running":
        return JSONResponse(status_code=429, content={"status": "already_running"})
    return JSONResponse(
        status_code=429,
        content={"status": "cooldown", "retryAfterSeconds": gate.retry_after()},
        headers={"Retry-After": str(gate.retry_after())},
    )


async def _refresh_reference_data(mongo_uri):
    """Items, then the champion roster that the studies are grounded in."""
    await run_etl_now(mongo_uri)
    from etl.champion_pipeline import run_champion_etl_now
    await run_champion_etl_now(mongo_uri)


async def _run_etl_gated(mongo_uri):
    await run_and_release(
        etl_gate,
        lambda: _refresh_reference_data(mongo_uri),
        on_error=lambda e: print(f"ETL refresh failed: {e}"),
    )


@app.on_event("startup")
async def startup_event():
    """
    Initialize the application:
    1. Check if we have cached data
    2. Run ETL if no data exists
    3. Start weekly ETL scheduler
    """
    global etl_scheduler
    
    print("\n" + "="*60)
    print("🚀 Starting League Item Efficiency Tracker API")
    print("="*60 + "\n")
    
    # Check if we have cached data
    item_count = await items_collection.count_documents({})
    
    if item_count == 0:
        print("📦 No cached data found. Running initial ETL...")
        try:
            result = await run_etl_now(MONGO_URI)
            print(f"✅ Initial ETL complete! Loaded {result} items.\n")
        except Exception as e:
            print(f"❌ Initial ETL failed: {e}")
            print("⚠️  Application will start, but no data is available yet.\n")
    else:
        print(f"✅ Found {item_count} cached items in MongoDB\n")

    # Bootstrap champion reference data if empty (best-effort; never blocks startup)
    try:
        champ_count = await champions_collection.count_documents({})
        if champ_count == 0:
            from etl.champion_pipeline import run_champion_etl_now
            print("🦸 No champion data found. Fetching champion reference...")
            n = await run_champion_etl_now(MONGO_URI)
            print(f"🦸 Cached {n} champions.\n")
        else:
            print(f"🦸 Found {champ_count} cached champions in MongoDB\n")
    except Exception as e:
        print(f"⚠️  Champion bootstrap failed (non-fatal): {e}")

    # AI enrichment status (no key = features serve 'pending' gracefully)
    if ai_is_configured():
        print("🤖 Gemini AI enrichment: configured (run POST /api/ai/refresh to populate)")
    else:
        print("🤖 Gemini AI enrichment: GEMINI_API_KEY not set — AI features will show 'pending'")

    # Start the ETL scheduler for weekly updates
    etl_scheduler = ETLScheduler(MONGO_URI, etl_gate=etl_gate, ai_gate=ai_gate)
    etl_scheduler.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Clean shutdown"""
    global etl_scheduler
    if etl_scheduler:
        etl_scheduler.stop()
    mongo_client.close()
    print("👋 Application shutdown complete")


@app.get("/")
def root():
    return {
        "message": "League Item Efficiency Tracker API - Cached Edition",
        "status": "operational",
        "environment": ENVIRONMENT,
        "cache": "MongoDB",
        "update_schedule": "Weekly (Mondays 2:00 AM UTC)"
    }


@app.get("/api/items")
async def get_items():
    """All current items from the MongoDB cache. Reading never starts an ETL
    run; use POST /api/items/refresh for that."""
    # Fetch from MongoDB
    items = await items_collection.find(
        {'isDeprecated': False, 'imageValidated': True},
        {'_id': 0}  # Exclude MongoDB _id from response
    ).to_list(length=None)
    
    return {"items": items}


@app.post("/api/items/refresh")
async def refresh_items(background_tasks: BackgroundTasks, x_admin_token: str = Header(default=None)):
    """Start the ETL pipeline in the background and return immediately.
    One run at a time, with a cooldown between runs."""
    _require_admin(x_admin_token)
    state = etl_gate.try_start()
    if state != "started":
        return _gate_response(state, etl_gate)
    background_tasks.add_task(_run_etl_gated, MONGO_URI)
    return {
        "message": "ETL pipeline started in background",
        "status": "processing",
        "note": "Check /api/metadata for completion status"
    }


@app.get("/api/items/metadata")
async def get_items_metadata():
    """
    Get items metadata for footer display
    Returns item count and last update timestamp
    """
    # Get item count
    item_count = await items_collection.count_documents({'isDeprecated': False, 'imageValidated': True})
    
    # Get last update from ETL metadata
    metadata = await metadata_collection.find_one({'_id': 'latest'})
    last_update = metadata.get('lastUpdated') if metadata else None
    
    return {
        "itemCount": item_count,
        "lastUpdate": last_update
    }


@app.get("/api/items/{item_id}")
async def get_item(item_id: str):
    """Get a specific item by ID from cache"""
    item = await items_collection.find_one(
        {'id': item_id, 'isDeprecated': False},
        {'_id': 0}
    )
    
    if item is None:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    
    return item


@app.get("/api/items/{item_id}/ai")
async def get_item_ai(item_id: str):
    """Cached Gemini effect analysis for an item — only if it matches the current
    patch (else 'pending', so stale AI never shows against fresh items)."""
    doc = await ai_collection.find_one({'_id': item_id}, {'_id': 0, 'model': 0})
    patch = await _current_patch()
    doc = current_sections(doc, patch)  # drop any section generated for another patch
    if doc:
        if isinstance(doc.get('bestOn'), dict):
            doc['bestOn'] = {k: v for k, v in doc['bestOn'].items() if k != 'model'}  # don't disclose the AI vendor/model
        return {'status': 'ready', **doc}
    return {'status': 'pending', 'configured': ai_is_configured()}


@app.get("/api/research")
async def get_research():
    """The current patch's AI research digest (outliers, effect spotlights,
    experimental builds). 'pending' until enrichment has run for this patch."""
    doc = await ai_collection.find_one({'_id': 'research_digest'}, {'_id': 0, 'model': 0})
    patch = await _current_patch()
    if doc and doc.get('patch') == patch:
        return {'status': 'ready', **doc}
    return {'status': 'pending', 'configured': ai_is_configured(), 'patch': patch}


@app.get("/api/champions")
async def get_champions():
    """Compact champion reference data (id, name, tags, resource, range, spells).
    Used to ground the AI 'Best on' feature + resolve champion portrait icons."""
    docs = await champions_collection.find(
        {}, {'name': 1, 'key': 1, 'tags': 1, 'rangeType': 1, 'patch': 1}
    ).to_list(length=None)
    champions = [{'id': d.pop('_id'), **d} for d in docs]
    return {'champions': champions, 'count': len(champions)}


@app.get("/api/research/champions")
async def get_research_champions():
    """Champion-derived research signals — DETERMINISTIC (no Gemini call): the
    most-built items across champion core builds this patch + a sample of the
    off-meta champion experiments. Aggregated from champion_analysis."""
    from collections import Counter
    patch = await _current_patch()
    docs = await champion_analysis_collection.find({'patch': patch}).to_list(length=None)
    if not docs:
        return {'status': 'pending', 'configured': ai_is_configured()}
    counts = Counter()
    experiments = []
    for d in docs:
        for iid in ((d.get('coreBuild') or {}).get('itemIds') or []):
            counts[iid] += 1
        exp = d.get('experimental') or {}
        if exp.get('itemIds'):
            experiments.append({
                'champion': d.get('name', d.get('_id')),
                'title': exp.get('title', ''),
                'itemIds': exp.get('itemIds', []),
                'rationale': exp.get('rationale', ''),
            })
    return {
        'status': 'ready',
        'patch': patch,
        'championCount': len(docs),
        'topItems': [{'itemId': i, 'count': c} for i, c in counts.most_common(12)],
        'experiments': experiments[:12],
    }


@app.get("/api/champions/{champion_id}/ai")
async def get_champion_ai(champion_id: str):
    """Cached per-champion itemization analysis — only if it matches the current
    patch (else 'pending'). Patch-gated + model stripped, like the item AI."""
    doc = await champion_analysis_collection.find_one(
        {'_id': champion_id}, {'_id': 0, 'model': 0}
    )
    patch = await _current_patch()
    if doc and doc.get('patch') == patch:
        return {'status': 'ready', **doc}
    return {'status': 'pending', 'configured': ai_is_configured()}


# in-process guard so spamming /api/ai/refresh can't launch overlapping
# enrichment jobs (the only generation trigger; key stays backend-only)


async def _run_ai_enrichment_guarded(mongo_uri: str):
    await run_and_release(
        ai_gate,
        lambda: run_ai_enrichment(mongo_uri),
        on_error=lambda e: print(f"AI enrichment failed: {e}"),
    )


@app.post("/api/ai/refresh")
async def refresh_ai(background_tasks: BackgroundTasks, x_admin_token: str = Header(default=None)):
    """Start AI enrichment in the background. No-ops when GEMINI_API_KEY is
    unset. One run at a time, with a cooldown between runs."""
    _require_admin(x_admin_token)
    if not ai_is_configured():
        return {'status': 'skipped', 'reason': 'GEMINI_API_KEY not set'}
    state = ai_gate.try_start()
    if state != "started":
        return _gate_response(state, ai_gate)
    background_tasks.add_task(_run_ai_enrichment_guarded, MONGO_URI)
    return {'status': 'processing', 'note': 'AI enrichment started; poll /api/research'}


@app.get("/api/metadata")
async def get_metadata():
    """
    Get ETL pipeline metadata
    Shows when data was last updated, next update time, etc.
    """
    metadata = await metadata_collection.find_one({'_id': 'latest'}, {'_id': 0})
    
    if metadata is None:
        return {
            "status": "no_data",
            "message": "ETL has not run yet"
        }
    
    return metadata


@app.get("/api/health")
async def health_check():
    """Health check for monitoring. Always answers; the body says whether the
    database is reachable and the catalog is loaded."""
    db_status = "connected"
    item_count = 0
    last_update = None
    try:
        await mongo_client.admin.command('ping')
        item_count = await items_collection.count_documents({})
        metadata = await metadata_collection.find_one({'_id': 'latest'})
        last_update = metadata.get('lastUpdated') if metadata else None
    except Exception as e:
        print(f"Health check: database error: {e}")
        db_status = "unavailable"

    return {
        "status": "healthy" if db_status == "connected" and item_count > 0 else "unhealthy",
        "database": db_status,
        "cached_items": item_count,
        "last_update": last_update,
        "timestamp": datetime.utcnow()
    }


if __name__ == "__main__":
    print("🎮 Starting League Item Efficiency Tracker...")
    print("📊 MongoDB cache enabled")
    print("⏰ Weekly ETL updates scheduled\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)

