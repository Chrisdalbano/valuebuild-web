"""Shared fixtures. Items are shaped like Data Dragon's item.json entries, cut
down to the fields the backend reads. No network or database is used."""

import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def make_item(item_id, name, total, stats=None, description="", **extra):
    """A minimal Data Dragon item available and purchasable on Summoner's Rift."""
    item = {
        "id": str(item_id),
        "name": name,
        "description": description,
        "gold": {"total": total, "purchasable": True},
        "maps": {"11": True, "12": True},
        "stats": stats or {},
        "tags": [],
    }
    item.update(extra)
    return item


@pytest.fixture
def long_sword():
    return make_item(1036, "Long Sword", 350, {"FlatPhysicalDamageMod": 10})


@pytest.fixture
def liandrys():
    return make_item(
        6653,
        "Liandry's Torment",
        3000,
        {"FlatMagicDamageMod": 60, "FlatHPPoolMod": 300},
        "<mainText><stats>60 Ability Power<br>300 Health</stats><br><passive>Torment</passive> "
        "Dealing damage with Abilities causes enemies to burn.</mainText>",
    )
