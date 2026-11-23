"""
Review of one player's own recent TFT games: what their decisions looked like
when a game went well against when it did not.

Only the reviewed player's own row of each match is read. Other participants
are never looked at, stored or returned: Riot's TFT policy forbids scouting
opponents, and the point here is the player's own choices.

Everything in `summarise_match` and `compare_outcomes` is a pure function of
Riot's published tft-match-v1 shapes, so it is tested without a key.

Field names follow the MatchDto schema (info.participants[].placement, level,
gold_left, last_round, units[].character_id / tier / itemNames,
traits[].tier_current / style).
"""

from statistics import mean
from typing import Dict, Iterable, List, Optional

RANKED_QUEUE = 1100  # RANKED_TFT in Riot's queue list


def _participant(match: dict, puuid: str) -> Optional[dict]:
    for participant in (match.get("info") or {}).get("participants") or []:
        if participant.get("puuid") == puuid:
            return participant
    return None


def summarise_match(match: dict, puuid: str, static: dict) -> Optional[dict]:
    """One game, reduced to the reviewed player's end state. None when the
    player is not in the match or the row has no placement."""
    me = _participant(match, puuid)
    if not me or not isinstance(me.get("placement"), int):
        return None
    info = match.get("info") or {}
    costs: Dict[str, int] = {unit["id"].lower(): unit["cost"] for unit in static.get("units", [])}
    component_ids = {component["id"] for component in static.get("components", [])}
    copies = (static.get("economy") or {}).get("copiesPerStar") or [1, 3, 9]
    reroll = (static.get("economy") or {}).get("rerollCost") or 2

    board_gold = 0
    unknown_units = 0
    stars = {1: 0, 2: 0, 3: 0}
    completed = loose_components = full_carries = 0
    for unit in me.get("units") or []:
        tier = unit.get("tier") if isinstance(unit.get("tier"), int) else 1
        tier = max(1, min(tier, len(copies)))
        stars[min(tier, 3)] += 1
        cost = costs.get(str(unit.get("character_id", "")).lower())
        if cost is None:
            unknown_units += 1
        else:
            board_gold += cost * copies[tier - 1]
        items = [name for name in unit.get("itemNames") or [] if isinstance(name, str)]
        parts = sum(1 for name in items if name in component_ids)
        loose_components += parts
        completed += len(items) - parts
        if len(items) >= 3:
            full_carries += 1

    traits = [t for t in me.get("traits") or [] if (t.get("tier_current") or 0) > 0]
    gold_left = me.get("gold_left") if isinstance(me.get("gold_left"), int) else 0
    return {
        "matchId": (match.get("metadata") or {}).get("match_id"),
        "playedAt": info.get("game_datetime"),
        "set": info.get("tft_set_number"),
        "queue": info.get("queue_id", info.get("queueId")),
        "placement": me["placement"],
        "topFour": me["placement"] <= 4,
        "level": me.get("level") if isinstance(me.get("level"), int) else None,
        "lastRound": me.get("last_round"),
        "goldLeft": gold_left,
        "rerollsUnspent": gold_left // reroll,
        "boardGold": board_gold,
        "unknownUnits": unknown_units,
        "units": len(me.get("units") or []),
        "twoStars": stars[2],
        "threeStars": stars[3],
        "completedItems": completed,
        "looseComponents": loose_components,
        "fullCarries": full_carries,
        "activeTraits": len(traits),
        "topTraitStyle": max((t.get("style") or 0 for t in traits), default=0),
    }


# The decisions compared, with the question each one answers.
METRICS = [
    ("goldLeft", "Gold unspent at the end", "Did you die holding gold you could have rolled?"),
    ("boardGold", "Gold on the final board", "How much did the board you finished with cost?"),
    ("level", "Final level", "Did you level further in the games that went well?"),
    ("twoStars", "Two-star units", "How upgraded was the board?"),
    ("threeStars", "Three-star units", "Did rerolling for three-stars pay?"),
    ("completedItems", "Completed items", "How many finished items were on units?"),
    ("looseComponents", "Components left unbuilt", "Were components sitting uncombined on units?"),
    ("fullCarries", "Units holding three items", "Did you stack one carry or spread items?"),
    ("activeTraits", "Active traits", "Deep in a few traits, or spread across many?"),
]


def _average(games: Iterable[dict], key: str) -> Optional[float]:
    values = [game[key] for game in games if isinstance(game.get(key), (int, float))]
    return round(mean(values), 2) if values else None


def compare_outcomes(games: List[dict]) -> dict:
    """Averages of each decision in top-four games against bottom-four games.
    A difference is reported only when both groups have games in them."""
    top = [game for game in games if game["topFour"]]
    bottom = [game for game in games if not game["topFour"]]
    rows = []
    for key, label, question in METRICS:
        top_avg, bottom_avg = _average(top, key), _average(bottom, key)
        rows.append(
            {
                "key": key,
                "label": label,
                "question": question,
                "topFour": top_avg,
                "bottomFour": bottom_avg,
                "difference": (
                    round(top_avg - bottom_avg, 2)
                    if top_avg is not None and bottom_avg is not None
                    else None
                ),
            }
        )
    placements = [game["placement"] for game in games]
    return {
        "games": len(games),
        "topFourGames": len(top),
        "bottomFourGames": len(bottom),
        "averagePlacement": round(mean(placements), 2) if placements else None,
        "placements": [placements.count(place) for place in range(1, 9)],
        "decisions": rows,
        "goldLeftInBottomFour": sum(game["goldLeft"] for game in bottom),
        "rerollsUnspentInBottomFour": sum(game["rerollsUnspent"] for game in bottom),
    }


def build_review(matches: List[dict], puuid: str, static: dict, ranked_only: bool = True) -> dict:
    games = []
    for match in matches:
        summary = summarise_match(match, puuid, static)
        if not summary:
            continue
        if ranked_only and summary["queue"] != RANKED_QUEUE:
            continue
        games.append(summary)
    games.sort(key=lambda game: game.get("playedAt") or 0, reverse=True)
    live_set = (static.get("set") or {}).get("number")
    return {
        "summary": compare_outcomes(games),
        "games": games,
        "otherSets": sum(1 for game in games if game["set"] != live_set),
        "note": (
            "Calculated from the end state of your own row in each match. "
            "A difference between your better and worse games is a pattern "
            "to look at, not proof of cause, and a handful of games is a "
            "small sample."
        ),
    }
