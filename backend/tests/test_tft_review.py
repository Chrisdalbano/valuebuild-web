"""The key-gated match review, tested without a key: fixtures follow Riot's
published tft-match-v1 schema, and the HTTP layer is replaced. No real request
is made and no real key is used anywhere in this file."""

import asyncio

import pytest

from tft import routes
from tft.review import RANKED_QUEUE, build_review, compare_outcomes, summarise_match
from tft.riot_api import ReviewCache, RiotClient, RiotError, configuration

ME, OTHER = "puuid-me", "puuid-other"

STATIC = {
    "set": {"number": 18},
    "units": [
        {"id": "DA_18_Ahri", "cost": 4},
        {"id": "DA_18_Ornn", "cost": 1},
        {"id": "DA_18_Kennen", "cost": 5},
    ],
    "components": [{"id": "TFT_Item_BFSword"}, {"id": "TFT_Item_GiantsBelt"}],
    "economy": {"copiesPerStar": [1, 3, 9], "rerollCost": 2},
}


def unit(character, tier=1, items=()):
    return {"character_id": character, "tier": tier, "itemNames": list(items), "rarity": 0}


def match(placement, gold_left=0, level=8, units=(), traits=(), queue=RANKED_QUEUE, match_id="NA1_1", when=1):
    return {
        "metadata": {"match_id": match_id},
        "info": {
            "game_datetime": when,
            "queue_id": queue,
            "tft_set_number": 18,
            "participants": [
                {"puuid": OTHER, "placement": 9 - placement, "gold_left": 99, "level": 10,
                 "units": [unit("DA_18_Kennen", 3)], "traits": []},
                {"puuid": ME, "placement": placement, "gold_left": gold_left, "level": level,
                 "last_round": 30, "units": list(units), "traits": list(traits)},
            ],
        },
    }


def test_one_game_is_reduced_to_the_players_own_end_state():
    game = summarise_match(
        match(
            3,
            gold_left=7,
            units=[
                unit("DA_18_Ahri", 2, ["TFT_Item_Deathblade", "TFT_Item_InfinityEdge", "TFT_Item_BFSword"]),
                unit("da_18_ornn", 3),  # ids are matched without regard to case
                unit("DA_18_Unknown", 1, ["TFT_Item_GiantsBelt"]),
            ],
            traits=[{"name": "Blossom", "tier_current": 2, "style": 3}, {"name": "Fae", "tier_current": 0, "style": 0}],
        ),
        ME,
        STATIC,
    )
    assert game["placement"] == 3 and game["topFour"] is True
    # A two-star is three copies, a three-star nine: 4*3 + 1*9.
    assert game["boardGold"] == 21
    assert game["unknownUnits"] == 1
    assert (game["twoStars"], game["threeStars"]) == (1, 1)
    assert game["completedItems"] == 2 and game["looseComponents"] == 2
    assert game["fullCarries"] == 1
    assert game["activeTraits"] == 1 and game["topTraitStyle"] == 3
    assert game["goldLeft"] == 7 and game["rerollsUnspent"] == 3


def test_other_participants_never_reach_the_output():
    review = build_review([match(5, gold_left=3)], ME, STATIC)
    assert OTHER not in repr(review)
    assert "99" not in repr(review["games"])  # the other player's gold
    assert summarise_match(match(5), "puuid-absent", STATIC) is None


def test_better_and_worse_games_are_compared_decision_by_decision():
    games = [
        summarise_match(match(1, gold_left=2, level=9), ME, STATIC),
        summarise_match(match(4, gold_left=4, level=9), ME, STATIC),
        summarise_match(match(7, gold_left=30, level=7), ME, STATIC),
        summarise_match(match(8, gold_left=10, level=8), ME, STATIC),
    ]
    summary = compare_outcomes(games)
    assert (summary["topFourGames"], summary["bottomFourGames"]) == (2, 2)
    assert summary["averagePlacement"] == 5.0
    assert summary["placements"] == [1, 0, 0, 1, 0, 0, 1, 1]
    gold = next(row for row in summary["decisions"] if row["key"] == "goldLeft")
    assert (gold["topFour"], gold["bottomFour"], gold["difference"]) == (3.0, 20.0, -17.0)
    level = next(row for row in summary["decisions"] if row["key"] == "level")
    assert level["difference"] == 1.5
    assert summary["goldLeftInBottomFour"] == 40
    assert summary["rerollsUnspentInBottomFour"] == 20


def test_a_difference_needs_games_on_both_sides():
    summary = compare_outcomes([summarise_match(match(2), ME, STATIC)])
    assert all(row["difference"] is None for row in summary["decisions"])
    assert compare_outcomes([])["averagePlacement"] is None


def test_only_ranked_games_are_reviewed_newest_first():
    review = build_review(
        [match(2, when=10, match_id="a"), match(6, queue=1090, when=20, match_id="b"), match(5, when=30, match_id="c")],
        ME,
        STATIC,
    )
    assert [game["matchId"] for game in review["games"]] == ["c", "a"]


def test_configuration_reports_names_never_values():
    assert configuration({}) == {
        "configured": False, "missing": ["RIOT_API_KEY", "TFT_REVIEW_RIOT_ID"], "region": "americas", "riotId": None,
    }
    partial = configuration({"RIOT_API_KEY": "secret-value", "TFT_REVIEW_RIOT_ID": "no-tag"})
    assert partial["missing"] == ["TFT_REVIEW_RIOT_ID"]
    ready = configuration({"RIOT_API_KEY": "secret-value", "TFT_REVIEW_RIOT_ID": "Name#NA1", "TFT_REVIEW_REGION": "EUROPE"})
    assert ready["configured"] and ready["region"] == "europe" and ready["riotId"] == "Name#NA1"
    assert "secret-value" not in repr(ready) + repr(partial)
    assert configuration({"TFT_REVIEW_REGION": "moon"})["region"] == "americas"


class FakeResponse:
    def __init__(self, status, body=None):
        self.status_code, self._body = status, body

    def json(self):
        return self._body


def test_the_key_travels_in_the_header_and_requests_are_spaced():
    calls, sleeps = [], []

    def get(url, params=None, headers=None, timeout=None):
        calls.append((url, params, headers))
        if "/accounts/by-riot-id/" in url:
            return FakeResponse(200, {"puuid": ME})
        if url.endswith("/ids"):
            return FakeResponse(200, ["NA1_1", "NA1_2"])
        return FakeResponse(200, match(1, match_id=url.rsplit("/", 1)[1]))

    client = RiotClient("the-key", "americas", get=get, sleep=sleeps.append)
    assert client.puuid("Some Name#NA1") == ME
    assert len(client.recent_matches(ME, count=500)) == 2
    assert calls[0][0] == "https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Some%20Name/NA1"
    assert calls[1][1] == {"count": 20}  # capped
    assert all(headers == {"X-Riot-Token": "the-key"} for _, _, headers in calls)
    assert all("the-key" not in url for url, _, _ in calls)
    assert len(sleeps) == 2 and all(pause > 0 for pause in sleeps)


@pytest.mark.parametrize("status, fragment", [(403, "expire every 24 hours"), (429, "rate limit"), (404, "no record"), (500, "status 500")])
def test_riot_failures_become_plain_reasons_without_the_key(status, fragment):
    client = RiotClient("the-key", get=lambda *a, **k: FakeResponse(status), sleep=lambda s: None)
    with pytest.raises(RiotError) as caught:
        client.puuid("Name#NA1")
    assert fragment in caught.value.reason and "the-key" not in caught.value.reason


def test_review_route_asks_for_a_key_when_none_is_set(monkeypatch):
    monkeypatch.delenv("RIOT_API_KEY", raising=False)
    monkeypatch.delenv("TFT_REVIEW_RIOT_ID", raising=False)
    body = asyncio.run(routes.get_review())
    assert body["status"] == "needs_key"
    assert body["missing"] == ["RIOT_API_KEY", "TFT_REVIEW_RIOT_ID"]


def test_review_route_reviews_the_configured_account_and_caches(monkeypatch):
    monkeypatch.setenv("RIOT_API_KEY", "the-key")
    monkeypatch.setenv("TFT_REVIEW_RIOT_ID", "Name#NA1")
    monkeypatch.setattr(routes, "review_cache", ReviewCache())
    monkeypatch.setattr(routes.set_cache, "get", lambda: STATIC)
    runs = []

    def fake_fetch(config, static):
        runs.append(config["riotId"])
        return build_review([match(2, gold_left=6)], ME, static)

    monkeypatch.setattr(routes, "_fetch_review", fake_fetch)
    first = asyncio.run(routes.get_review())
    second = asyncio.run(routes.get_review())
    assert first["status"] == "ready" and first["riotId"] == "Name#NA1"
    assert first["summary"]["games"] == 1
    assert second == first and runs == ["Name#NA1"]  # second call served from cache
    assert "the-key" not in repr(first)


def test_review_route_reports_a_riot_failure_as_an_error_state(monkeypatch):
    monkeypatch.setenv("RIOT_API_KEY", "the-key")
    monkeypatch.setenv("TFT_REVIEW_RIOT_ID", "Name#NA1")
    monkeypatch.setattr(routes, "review_cache", ReviewCache())
    monkeypatch.setattr(routes.set_cache, "get", lambda: STATIC)

    def failing(config, static):
        raise RiotError("Riot rejected the API key. Development keys expire every 24 hours.", 403)

    monkeypatch.setattr(routes, "_fetch_review", failing)
    body = asyncio.run(routes.get_review())
    assert body == {"status": "error", "reason": "Riot rejected the API key. Development keys expire every 24 hours."}
