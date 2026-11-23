"""
What are a TFT item's listed stats worth?

League's formula prices each stat from a reference item (a Long Sword is
35 gold per attack damage). TFT has no gold price for items, so the unit of
account is the component: every completed item costs exactly two of them.

Each of the eight stat components grants one stat, and that defines the rate
(a B.F. Sword is one component for 10% attack damage, so 55% attack damage on
Deathblade is 5.5 components of stats for the price of 2).

    stat components = sum(stat amount / amount one component grants)
    stat efficiency = stat components / components spent * 100

The rates are read from the set data on every refresh, never typed in here,
so a patch that changes a component changes the rates with it.

What this does not price: the item's effect. Variables that are not one of the
eight component stats are listed as unpriced, exactly as passives are on the
League side. A low number means an effect-heavy item, not a bad one.
"""

from typing import Dict, Iterable, List, Optional

# Community Dragon effect keys for the stat each component grants, with the
# label shown in the interface and how the amount is written.
PRICED_STATS: Dict[str, Dict[str, str]] = {
    "AD": {"label": "Attack damage", "unit": "percent_fraction"},
    "AP": {"label": "Ability power", "unit": "flat"},
    "AS": {"label": "Attack speed", "unit": "percent"},
    "Armor": {"label": "Armor", "unit": "flat"},
    "MagicResist": {"label": "Magic resist", "unit": "flat"},
    "Health": {"label": "Health", "unit": "flat"},
    "CritChance": {"label": "Critical chance", "unit": "percent"},
    "ManaRegen": {"label": "Mana regen", "unit": "flat"},
}


def _number(value) -> Optional[float]:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    if value != value or value in (float("inf"), float("-inf")):
        return None
    # The game data stores 32-bit floats (0.10000000149); four places is exact
    # for every stat amount and keeps the output readable.
    return round(float(value), 4)


def component_rates(components: Iterable[dict]) -> Dict[str, dict]:
    """Rate table from the components themselves: stat key -> the amount one
    component grants and which component sets it. A component that grants no
    priced stat (Spatula, Frying Pan) sets no rate."""
    rates: Dict[str, dict] = {}
    for component in components:
        priced = [
            (key, _number(amount))
            for key, amount in (component.get("effects") or {}).items()
            if key in PRICED_STATS
        ]
        priced = [(key, amount) for key, amount in priced if amount and amount > 0]
        if len(priced) != 1:
            continue
        key, amount = priced[0]
        if key not in rates:
            rates[key] = {
                "perComponent": amount,
                "component": component.get("apiName"),
                "componentName": component.get("name"),
            }
    return rates


def price_item(item: dict, rates: Dict[str, dict]) -> dict:
    """Stat breakdown for one item, in components."""
    breakdown: List[dict] = []
    unpriced: List[str] = []
    for key, raw in (item.get("effects") or {}).items():
        amount = _number(raw)
        if key in rates and amount is not None and amount > 0:
            breakdown.append(
                {
                    "key": key,
                    "label": PRICED_STATS[key]["label"],
                    "unit": PRICED_STATS[key]["unit"],
                    "amount": amount,
                    "components": round(amount / rates[key]["perComponent"], 4),
                }
            )
        elif not key.startswith("{"):
            # Hashed keys are unnamed in the game data and say nothing useful.
            unpriced.append(key)
    spent = len(item.get("composition") or [])
    total = round(sum(entry["components"] for entry in breakdown), 4)
    return {
        "statBreakdown": breakdown,
        "statComponents": total,
        "componentsSpent": spent,
        "statEfficiency": round(total / spent * 100, 1) if spent else None,
        "unpricedEffects": sorted(unpriced),
    }
