"""Gold efficiency: the value of an item's base stats, priced from reference
items, divided by its cost. Effects (passives, actives) are not priced."""

import pytest

from efficiency import STAT_VALUES, calculate_efficiency, parse_stats_from_description
from tests.conftest import make_item


def test_reference_item_is_exactly_100_percent(long_sword):
    # Long Sword defines the price of attack damage: 10 AD for 350 gold.
    result = calculate_efficiency(long_sword)
    assert result["totalGoldValue"] == 350
    assert result["goldEfficiency"] == 100.0


@pytest.mark.parametrize(
    "name, cost, stats",
    [
        ("Amplifying Tome", 400, {"FlatMagicDamageMod": 20}),
        ("Cloth Armor", 300, {"FlatArmorMod": 15}),
        ("Null-Magic Mantle", 400, {"FlatSpellBlockMod": 20}),
        ("Ruby Crystal", 400, {"FlatHPPoolMod": 150}),
        ("Boots", 300, {"FlatMovementSpeedMod": 25}),
    ],
)
def test_reference_items_price_their_own_stat(name, cost, stats):
    result = calculate_efficiency(make_item(1, name, cost, stats))
    assert result["goldEfficiency"] == pytest.approx(100.0, abs=0.5)


def test_value_is_the_sum_of_each_priced_stat():
    item = make_item(2, "Two stats", 1000, {"FlatPhysicalDamageMod": 20, "FlatHPPoolMod": 150})
    result = calculate_efficiency(item)
    expected = 20 * STAT_VALUES["FlatPhysicalDamageMod"] + 150 * STAT_VALUES["FlatHPPoolMod"]
    assert result["totalGoldValue"] == pytest.approx(expected, abs=0.01)
    assert set(result["statBreakdown"]) == {"FlatPhysicalDamageMod", "FlatHPPoolMod"}


def test_percent_stats_arrive_as_decimals():
    # Data Dragon sends 25% attack speed as 0.25.
    item = make_item(3, "Dagger-like", 625, {"PercentAttackSpeedMod": 0.25})
    assert calculate_efficiency(item)["totalGoldValue"] == 625


def test_unpriced_stats_are_ignored_not_guessed():
    item = make_item(4, "Mystery", 500, {"SomeFutureStatMod": 99})
    result = calculate_efficiency(item)
    assert result["totalGoldValue"] == 0
    assert result["statBreakdown"] == {}


def test_effects_are_not_priced(liandrys):
    # Known limit of the model: the passive contributes nothing to the number,
    # so an effect-heavy item reads below 100%.
    result = calculate_efficiency(liandrys)
    assert result["totalGoldValue"] == pytest.approx(60 * 20 + 300 * 2.666667, abs=0.01)
    assert result["goldEfficiency"] < 100


def test_zero_cost_does_not_divide_by_zero():
    item = make_item(5, "Free", 0, {"FlatPhysicalDamageMod": 10})
    result = calculate_efficiency(item)
    assert result["cost"] == 1
    assert result["goldEfficiency"] > 0


def test_input_item_is_not_mutated(long_sword):
    before = dict(long_sword["stats"])
    calculate_efficiency(long_sword)
    assert long_sword["stats"] == before


class TestStatsFromDescription:
    """Ability Haste and base regeneration appear only in description text."""

    def test_ability_haste(self):
        assert parse_stats_from_description("<stats>20 Ability Haste</stats>") == {"AbilityHaste": 20}

    def test_base_health_regen_becomes_a_decimal(self):
        assert parse_stats_from_description("100% Base Health Regen") == {"FlatHPRegenMod": 1.0}

    def test_base_mana_regen_becomes_a_decimal(self):
        assert parse_stats_from_description("50% Base Mana Regen") == {"FlatMPRegenMod": 0.5}

    def test_empty_description(self):
        assert parse_stats_from_description("") == {}
        assert parse_stats_from_description(None) == {}

    def test_parsed_stat_does_not_override_the_stats_field(self):
        item = make_item(6, "Both", 1000, {"AbilityHaste": 10}, "15 Ability Haste")
        assert calculate_efficiency(item)["statBreakdown"]["AbilityHaste"]["amount"] == 10

    def test_haste_in_description_is_priced(self):
        item = make_item(7, "Glowing Mote", 250, {}, "<stats>5 Ability Haste</stats>")
        assert calculate_efficiency(item)["goldEfficiency"] == 100.0


    def test_numbers_inside_a_passive_are_not_priced(self):
        description = (
            "<mainText><stats>40 Attack Damage</stats><br>"
            "<passive>Surge</passive> Takedowns grant 20 Ability Haste for 6 seconds.</mainText>"
        )
        assert parse_stats_from_description(description) == {}

    def test_haste_in_the_stats_section_is_still_read(self):
        description = (
            "<mainText><stats>40 Attack Damage<br>15 Ability Haste</stats><br>"
            "<passive>Surge</passive> Takedowns grant 20 Ability Haste for 6 seconds.</mainText>"
        )
        assert parse_stats_from_description(description) == {"AbilityHaste": 15}
