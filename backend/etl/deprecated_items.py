"""
Deprecated items filter for ETL pipeline
Matches the frontend logic in utils/deprecatedItems.js
"""

# Known deprecated items that should NEVER be included
DEPRECATED_ITEM_IDS = {
    # Mythic Items (Season 2023 and earlier)
    '3152',  # Hextech Rocketbelt
    '4633',  # Riftmaker
    '4636',  # Night Harvester
    '6653',  # Liandry's Anguish (Mythic)
    '3001',  # Evenshroud (Mythic)
    '4005',  # Imperial Mandate
    '2065',  # Shurelya's Battlesong (Mythic)
    '3190',  # Locket of the Iron Solari (Mythic)
    '6617',  # Moonstone Renewer
    '6630',  # Goredrinker
    '6631',  # Stridebreaker
    '6632',  # Divine Sunderer
    '6691',  # Duskblade of Draktharr (Mythic)
    '6692',  # Eclipse (Mythic)
    '6693',  # Prowler's Claw
    '3068',  # Sunfire Aegis (Mythic)
    '6664',  # Turbo Chemtank
    '4644',  # Crown of the Shattered Queen
    '3146',  # Hextech Gunblade (removed)
    '3030',  # Hextech GLP-800 (removed)
    '3092',  # Frost Queen's Claim (removed)
    '3401',  # Face of the Mountain (removed)
    '3069',  # Abyssal Mask (old version)
}

# Arena mode item ID prefixes (these are special game mode items, not for Summoner's Rift)
ARENA_MODE_PREFIXES = ['663', '664', '665', '666', '667', '668']

DEPRECATED_KEYWORDS = [
    'mythic',
    'removed',
    'deprecated',
    'old',
    'legacy'
]


def is_item_deprecated(item):
    """
    Check if an item is deprecated and should not be included
    
    Args:
        item: Dict with item data from DDragon API
        
    Returns:
        bool: True if item is deprecated
    """
    if not item or 'id' not in item:
        return True
    
    item_id = str(item['id'])
    
    # Check if it's an Arena mode item (IDs starting with 663, 664, etc.)
    if any(item_id.startswith(prefix) for prefix in ARENA_MODE_PREFIXES):
        return True
    
    # Check ID against blacklist
    if item_id in DEPRECATED_ITEM_IDS:
        return True
    
    # Check description for deprecated keywords
    description = (item.get('description', '') or '').lower()
    if any(keyword in description for keyword in DEPRECATED_KEYWORDS):
        return True
    
    # Check name for deprecated keywords
    name = (item.get('name', '') or '').lower()
    if any(keyword in name for keyword in DEPRECATED_KEYWORDS):
        return True
    
    return False

