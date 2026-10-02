"""Which items the champion analysis may recommend as finished build targets."""

from ai.enrich import _is_tier3_boots, select_build_items

BASIC_BOOTS = {"id": "1001", "name": "Boots", "cost": 300, "tags": ["Boots"], "from": [], "into": ["3006", "3111"]}
TIER_TWO = {"id": "3006", "name": "Berserker's Greaves", "cost": 1100, "tags": ["Boots"], "from": ["1001", "1042"], "into": ["3172"]}
TIER_THREE = {"id": "3172", "name": "Gunmetal Greaves", "cost": 1600, "tags": ["Boots"], "from": ["3006"], "into": []}
COMPONENT = {"id": "3134", "name": "Serrated Dirk", "cost": 1000, "tags": ["Damage"], "from": ["1036", "1036"], "into": ["3142"]}
LEGENDARY = {"id": "3142", "name": "Youmuu's Ghostblade", "cost": 2800, "tags": ["Damage"], "from": ["3134", "1037"], "into": []}
SUPPORT = {"id": "3869", "name": "Celestial Opposition", "cost": 400, "tags": ["GoldPer"], "from": ["3867"], "into": []}


def ids(items):
    return [it["id"] for it in items]


def test_tier_two_boots_are_kept_and_tier_three_dropped():
    # Bug: the rule "skip anything that still upgrades" dropped tier-two boots
    # (they upgrade into tier three) and let the tier-three upgrades through,
    # so the suggestions named boots nobody buys directly.
    pool = select_build_items([BASIC_BOOTS, TIER_TWO, TIER_THREE])
    assert ids(pool) == ["3006"]


def test_tier_three_boots_are_recognised_by_their_recipe():
    assert _is_tier3_boots(TIER_THREE)
    assert not _is_tier3_boots(TIER_TWO)
    assert not _is_tier3_boots(BASIC_BOOTS)
    assert not _is_tier3_boots(LEGENDARY)


def test_components_and_basic_items_are_not_build_targets():
    pool = select_build_items([BASIC_BOOTS, COMPONENT, LEGENDARY])
    assert ids(pool) == ["3142"]


def test_support_income_items_are_excluded():
    assert select_build_items([SUPPORT]) == []


def test_pool_is_ordered_most_expensive_first():
    pool = select_build_items([TIER_TWO, LEGENDARY])
    assert ids(pool) == ["3142", "3006"]


def test_free_or_costless_items_are_excluded():
    free = dict(LEGENDARY, id="1", cost=0)
    assert select_build_items([free]) == []
