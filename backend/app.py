from fastapi import FastAPI, BackgroundTasks, HTTPException
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

app = FastAPI(title="League Item Efficiency Tracker - Cached Edition")

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
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


async def _current_patch():
    """Patch of the latest ETL run, used to gate stale AI caches."""
    meta = await metadata_collection.find_one({'_id': 'latest'})
    return (meta or {}).get('patch')

# ETL Scheduler instance
etl_scheduler = None


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
    etl_scheduler = ETLScheduler(MONGO_URI)
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
async def get_items(force_refresh: bool = False):
    """
    Get all items from MongoDB cache
    
    Args:
        force_refresh: If True, triggers ETL pipeline to fetch fresh data
        
    Returns:
        Dict with items array
    """
    # Force refresh if requested
    if force_refresh:
        print("🔄 Force refresh requested, running ETL...")
        try:
            await run_etl_now(MONGO_URI)
            print("✅ Force refresh complete")
        except Exception as e:
            print(f"❌ Force refresh failed: {e}")
            raise HTTPException(status_code=500, detail=f"ETL refresh failed: {str(e)}")
    
    # Fetch from MongoDB
    items = await items_collection.find(
        {'isDeprecated': False, 'imageValidated': True},
        {'_id': 0}  # Exclude MongoDB _id from response
    ).to_list(length=None)
    
    return {"items": items}


@app.post("/api/items/refresh")
async def refresh_items(background_tasks: BackgroundTasks):
    """
    Force refresh items from DDragon API (runs ETL pipeline)
    Returns immediately and runs ETL in background
    """
    # Run ETL in background to avoid timeout
    background_tasks.add_task(run_etl_now, MONGO_URI)
    
    return {
        "message": "ETL pipeline started in background",
        "status": "processing",
        "note": "Check /api/metadata for completion status"
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
    doc = await ai_collection.find_one({'_id': item_id}, {'_id': 0})
    patch = await _current_patch()
    if doc and doc.get('patch') == patch:
        return {'status': 'ready', **doc}
    return {'status': 'pending', 'configured': ai_is_configured()}


@app.get("/api/research")
async def get_research():
    """The current patch's AI research digest (outliers, effect spotlights,
    experimental builds). 'pending' until enrichment has run for this patch."""
    doc = await ai_collection.find_one({'_id': 'research_digest'}, {'_id': 0})
    patch = await _current_patch()
    if doc and doc.get('patch') == patch:
        return {'status': 'ready', **doc}
    return {'status': 'pending', 'configured': ai_is_configured(), 'patch': patch}


@app.get("/api/champions")
async def get_champions():
    """Compact champion reference data (name, tags, resource, range, spells).
    Used to ground the AI 'Best on' feature; also handy for debugging."""
    champions = await champions_collection.find({}, {'_id': 0}).to_list(length=None)
    return {'champions': champions, 'count': len(champions)}


@app.post("/api/ai/refresh")
async def refresh_ai(background_tasks: BackgroundTasks):
    """Trigger AI enrichment in the background (mirrors /api/items/refresh).
    No-ops gracefully if GEMINI_API_KEY is unset or quota is exhausted."""
    if not ai_is_configured():
        return {'status': 'skipped', 'reason': 'GEMINI_API_KEY not set'}
    background_tasks.add_task(run_ai_enrichment, MONGO_URI)
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


@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    # Check MongoDB connection
    try:
        await mongo_client.admin.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Check cache
    item_count = await items_collection.count_documents({})
    
    # Get last update info
    metadata = await metadata_collection.find_one({'_id': 'latest'})
    last_update = metadata.get('lastUpdated') if metadata else None
    
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

