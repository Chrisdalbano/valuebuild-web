"""
Deprecated items filter for ETL pipeline
Matches the frontend logic in utils/deprecatedItems.js
"""

# Known deprecated items that should NEVER be included
# Only includes items that are truly unavailable on Summoner's Rift
DEPRECATED_ITEM_IDS = {
    # Truly deprecated/removed items (NOT available on Summoner's Rift)
    '4636',  # Night Harvester (not on SR)
    '3001',  # Evenshroud (not on SR)
    '4005',  # Imperial Mandate (not on SR)
    '6632',  # Divine Sunderer (not on SR)
    '6691',  # Duskblade of Draktharr (not on SR)
    '6692',  # Eclipse (not on SR)
    '6693',  # Prowler's Claw (not on SR)
    '6664',  # Turbo Chemtank (not on SR)
    '6630',  # Goredrinker (confirmed not on SR)
    '4644',  # Crown of the Shattered Queen (confirmed not on SR)
    '3146',  # Hextech Gunblade (removed from game)
    '3030',  # Hextech GLP-800 (removed from game)
    '3092',  # Frost Queen's Claim (removed from game)
    '3401',  # Face of the Mountain (removed from game)
    '3069',  # Abyssal Mask (old version)

    # ARAM-exclusive "Guardian's" starter line. DDragon (wrongly) marks these
    # maps.11=true and they're structurally identical to Doran's items, so the
    # only reliable filter is this curated list + the name-prefix guard below.
    # (3026 "Guardian Angel" is a legit SR legendary — NOT in this list.)
    '2051',  # Guardian's Horn (ARAM)
    '3112',  # Guardian's Orb (ARAM)
    '3177',  # Guardian's Blade (ARAM)
    '3184',  # Guardian's Hammer (ARAM)

    # NOTE: The following items ARE available on SR and were removed from this list:
    # '3152' - Hextech Rocketbelt (available on SR)
    # '4633' - Riftmaker (available on SR)
    # '6653' - Liandry's Torment (available on SR)
    # '2065' - Shurelya's Battlesong (available on SR)
    # '3190' - Locket of the Iron Solari (available on SR)
    # '6617' - Moonstone Renewer (available on SR)
    # '6631' - Stridebreaker (available on SR)
    # '3068' - Sunfire Aegis (available on SR)
}

# Arena mode item ID prefixes (these are special game mode items, not for Summoner's Rift)
ARENA_MODE_PREFIXES = ['663', '664', '665', '666', '667', '668']

DEPRECATED_KEYWORDS = [
    'mythic',
    'removed',
    'deprecated',
    'legacy'
]

# NOTE: Removed 'old' keyword as it causes false positives
# (e.g., "Gain X gold" contains "gold", items with "old" in flavor text)


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
    # Arena items have 5+ digit IDs, regular items have 4 digits
    # Example: 663056 (Arena) vs 6630 (Regular item)
    if len(item_id) >= 5 and any(item_id.startswith(prefix) for prefix in ARENA_MODE_PREFIXES):
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

    # ARAM-exclusive "Guardian's X" line (safety net for future additions).
    # Note: "Guardian Angel" has no apostrophe-s, so it is not matched.
    if name.startswith("guardian's "):
        return True

    return False

