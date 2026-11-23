"""
TFT economy constants: shop odds, pool sizes, XP and the fixed prices.

These are set-specific and Riot changes them between sets and sometimes
between patches, so each table is stored per set with where it came from and
the day it was checked. `economy_for` hands back the tables for the requested
set when they were checked for it; for any other set it hands back the most
recent tables marked `verified: False`, and the interface says so instead of
presenting old numbers as current.

Checked on 2026-11-23 for set 18 (Enchanted Wilds, patch 18.7).
"""

from copy import deepcopy
from typing import Dict

CHECKED = "2026-11-23"

SOURCES = {
    "shopOdds": {
        "label": "Riot Data Dragon, tft-shop-drop-rates-data.json (16.23.1)",
        "url": "https://ddragon.leagueoflegends.com/cdn/16.23.1/data/en_US/tft-shop-drop-rates-data.json",
        "checked": CHECKED,
    },
    "poolSize": {
        "label": "Community Dragon game data, map22 TFTSet18 shop bags; League Wiki agrees",
        "url": "https://raw.communitydragon.org/latest/game/data/maps/shipping/map22/map22.bin.json",
        "checked": CHECKED,
    },
    "xpToNext": {
        "label": "League Wiki, TFT:Experience; levels 8 to 10 match Riot patch notes 16.1 and 16.4",
        "url": "https://wiki.leagueoflegends.com/en-us/TFT:Experience",
        "checked": CHECKED,
    },
    "prices": {
        "label": "League Wiki, TFT:Champion and TFT:Gold (reroll 2 gold, 5 shop slots, 4 gold for 4 XP, interest 1 per 10 up to 5)",
        "url": "https://wiki.leagueoflegends.com/en-us/TFT:Gold",
        "checked": CHECKED,
    },
    "starScaling": {
        "label": "League Wiki, TFT:Champion (2-star: 180% health, 150% attack damage; armor and magic resist multiply damage by 100 / (100 + value))",
        "url": "https://wiki.leagueoflegends.com/en-us/TFT:Champion",
        "checked": CHECKED,
    },
    "wisps": {
        "label": "Riot, Enchanted Wilds overview: a Wisp takes the rightmost slot in every other shop",
        "url": "https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/enchanted-wilds-overview/",
        "checked": CHECKED,
    },
}

ECONOMY: Dict[int, dict] = {
    18: {
        "set": 18,
        "setName": "Enchanted Wilds",
        # Percent chance per shop slot of a 1, 2, 3, 4, 5-cost unit, by level.
        "shopOdds": {
            "1": [100, 0, 0, 0, 0],
            "2": [100, 0, 0, 0, 0],
            "3": [75, 25, 0, 0, 0],
            "4": [55, 30, 15, 0, 0],
            "5": [45, 33, 20, 2, 0],
            "6": [30, 40, 25, 5, 0],
            "7": [19, 30, 40, 10, 1],
            "8": [15, 20, 32, 30, 3],
            "9": [10, 17, 25, 33, 15],
            "10": [5, 10, 20, 40, 25],
        },
        # Copies of each unit in the shared pool, by cost.
        "poolSize": [30, 25, 18, 10, 9],
        # XP to go from level N to N+1. Level 2 is automatic.
        "xpToNext": {"2": 2, "3": 6, "4": 10, "5": 20, "6": 36, "7": 60, "8": 68, "9": 68},
        "xpPurchase": {"gold": 4, "xp": 4},
        "rerollCost": 2,
        "shopSlots": 5,
        # Unit slots per shop, repeating. Set 18: a Wisp takes one slot in
        # every other shop.
        "slotPattern": [5, 4],
        "slotPatternNote": "Set 18 Wisps take the rightmost slot in every other shop.",
        "copiesPerStar": [1, 3, 9],
        "starScaling": {"hp": 1.8, "ad": 1.5},
        "interest": {"per": 10, "cap": 5},
        # Units whose shop behaviour the pool model does not describe.
        "unmodelled": ["Lux"],
        "sources": SOURCES,
    }
}


def economy_for(set_number: int) -> dict:
    """Constants for a set. `verified` is False when they were checked for a
    different set than the one asked for."""
    if set_number in ECONOMY:
        economy = deepcopy(ECONOMY[set_number])
        economy["verified"] = True
        economy["note"] = (
            f"Checked for set {set_number} ({economy['setName']}) on {CHECKED}."
        )
        return economy
    latest = max(ECONOMY)
    economy = deepcopy(ECONOMY[latest])
    economy["verified"] = False
    economy["note"] = (
        f"These constants were checked for set {latest}, not set {set_number}. "
        "Shop odds, pool sizes and XP can differ; treat the results as approximate "
        "until they are checked for the live set."
    )
    return economy
