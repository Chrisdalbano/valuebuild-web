from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from riot_client import fetch_items
from efficiency import calculate_efficiency
import uvicorn

app = FastAPI(title="League Item Efficiency Tracker")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache for items data
items_cache = None

@app.get("/")
def root():
    return {"message": "League Item Efficiency Tracker API"}

@app.get("/api/items")
def get_items():
    """Fetch and return all items with calculated gold efficiency"""
    global items_cache
    
    # Use cache if available, otherwise fetch
    if items_cache is None:
        raw_items = fetch_items()
        items_cache = [calculate_efficiency(item) for item in raw_items]
    
    return {"items": items_cache}

@app.post("/api/items/refresh")
def refresh_items():
    """Force refresh items from Riot API"""
    global items_cache
    raw_items = fetch_items()
    items_cache = [calculate_efficiency(item) for item in raw_items]
    return {"message": "Items refreshed", "count": len(items_cache)}

@app.get("/api/items/{item_id}")
def get_item(item_id: str):
    """Get a specific item by ID"""
    global items_cache
    
    if items_cache is None:
        raw_items = fetch_items()
        items_cache = [calculate_efficiency(item) for item in raw_items]
    
    item = next((item for item in items_cache if str(item["id"]) == item_id), None)
    
    if item is None:
        return {"error": "Item not found"}, 404
    
    return item

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

