import requests
import json

# Data Dragon endpoint (latest version)
DDRAGON_BASE = "https://ddragon.leagueoflegends.com"
LATEST_VERSION_URL = f"{DDRAGON_BASE}/api/versions.json"

def get_latest_version():
    """Get the latest League of Legends version"""
    try:
        response = requests.get(LATEST_VERSION_URL)
        versions = response.json()
        return versions[0]  # First version is the latest
    except Exception as e:
        print(f"Error fetching version: {e}")
        return "14.20.1"  # Fallback version

def fetch_items():
    """Fetch all items from Riot Data Dragon API"""
    version = get_latest_version()
    items_url = f"{DDRAGON_BASE}/cdn/{version}/data/en_US/item.json"
    
    try:
        response = requests.get(items_url)
        data = response.json()
        items_data = data.get("data", {})
        
        # Convert to list format with proper structure
        items_list = []
        for item_id, item_info in items_data.items():
            # Skip special items, consumables without stats, etc.
            if should_include_item(item_info):
                item_info["id"] = item_id
                items_list.append(item_info)
        
        print(f"Fetched {len(items_list)} items from version {version}")
        return items_list
    
    except Exception as e:
        print(f"Error fetching items: {e}")
        return []

def should_include_item(item):
    """Determine if an item should be included in the analysis"""
    # Exclude items that are:
    # - Not available in Classic SR 5v5 (map 11)
    # - Not purchasable in shop
    # - Consumables without stats
    # - Trinkets
    # - Special event items
    
    name = item.get("name", "")
    gold = item.get("gold", {})
    maps_data = item.get("maps", {})
    stats = item.get("stats", {})
    
    # Must be available on Summoner's Rift (map ID "11")
    if not maps_data.get("11", False):
        return False
    
    # Must be purchasable
    if not gold.get("purchasable", False):
        return False
    
    # Must have a total cost > 0
    if gold.get("total", 0) <= 0:
        return False
    
    # Include if it has any stats OR is a completed item with effects
    if stats or gold.get("total", 0) >= 1000:
        return True
    
    return False

