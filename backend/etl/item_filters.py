"""
Eligibility rules for the item ETL.

`is_eligible_item` decides whether a raw Data Dragon item belongs in the tool:
purchasable on Summoner's Rift, not a special game-mode copy, not removed.
It is a pure function of the item dict so it can be tested without MongoDB or
the network. `DDragonETL.should_include_item` delegates to it.
"""

from typing import Dict

from etl.deprecated_items import DEPRECATED_ITEM_IDS

SUMMONERS_RIFT_MAP_ID = "11"

# Keywords that mark an item as gone. "old" is deliberately absent: as a
# substring it matches "gold", which appears in ordinary item text.
REMOVED_NAME_KEYWORDS = ("removed", "mythic", "deprecated", "legacy")

# Game-mode copies of regular items reuse the 4-digit id with a 2-digit prefix
# (for example 223094 or 326672). Regular items have ids of 4 digits or fewer.
GAME_MODE_ID_PREFIXES = ("22", "32", "44", "88", "99")

MIN_EFFECT_DESCRIPTION_LENGTH = 20


def is_eligible_item(item: Dict) -> bool:
    """True when a raw Data Dragon item should be loaded into the catalog."""
    name = item.get("name", "")
    gold = item.get("gold", {})
    maps_data = item.get("maps", {})
    stats = item.get("stats", {})
    item_id = str(item.get("id", ""))
    description = item.get("description", "")

    if item_id in DEPRECATED_ITEM_IDS:
        return False

    if "mythic" in description.lower():
        return False

    name_lower = name.lower()
    if any(keyword in name_lower for keyword in REMOVED_NAME_KEYWORDS):
        return False

    # ARAM-exclusive "Guardian's X" line. Data Dragon marks these as available
    # on Summoner's Rift. "Guardian Angel" has no apostrophe-s, so it is kept.
    if name_lower.startswith("guardian's "):
        return False

    if len(item_id) >= 5 and item_id.startswith(GAME_MODE_ID_PREFIXES):
        return False

    if not maps_data.get(SUMMONERS_RIFT_MAP_ID, False):
        return False

    if not gold.get("purchasable", False):
        return False

    if gold.get("total", 0) <= 0:
        return False

    # Keep anything with stats, or with a real effect description.
    return bool(stats) or bool(
        description and len(description) > MIN_EFFECT_DESCRIPTION_LENGTH
    )
