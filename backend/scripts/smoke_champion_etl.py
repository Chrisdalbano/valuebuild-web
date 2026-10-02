"""
Fixture-based test for the champion ETL transform (no network, no MongoDB).
Run: python test_champion_etl.py
"""

from etl.champion_pipeline import ChampionETL

# trimmed championFull.json entry shape
AATROX = {
    "id": "Aatrox",
    "key": "266",
    "name": "Aatrox",
    "tags": ["Fighter", "Tank"],
    "partype": "Blood Well",
    "stats": {"attackrange": 175, "hp": 650},
    "passive": {"name": "Deathbringer Stance", "description": "<b>passive html</b>"},
    "spells": [
        {"name": "The Darkin Blade", "description": "<b>q html</b>"},
        {"name": "Infernal Chains"},
        {"name": "Umbral Dash"},
        {"name": "World Ender"},
    ],
    "info": {"attack": 8, "defense": 4, "magic": 3, "difficulty": 4},
}

CAITLYN = {
    "id": "Caitlyn", "key": "51", "name": "Caitlyn", "tags": ["Marksman"],
    "partype": "Mana", "stats": {"attackrange": 650},
    "passive": {"name": "Headshot"}, "spells": [{"name": "Piltover Peacemaker"}],
    "info": {"attack": 8, "defense": 2, "magic": 2, "difficulty": 6},
}


def main():
    doc = ChampionETL.transform(AATROX, "16.11.1")

    assert doc["_id"] == "Aatrox", doc["_id"]
    assert doc["key"] == "266"
    assert doc["tags"] == ["Fighter", "Tank"]
    assert doc["resource"] == "Blood Well"
    assert doc["rangeType"] == "melee", "175 range should be melee"
    assert doc["attackRange"] == 175
    assert doc["passive"] == "Deathbringer Stance"
    assert doc["spells"] == ["The Darkin Blade", "Infernal Chains", "Umbral Dash", "World Ender"]
    assert doc["info"]["attack"] == 8
    assert doc["patch"] == "16.11.1"
    # compactness: no spell tooltips / html leaked through
    blob = str(doc)
    assert "html" not in blob, "spell/passive tooltip text must not be stored"
    assert "description" not in blob

    ranged = ChampionETL.transform(CAITLYN, "16.11.1")
    assert ranged["rangeType"] == "ranged", "650 range should be ranged"

    print("[SUCCESS] champion transform produces the compact grounding doc")


if __name__ == "__main__":
    main()
