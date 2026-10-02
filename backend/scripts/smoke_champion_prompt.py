"""
Fixture test for the champion itemization prompt (no network).
Run: python test_champion_prompt.py
"""

from ai.prompts import build_champion_prompt, _base_stat_table

CHAMPION = {
    "_id": "Jinx", "name": "Jinx", "tags": ["Marksman"], "resource": "Mana",
    "rangeType": "ranged", "passive": "Get Excited!",
    "spells": ["Switcheroo!", "Zap!", "Flame Chompers!", "Super Mega Death Rocket!"],
    "info": {"attack": 9, "defense": 2, "magic": 4, "difficulty": 6},
}

BUILD_ITEMS = [
    {"id": "3031", "name": "Infinity Edge", "cost": 3450, "tags": ["CriticalStrike", "Damage"],
     "description": "<b>Massively enhances critical strikes</b>"},
    {"id": "3094", "name": "Rapid Firecannon", "cost": 2600, "tags": ["AttackSpeed"],
     "description": "Energized attacks gain range"},
    {"id": "3036", "name": "Lord Dominik's Regards", "cost": 3000, "tags": ["ArmorPenetration"],
     "description": "Armor penetration vs tanks"},
]


COMPONENTS = [
    {"id": "1038", "name": "B. F. Sword", "cost": 1300, "tags": ["Damage"], "into": ["3031"],
     "statBreakdown": {"FlatPhysicalDamageMod": {"amount": 40}}},
    {"id": "1018", "name": "Cloak of Agility", "cost": 600, "tags": ["CriticalStrike"], "into": ["3094"],
     "statBreakdown": {"PercentCritChanceMod": {"amount": 0.15}}},
]


def main():
    prompt = build_champion_prompt(CHAMPION, BUILD_ITEMS, COMPONENTS, "16.11.1")

    assert _base_stat_table() in prompt, "STAT_VALUES table must be embedded"
    # champion kit grounding
    assert "Jinx" in prompt
    assert "Marksman" in prompt and "ranged" in prompt
    assert "Super Mega Death Rocket!" in prompt, "spell names must be present"
    # both rosters' ids the model must pick from
    for it in BUILD_ITEMS + COMPONENTS:
        assert it["id"] in prompt, f"roster id missing: {it['id']}"
    assert "<b>" not in prompt, "item effect HTML must be stripped"
    # component "builds toward" grounding (B.F. Sword -> Infinity Edge)
    assert "-> Infinity Edge" in prompt, "component should show what it builds toward"
    # stat summary present (B.F. Sword -> "40 AD")
    assert "40 AD" in prompt, "item stats should be summarized from statBreakdown"
    # strict JSON + the v3 shape
    assert "STRICT JSON" in prompt
    for key in ["coreBuild", "progression", "situational", "experimental", "economy"]:
        assert key in prompt, f"contract key missing: {key}"

    print("[SUCCESS] champion prompt v3 is component-aware (progression + stats), strict-JSON")


if __name__ == "__main__":
    main()
