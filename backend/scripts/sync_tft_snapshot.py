"""Refresh the TFT snapshot the frontend bundles.

    cd backend && python -m scripts.sync_tft_snapshot

Fetches the live set from Community Dragon (no Riot key), trims and prices it
exactly as GET /api/tft/set does, and writes
gold-league/src/data/tft.snapshot.json. Run it when a TFT patch or set lands,
then check tft/economy.py still describes the live set.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tft.static_data import fetch_set  # noqa: E402

TARGET = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "gold-league",
    "src",
    "data",
    "tft.snapshot.json",
)


def main() -> None:
    data = fetch_set()
    with open(TARGET, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, separators=(",", ":"))
        handle.write("\n")
    economy = data["economy"]
    print(
        f"Set {data['set']['number']} ({data['set']['name']}), patch {data['patch']}: "
        f"{len(data['units'])} units, {len(data['traits'])} traits, {len(data['items'])} items."
    )
    print(f"Economy constants verified for this set: {economy['verified']}. {economy['note']}")
    print(f"Wrote {TARGET} ({os.path.getsize(TARGET):,} bytes)")


if __name__ == "__main__":
    main()
