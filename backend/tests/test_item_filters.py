"""Which Data Dragon items the ETL keeps. Several of these are regression tests
for bugs that shipped; each says what went wrong."""

import pytest

from etl.deprecated_items import DEPRECATED_ITEM_IDS, DEPRECATED_KEYWORDS, is_item_deprecated
from etl.item_filters import REMOVED_NAME_KEYWORDS, is_eligible_item
from tests.conftest import make_item

# Former Mythic items that are still purchasable on Summoner's Rift.
FORMER_MYTHICS_STILL_IN_GAME = {
    "3152": "Hextech Rocketbelt",
    "4633": "Riftmaker",
    "6653": "Liandry's Torment",
    "2065": "Shurelya's Battlesong",
    "3190": "Locket of the Iron Solari",
    "6617": "Moonstone Renewer",
    "6631": "Stridebreaker",
    "3068": "Sunfire Aegis",
}


class TestRegressions:
    @pytest.mark.parametrize("item_id, name", FORMER_MYTHICS_STILL_IN_GAME.items())
    def test_former_mythics_still_in_the_game_are_kept(self, item_id, name):
        # Bug: the first removed-item blacklist listed every former Mythic,
        # including these, so the tool silently dropped items players buy.
        item = make_item(item_id, name, 3000, {"FlatHPPoolMod": 300})
        assert item_id not in DEPRECATED_ITEM_IDS
        assert not is_item_deprecated(item)
        assert is_eligible_item(item)

    def test_old_is_not_a_removal_keyword(self):
        # Bug: "old" was a removal keyword and matched as a substring.
        assert "old" not in DEPRECATED_KEYWORDS
        assert "old" not in REMOVED_NAME_KEYWORDS

    def test_text_containing_gold_does_not_remove_an_item(self):
        # The same bug from the outside: "gold" contains "old".
        item = make_item(
            3041,
            "Golden Example",
            1500,
            {"FlatMagicDamageMod": 20},
            "Gain 20 gold whenever you score a takedown. Enemies behold your power.",
        )
        assert not is_item_deprecated(item)
        assert is_eligible_item(item)

    def test_kraken_slayer_is_not_mistaken_for_an_arena_item(self):
        # Bug: Arena copies were filtered by id prefix alone, and 6672 starts
        # with the Arena prefix 667. Arena ids are longer, so length is checked.
        kraken = make_item(6672, "Kraken Slayer", 3100, {"FlatPhysicalDamageMod": 45})
        assert not is_item_deprecated(kraken)
        assert is_item_deprecated(make_item(667056, "Arena copy", 3100, {"FlatPhysicalDamageMod": 45}))

    def test_guardians_line_is_filtered_but_guardian_angel_is_kept(self):
        # Data Dragon marks the ARAM "Guardian's" starters as available on
        # Summoner's Rift, so the map flag alone is not enough.
        horn = make_item(2051, "Guardian's Horn", 950, {"FlatHPPoolMod": 150})
        unlisted = make_item(9999, "Guardian's Amulet", 950, {"FlatHPPoolMod": 150})
        angel = make_item(3026, "Guardian Angel", 3200, {"FlatPhysicalDamageMod": 55})
        assert not is_eligible_item(horn)
        assert not is_eligible_item(unlisted)
        assert is_item_deprecated(unlisted)
        assert is_eligible_item(angel)
        assert not is_item_deprecated(angel)


class TestEligibility:
    def test_ordinary_item_is_kept(self, long_sword):
        assert is_eligible_item(long_sword)

    def test_item_not_on_summoners_rift_is_dropped(self, long_sword):
        long_sword["maps"] = {"11": False, "12": True}
        assert not is_eligible_item(long_sword)

    def test_unpurchasable_item_is_dropped(self, long_sword):
        long_sword["gold"]["purchasable"] = False
        assert not is_eligible_item(long_sword)

    def test_free_item_is_dropped(self, long_sword):
        long_sword["gold"]["total"] = 0
        assert not is_eligible_item(long_sword)

    def test_blacklisted_id_is_dropped(self):
        assert not is_eligible_item(make_item(3146, "Hextech Gunblade", 3400, {"FlatMagicDamageMod": 80}))

    @pytest.mark.parametrize("item_id", ["223094", "326672", "443071", "883031", "993089"])
    def test_game_mode_copies_are_dropped(self, item_id):
        assert not is_eligible_item(make_item(item_id, "Mode copy", 3000, {"FlatPhysicalDamageMod": 40}))

    @pytest.mark.parametrize("item_id", ["2200", "3222", "4401"])
    def test_four_digit_ids_with_the_same_prefix_are_kept(self, item_id):
        assert is_eligible_item(make_item(item_id, "Regular", 3000, {"FlatPhysicalDamageMod": 40}))

    def test_effect_only_item_is_kept(self):
        item = make_item(3340, "Effect only", 500, {}, "Active: places a ward that reveals the area.")
        assert is_eligible_item(item)

    def test_item_with_no_stats_and_no_effect_is_dropped(self):
        assert not is_eligible_item(make_item(1, "Empty", 500, {}, "short"))

    def test_mythic_in_description_is_dropped(self):
        item = make_item(1, "Leftover", 3000, {"FlatHPPoolMod": 300}, "Mythic Passive: grants bonus stats.")
        assert not is_eligible_item(item)

    def test_missing_fields_do_not_raise(self):
        assert not is_eligible_item({})
        assert is_item_deprecated({})
        assert is_item_deprecated(None)
