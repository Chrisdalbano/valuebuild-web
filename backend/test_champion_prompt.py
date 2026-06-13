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


def main():
    prompt = build_champion_prompt(CHAMPION, BUILD_ITEMS, "16.11.1")

    assert _base_stat_table() in prompt, "STAT_VALUES table must be embedded"
    # champion kit grounding
    assert "Jinx" in prompt
    assert "Marksman" in prompt and "ranged" in prompt
    assert "Super Mega Death Rocket!" in prompt, "spell names must be present"
    # roster ids the model must pick from
    for it in BUILD_ITEMS:
        assert it["id"] in prompt, f"roster id missing: {it['id']}"
    assert "<b>" not in prompt, "item effect HTML must be stripped"
    # strict JSON + the focused-MVP shape
    assert "STRICT JSON" in prompt
    for key in ["coreBuild", "buildPath", "situational", "experimental", "economy"]:
        assert key in prompt, f"contract key missing: {key}"

    print("[SUCCESS] champion prompt is grounded (kit + roster) and strict-JSON")


if __name__ == "__main__":
    main()
