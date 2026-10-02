"""
No-network test for the "Best on" prompt builder.
Run: python test_best_on.py
"""

from ai.prompts import build_best_on_prompt, _base_stat_table

ITEM = {
    "name": "Spirit Visage",
    "cost": 2700,
    "statBreakdown": {"FlatHPPoolMod": {}, "FlatSpellBlockMod": {}, "AbilityHaste": {}},
    "description": "<passive>Increases all healing and regeneration by 25%.</passive>",
}

ROSTER = [
    {"name": "Dr. Mundo", "tags": ["Tank", "Fighter"], "rangeType": "melee"},
    {"name": "Aatrox", "tags": ["Fighter"], "rangeType": "melee"},
    {"name": "Caitlyn", "tags": ["Marksman"], "rangeType": "ranged"},
]


def main():
    prompt = build_best_on_prompt(ITEM, ROSTER, "16.11.1")

    # grounded in the real base-stat values
    assert _base_stat_table() in prompt, "STAT_VALUES table must be embedded"
    # roster names are present so the model picks real champions
    for c in ROSTER:
        assert c["name"] in prompt, f"roster name missing: {c['name']}"
    # the item + its effect text made it in (html stripped)
    assert "Spirit Visage" in prompt
    assert "healing and regeneration" in prompt
    assert "<passive>" not in prompt, "effect HTML must be stripped"
    # strict JSON + honesty guardrails
    assert "STRICT JSON" in prompt
    assert "champions" in prompt and "synergyStat" in prompt
    assert "canonical efficiency" in prompt, "must forbid restating efficiency"

    print("[SUCCESS] best-on prompt is grounded (stats + roster) and strict-JSON")


if __name__ == "__main__":
    main()
