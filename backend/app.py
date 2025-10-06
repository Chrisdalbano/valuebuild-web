from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uvicorn
import asyncio
import os

# Import ETL pipeline
from etl.data_pipeline import ETLScheduler, run_etl_now

app = FastAPI(title="League Item Efficiency Tracker - Cached Edition")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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

