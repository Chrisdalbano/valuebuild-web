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

# Known deprecated items that should never be included (Mythics, removed items, etc.)
DEPRECATED_ITEMS = {
    # Mythic items (removed in Season 2024)
    '3152',  # Hextech Rocketbelt
    '4633',  # Riftmaker
    '4636',  # Night Harvester
    '6653',  # Liandry's Anguish (old Mythic version)
    '3001',  # Evenshroud (old Mythic)
    '4005',  # Imperial Mandate
    '2065',  # Shurelya's Battlesong (old Mythic)
    '3190',  # Locket of the Iron Solari (old Mythic)
    '6617',  # Moonstone Renewer (old Mythic)
    '6630',  # Goredrinker
    '6631',  # Stridebreaker
    '6632',  # Divine Sunderer
    '6691',  # Duskblade of Draktharr (old Mythic)
    '6692',  # Eclipse (old Mythic)
    '6693',  # Prowler's Claw
    '3068',  # Sunfire Aegis (old Mythic)
    '6664',  # Turbo Chemtank
    '4644',  # Crown of the Shattered Queen
    '3152',  # Hextech Gunblade (removed)
    '3146',  # Hextech Gunblade
    # Add more as discovered
}

def should_include_item(item):
    """Determine if an item should be included in the analysis"""
    # Exclude items that are:
    # - Not available in Classic SR 5v5 (map 11)
    # - Not purchasable in shop
    # - Consumables without stats
    # - Trinkets
    # - Special event items
    # - Arena mode duplicates (IDs starting with 32, 22, 44, etc.)
    # - Known deprecated/mythic items
    
    name = item.get("name", "")
    gold = item.get("gold", {})
    maps_data = item.get("maps", {})
    stats = item.get("stats", {})
    item_id = str(item.get("id", ""))
    description = item.get("description", "")
    tags = item.get("tags", [])
    
    # Check against deprecated items blacklist
    if item_id in DEPRECATED_ITEMS:
        return False
    
    # Exclude items with "mythic" in description or tags
    if "mythic" in description.lower():
        return False
    
    # Exclude items with specific keywords indicating deprecated status
    deprecated_keywords = ["removed", "mythic", "deprecated", "old", "legacy"]
    name_lower = name.lower()
    if any(keyword in name_lower for keyword in deprecated_keywords):
        return False
    
    # Exclude Arena mode items (they have special ID prefixes)
    # Arena items typically have IDs like 323110 (instead of 3110)
    # These are duplicates with modified stats for Arena mode
    # Also exclude old/outdated versions (5+ digit IDs that aren't in current meta)
    if len(item_id) >= 5 and (
        item_id.startswith("22") or 
        item_id.startswith("32") or 
        item_id.startswith("44") or
        item_id.startswith("88") or
        item_id.startswith("99")
    ):
        return False
    
    # Must be available on Summoner's Rift (map ID "11")
    if not maps_data.get("11", False):
        return False
    
    # Must be purchasable
    if not gold.get("purchasable", False):
        return False
    
    # Must have a total cost > 0
    if gold.get("total", 0) <= 0:
        return False
    
    # Include if it has any stats OR effects (description)
    # This ensures items like Sheen (effect-based) are included
    if stats or (description and len(description) > 20):
        return True
    
    return False

