"""
Static TFT set data from Community Dragon. No Riot API key is involved.

Community Dragon publishes one large file with every set; `trim_set` cuts it
down to the live set's playable units, traits, components and craftable items
and prices the items (see item_value.py). The result is what the frontend
bundles as its snapshot and what GET /api/tft/set serves.
"""

import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional

import requests

from .economy import economy_for
from .item_value import PRICED_STATS, component_rates, price_item

CDRAGON_BASE = "https://raw.communitydragon.org/latest"
CDRAGON_TFT_URL = f"{CDRAGON_BASE}/cdragon/tft/en_us.json"
CDRAGON_VERSION_URL = f"{CDRAGON_BASE}/content-metadata.json"

# The standard items shared by every set are published under this prefix.
STANDARD_ITEM_PREFIX = "TFT_Item_"


def asset_url(path: Optional[str]) -> Optional[str]:
    """Community Dragon serves game textures as PNG at the lower-cased path."""
    if not path or not isinstance(path, str) or path == "None":
        return None
    path = re.sub(r"\.(tex|dds)$", ".png", path.strip().lower())
    return f"{CDRAGON_BASE}/game/{path}"


def current_set_key(raw: dict) -> str:
    """The highest numbered set in the file is the live one."""
    keys = [key for key in (raw.get("sets") or {}) if str(key).isdigit()]
    if not keys:
        raise ValueError("No numbered sets in the TFT data")
    return max(keys, key=int)


def plain(text: Optional[str]) -> str:
    """Item text without markup or icon placeholders."""
    if not text:
        return ""
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]*>", "", text)
    text = re.sub(r"%i:[A-Za-z0-9_]+%", "", text)
    text = re.sub(r"@TFTUnitProperty[^@]*@", "", text)
    text = text.replace("&nbsp;", " ")
    text = re.sub(r"[ \t]+", " ", text)
    return re.sub(r"\n\s*\n+", "\n", text).strip()


def fill(text: str, effects: dict) -> str:
    """Resolve @Variable@ and @Variable*100@ from an item's own effects.
    A variable the data does not name is left as an ellipsis, not guessed."""

    def swap(match):
        name, factor = match.group(1), match.group(2)
        value = effects.get(name)
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return "…"
        value = value * float(factor) if factor else value
        return f"{value:.2f}".rstrip("0").rstrip(".")

    return re.sub(r"@([A-Za-z0-9_]+)(?:\*([0-9.]+))?@", swap, text)


def _unit(champion: dict) -> dict:
    stats = champion.get("stats") or {}

    def stat(key):
        value = stats.get(key)
        return float(value) if isinstance(value, (int, float)) else 0.0

    return {
        "id": champion["apiName"],
        "name": champion.get("name") or champion["apiName"],
        "cost": int(champion["cost"]),
        "traits": list(champion.get("traits") or []),
        "icon": asset_url(champion.get("tileIcon") or champion.get("squareIcon")),
        "ability": (champion.get("ability") or {}).get("name") or "",
        "stats": {
            "hp": stat("hp"),
            "ad": stat("damage"),
            "attackSpeed": round(stat("attackSpeed"), 4),
            "armor": stat("armor"),
            "magicResist": stat("magicResist"),
            "mana": stat("mana"),
            "initialMana": stat("initialMana"),
            "range": stat("range"),
            "critChance": round(stat("critChance"), 4),
            "critMultiplier": round(stat("critMultiplier"), 4),
        },
    }


def _trait(trait: dict) -> dict:
    tiers = []
    for effect in trait.get("effects") or []:
        minimum = effect.get("minUnits")
        if isinstance(minimum, int) and minimum > 0:
            tiers.append({"units": minimum, "style": effect.get("style") or 0})
    tiers.sort(key=lambda tier: tier["units"])
    unique: List[dict] = []
    for tier in tiers:  # some traits list the same breakpoint twice
        if not unique or unique[-1]["units"] != tier["units"]:
            unique.append(tier)
    return {
        "id": trait["apiName"],
        "name": trait.get("name") or trait["apiName"],
        "icon": asset_url(trait.get("icon")),
        "breakpoints": unique,
    }


def trim_set(raw: dict, patch: Optional[str] = None, fetched_at: Optional[str] = None) -> dict:
    """The live set, cut down to what the interface uses, with items priced."""
    key = current_set_key(raw)
    live = raw["sets"][key]
    mutator = next(
        (
            entry
            for entry in raw.get("setData") or []
            if str(entry.get("number")) == key and entry.get("mutator") == f"TFTSet{key}"
        ),
        {},
    )
    set_items = set(mutator.get("items") or [])
    catalog: Dict[str, dict] = {
        item["apiName"]: item for item in raw.get("items") or [] if item.get("apiName")
    }

    units = [
        _unit(champion)
        for champion in live.get("champions") or []
        if champion.get("traits")
        and isinstance(champion.get("cost"), int)
        and 1 <= champion["cost"] <= 7
        and champion.get("apiName")
    ]
    units.sort(key=lambda unit: (unit["cost"], unit["name"]))
    # "Lux (Coven)" style entries are forms of one unit, not extra pool units.
    names = {unit["name"] for unit in units}
    for unit in units:
        match = re.match(r"^(.+?) \((.+)\)$", unit["name"])
        unit["variantOf"] = match.group(1) if match and match.group(1) in names else None
    used_traits = {name for unit in units for name in unit["traits"]}
    traits = [
        trait
        for trait in (_trait(entry) for entry in live.get("traits") or [])
        if trait["name"] in used_traits and trait["breakpoints"]
    ]
    traits.sort(key=lambda trait: trait["name"])

    completed = [
        item
        for item in catalog.values()
        if item["apiName"].startswith(STANDARD_ITEM_PREFIX)
        and len(item.get("composition") or []) == 2
        and (not set_items or item["apiName"] in set_items)
        and all(part in catalog for part in item["composition"])
    ]
    component_ids = sorted({part for item in completed for part in item["composition"]})
    components = [catalog[part] for part in component_ids]
    rates = component_rates(components)

    economy = economy_for(int(key))

    def shape(item: dict, is_component: bool) -> dict:
        effects = {
            name: round(float(value), 4)
            for name, value in (item.get("effects") or {}).items()
            if isinstance(value, (int, float)) and not isinstance(value, bool)
        }
        record = {
            "id": item["apiName"],
            "name": item.get("name") or item["apiName"],
            "icon": asset_url(item.get("icon")),
            "text": fill(plain(item.get("desc")), effects),
        }
        if is_component:
            granted = [name for name in effects if name in PRICED_STATS]
            record["stat"] = granted[0] if len(granted) == 1 else None
            record["amount"] = effects.get(record["stat"]) if record["stat"] else None
        else:
            record["composition"] = list(item["composition"])
            record.update(price_item(item, rates))
        return record

    return {
        # The file's own set name is an internal label; the public name comes
        # from the economy table when the set is one that was checked.
        "set": {"number": int(key), "name": economy.get("setName") if economy["verified"] else f"Set {key}"},
        "patch": patch,
        "fetchedAt": fetched_at or datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": CDRAGON_TFT_URL,
        "units": units,
        "traits": traits,
        "components": [shape(item, True) for item in components],
        "items": sorted(
            (shape(item, False) for item in completed), key=lambda item: item["name"]
        ),
        "statRates": {
            name: {**rate, **PRICED_STATS[name]} for name, rate in sorted(rates.items())
        },
        "economy": economy,
    }


def fetch_patch(timeout: float = 20) -> Optional[str]:
    """Game version Community Dragon's `latest` was built from, e.g. 16.23."""
    try:
        version = requests.get(CDRAGON_VERSION_URL, timeout=timeout).json().get("version", "")
        match = re.match(r"(\d+\.\d+)", version)
        return match.group(1) if match else None
    except Exception:
        return None


def fetch_set(timeout: float = 90) -> dict:
    response = requests.get(CDRAGON_TFT_URL, timeout=timeout)
    response.raise_for_status()
    return trim_set(response.json(), patch=fetch_patch())


class SetCache:
    """Keeps the trimmed set in memory. The source file is about 24 MB, so it
    is fetched at most once per `ttl`; a failed refresh keeps serving the last
    good copy and waits before asking the CDN again."""

    def __init__(self, ttl_seconds: float = 6 * 3600, fetch=fetch_set, clock=time.monotonic):
        self.ttl_seconds = ttl_seconds
        self._fetch = fetch
        self._clock = clock
        self._value: Optional[dict] = None
        self._loaded_at: Optional[float] = None
        self._failed_at: Optional[float] = None

    def get(self) -> Optional[dict]:
        now = self._clock()
        fresh = self._loaded_at is not None and now - self._loaded_at < self.ttl_seconds
        backing_off = self._failed_at is not None and now - self._failed_at < 300
        if fresh or backing_off:
            return self._value
        try:
            self._value = self._fetch()
            self._loaded_at = now
            self._failed_at = None
        except Exception as error:
            print(f"TFT set refresh failed: {error}")
            self._failed_at = now
        return self._value
