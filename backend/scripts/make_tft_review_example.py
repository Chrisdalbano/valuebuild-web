"""Write the example the review page can show when no key is configured.

    cd backend && python -m scripts.make_tft_review_example

The games are invented, seeded and labelled as an example everywhere they are
shown. They are run through the same tft/review.py code as real matches, so
the example always has the shape and arithmetic of a real review. Uses the
bundled snapshot; no network and no Riot key.
"""

import json
import os
import random
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from tft.review import RANKED_QUEUE, build_review  # noqa: E402

DATA = os.path.join(os.path.dirname(ROOT), "gold-league", "src", "data")
PUUID = "example-player"


def main() -> None:
    with open(os.path.join(DATA, "tft.snapshot.json"), encoding="utf-8") as handle:
        static = json.load(handle)
    rng = random.Random(18)
    units = [unit for unit in static["units"] if not unit["variantOf"]]
    components = [c["id"] for c in static["components"] if c["stat"]]
    items = [item["id"] for item in static["items"] if item["statBreakdown"]]
    matches = []
    for index, placement in enumerate([2, 6, 4, 7, 1, 5, 3, 8, 4, 6, 2, 5]):
        good = placement <= 4
        level = rng.choice([8, 9, 9] if good else [7, 8, 8])
        board = []
        for unit in rng.sample(units, level):
            tier = 2 if rng.random() < (0.75 if good else 0.5) else 1
            if unit["cost"] <= 2 and rng.random() < (0.25 if good else 0.1):
                tier = 3
            board.append({"character_id": unit["id"], "tier": tier, "itemNames": [], "rarity": unit["cost"] - 1})
        for carry in board[: (2 if good else 3)]:
            carry["itemNames"] = rng.sample(items, 3 if good else 2)
        if not good:
            board[3]["itemNames"] = rng.sample(components, rng.choice([1, 2]))
        traits = [
            {"name": name, "num_units": 2, "tier_current": 1, "tier_total": 3, "style": 1}
            for name in sorted({trait for unit in board for trait in static_traits(static, unit["character_id"])})[
                : (6 if good else 8)
            ]
        ]
        matches.append(
            {
                "metadata": {"match_id": f"EXAMPLE_{index + 1}"},
                "info": {
                    "game_datetime": 1763856000000 - index * 3_600_000,
                    "queue_id": RANKED_QUEUE,
                    "tft_set_number": static["set"]["number"],
                    "participants": [
                        {
                            "puuid": PUUID,
                            "placement": placement,
                            "level": level,
                            "gold_left": rng.randint(0, 6) if good else rng.randint(4, 34),
                            "last_round": 36 if good else 30,
                            "units": board,
                            "traits": traits,
                        }
                    ],
                },
            }
        )
    review = {"status": "example", "riotId": "Example#TFT", **build_review(matches, PUUID, static)}
    target = os.path.join(DATA, "tft.review.example.json")
    with open(target, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(review, handle, ensure_ascii=False, indent=1)
        handle.write("\n")
    print(f"Wrote {target}: {review['summary']['games']} invented games")


def static_traits(static, unit_id):
    return next(unit["traits"] for unit in static["units"] if unit["id"] == unit_id)


if __name__ == "__main__":
    main()
