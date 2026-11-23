"""TFT static data: trimming Community Dragon's file and pricing items in
components. Fixtures are shaped like the real file, cut down. No network."""

import pytest

from tft.economy import ECONOMY, economy_for
from tft.item_value import component_rates, price_item
from tft.static_data import SetCache, asset_url, current_set_key, fill, plain, trim_set


def component(api, name, **effects):
    return {"apiName": api, "name": name, "composition": [], "effects": effects, "desc": "", "icon": None}


COMPONENTS = [
    component("TFT_Item_BFSword", "B.F. Sword", AD=0.10000000149011612),
    component("TFT_Item_NeedlesslyLargeRod", "Needlessly Large Rod", AP=10.0),
    component("TFT_Item_GiantsBelt", "Giant's Belt", Health=150.0),
    component("TFT_Item_SparringGloves", "Sparring Gloves", CritChance=20.0),
    component("TFT_Item_Spatula", "Spatula", **{"{fe9818ef}": 5.0}),
]


def completed(api, name, parts, **effects):
    return {
        "apiName": api,
        "name": name,
        "composition": parts,
        "effects": effects,
        "desc": "Gain @BonusDamage*100@% damage.<br><tftitemrules>@Missing@ rule</tftitemrules>",
        "icon": "ASSETS/Maps/TFT/Icons/Items/Hexcore/TFT_Item_X.TFT_Set13.tex",
    }


DEATHBLADE = completed(
    "TFT_Item_Deathblade", "Deathblade", ["TFT_Item_BFSword", "TFT_Item_BFSword"],
    AD=0.550000011920929, BonusDamage=0.1, **{"{1543aa48}": 0.1},
)
INFINITY_EDGE = completed(
    "TFT_Item_InfinityEdge", "Infinity Edge", ["TFT_Item_BFSword", "TFT_Item_SparringGloves"],
    AD=0.3499999940395355, CritChance=35.0, CritDamageToGive=None,
)
CROWN = completed(
    "TFT_Item_ForceOfNature", "Tactician's Crown", ["TFT_Item_Spatula", "TFT_Item_Spatula"],
    MaxArmySizeIncrease=1.0,
)


def champion(api, name, cost, traits, hp=700.0):
    return {
        "apiName": api, "name": name, "cost": cost, "traits": traits,
        "tileIcon": f"ASSETS/Characters/{api}/{api}_Square.tex", "ability": {"name": "Spell"},
        "stats": {"hp": hp, "damage": 50.0, "attackSpeed": 0.75, "armor": 40.0, "magicResist": 40.0,
                  "mana": 60.0, "initialMana": 0, "range": 1.0, "critChance": 0.25,
                  "critMultiplier": 1.399999976158142},
    }


def raw_file(set_key="18"):
    return {
        "items": COMPONENTS + [DEATHBLADE, INFINITY_EDGE, CROWN,
                               completed("TFT9_Item_Old", "Old item", ["TFT_Item_BFSword", "TFT_Item_BFSword"], AD=1.0)],
        "sets": {
            "17": {"name": "Set17", "champions": [champion("TFT17_Old", "Old", 1, ["Gone"])], "traits": []},
            set_key: {
                "name": "Set10",  # the file's internal label, not the public name
                "champions": [
                    champion("DA_18_Ahri", "Ahri", 4, ["Blossom", "Spellweaver"]),
                    champion("DA_18_Ornn", "Ornn", 1, ["Blossom"]),
                    champion("DA_Lux18_Base", "Lux", 5, ["Avatar"]),
                    champion("DA_18_Lux_Coven", "Lux (Coven)", 5, ["Coven", "Avatar"]),
                    champion("TFT_Krug", "Krug", 1, []),  # PvE: no traits
                    champion("TFT_ArmoryKey", "Anvil", 8, []),
                ],
                "traits": [
                    {"apiName": "DA_18_Blossom", "name": "Blossom", "icon": "a/b.tex",
                     "effects": [{"minUnits": 3, "maxUnits": 4, "style": 1},
                                 {"minUnits": 5, "maxUnits": 25000, "style": 3}]},
                    {"apiName": "DA_18_Rival", "name": "Spellweaver", "icon": None,
                     "effects": [{"minUnits": 1, "maxUnits": 25000, "style": 5},
                                 {"minUnits": 1, "maxUnits": 1, "style": 1},
                                 {"minUnits": 2, "maxUnits": 25000, "style": 5}]},
                    {"apiName": "DA_18_Unused", "name": "Unused", "icon": None,
                     "effects": [{"minUnits": 2, "maxUnits": 25000, "style": 1}]},
                ],
            },
        },
        "setData": [{"number": int(set_key), "mutator": f"TFTSet{set_key}",
                     "items": [i["apiName"] for i in COMPONENTS] + ["TFT_Item_Deathblade", "TFT_Item_InfinityEdge",
                                                                    "TFT_Item_ForceOfNature"]}],
    }


def test_rates_come_from_the_components_themselves():
    rates = component_rates(COMPONENTS)
    assert rates["AD"] == {"perComponent": 0.1, "component": "TFT_Item_BFSword", "componentName": "B.F. Sword"}
    assert rates["Health"]["perComponent"] == 150
    # Spatula grants no priced stat, so it sets no rate.
    assert set(rates) == {"AD", "AP", "Health", "CritChance"}


def test_a_component_changed_by_a_patch_changes_the_rate():
    buffed = [component("TFT_Item_BFSword", "B.F. Sword", AD=0.15)]
    assert price_item(DEATHBLADE, component_rates(buffed))["statComponents"] == pytest.approx(3.6667, abs=1e-4)


def test_deathblade_is_five_and_a_half_swords_for_the_price_of_two():
    priced = price_item(DEATHBLADE, component_rates(COMPONENTS))
    assert priced["statComponents"] == 5.5
    assert priced["componentsSpent"] == 2
    assert priced["statEfficiency"] == 275.0
    # Effect variables are listed as unpriced; hashed keys are dropped.
    assert priced["unpricedEffects"] == ["BonusDamage"]


def test_two_stats_add_and_null_values_are_ignored():
    priced = price_item(INFINITY_EDGE, component_rates(COMPONENTS))
    # 35% AD is 3.5 swords, 35% crit is 1.75 gloves.
    assert [round(line["components"], 2) for line in priced["statBreakdown"]] == [3.5, 1.75]
    assert priced["statComponents"] == 5.25
    assert priced["statEfficiency"] == 262.5


def test_an_item_with_no_priced_stats_reads_zero_not_an_error():
    priced = price_item(CROWN, component_rates(COMPONENTS))
    assert priced["statComponents"] == 0
    assert priced["statEfficiency"] == 0.0
    assert priced["unpricedEffects"] == ["MaxArmySizeIncrease"]


def test_two_components_are_one_hundred_percent_by_definition():
    plain_pair = completed("TFT_Item_X", "Plain", ["TFT_Item_BFSword", "TFT_Item_GiantsBelt"], AD=0.1, Health=150.0)
    assert price_item(plain_pair, component_rates(COMPONENTS))["statEfficiency"] == 100.0


def test_trim_keeps_the_live_set_playable_units_and_standard_items():
    data = trim_set(raw_file(), patch="16.23", fetched_at="2026-11-23T00:00:00+00:00")
    assert current_set_key(raw_file()) == "18"
    assert data["set"] == {"number": 18, "name": "Enchanted Wilds"}
    assert [unit["name"] for unit in data["units"]] == ["Ornn", "Ahri", "Lux", "Lux (Coven)"]
    assert {unit["name"]: unit["variantOf"] for unit in data["units"]}["Lux (Coven)"] == "Lux"
    assert data["units"][0]["variantOf"] is None
    # Stats are carried over, with the game's 32-bit float noise rounded off.
    assert data["units"][1]["stats"]["critMultiplier"] == 1.4
    assert data["units"][1]["stats"]["ad"] == 50
    # Only traits a playable unit has; duplicate breakpoints collapse.
    assert [trait["name"] for trait in data["traits"]] == ["Blossom", "Spellweaver"]
    assert [tier["units"] for tier in data["traits"][0]["breakpoints"]] == [3, 5]
    assert [tier["units"] for tier in data["traits"][1]["breakpoints"]] == [1, 2]
    # Items: only standard two-component items that belong to the live set.
    assert [item["name"] for item in data["items"]] == ["Deathblade", "Infinity Edge", "Tactician's Crown"]
    assert data["items"][0]["statEfficiency"] == 275.0
    assert {c["id"] for c in data["components"]} == {"TFT_Item_BFSword", "TFT_Item_SparringGloves", "TFT_Item_Spatula"}
    assert data["economy"]["verified"] is True


def test_item_text_fills_known_variables_and_never_invents_missing_ones():
    data = trim_set(raw_file())
    assert data["items"][0]["text"] == "Gain 10% damage.\n… rule"
    assert fill("@A@ and @B*100@", {"A": 2.0, "B": 0.155}) == "2 and 15.5"
    assert plain("<b>Bold</b>&nbsp;%i:scaleAD% text<br><br><br>next") == "Bold text\nnext"


def test_asset_urls_follow_community_dragons_rule():
    assert asset_url("ASSETS/UX/TraitIcons/Trait_Icon_18_Brawler.tex") == (
        "https://raw.communitydragon.org/latest/game/assets/ux/traiticons/trait_icon_18_brawler.png"
    )
    assert asset_url(None) is None and asset_url("None") is None


def test_a_set_the_constants_were_not_checked_for_is_flagged():
    assert economy_for(18)["verified"] is True
    unknown = economy_for(19)
    assert unknown["verified"] is False
    assert "set 18, not set 19" in unknown["note"]
    assert trim_set(raw_file("19"))["set"]["name"] == "Set 19"
    assert trim_set(raw_file("19"))["economy"]["verified"] is False


def test_shop_odds_rows_sum_to_one_hundred_and_tables_line_up():
    for number, economy in ECONOMY.items():
        for level, row in economy["shopOdds"].items():
            assert sum(row) == 100, f"set {number} level {level}"
            assert len(row) == len(economy["poolSize"])
        # An XP entry exists for every level that can still level up.
        levels = sorted(int(level) for level in economy["shopOdds"])
        assert [int(level) for level in economy["xpToNext"]] == levels[1:-1]
        assert economy["copiesPerStar"] == [1, 3, 9]
        for source in economy["sources"].values():
            assert source["url"].startswith("https://") and source["checked"]


def test_set_cache_fetches_once_and_keeps_the_last_good_copy():
    now = [0.0]
    calls = []

    def fetch():
        calls.append(now[0])
        if len(calls) == 2:
            raise RuntimeError("CDN down")
        return {"n": len(calls)}

    cache = SetCache(ttl_seconds=100, fetch=fetch, clock=lambda: now[0])
    assert cache.get() == {"n": 1}
    assert cache.get() == {"n": 1} and len(calls) == 1  # fresh: no second fetch
    now[0] = 150
    assert cache.get() == {"n": 1} and len(calls) == 2  # refresh failed: old copy kept
    now[0] = 200
    assert cache.get() == {"n": 1} and len(calls) == 2  # backing off
    now[0] = 500
    assert cache.get() == {"n": 3}
