"""
The only place that talks to Riot's key-gated API.

The key is read from the RIOT_API_KEY environment variable, sent in the
X-Riot-Token header, and never logged, returned or put in a URL. The account
to review is fixed by TFT_REVIEW_RIOT_ID ("Name#TAG"): there is deliberately
no way for a visitor to look up someone else. Riot allows self-stats tools on
a public product only with Riot Sign On and a production key, so until those
exist this is for the owner's own use on a personal or development key.

Endpoints (Riot Developer Portal, checked 2026-11-23):
  account-v1    GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}   regional host
  tft-match-v1  GET /tft/match/v1/matches/by-puuid/{puuid}/ids?count=           regional host
  tft-match-v1  GET /tft/match/v1/matches/{matchId}                             regional host
"""

import os
import time
from typing import Callable, List, Optional
from urllib.parse import quote

import requests

REGIONS = {"americas", "europe", "asia", "sea"}
# Personal and development keys allow 20 requests a second and 100 every two
# minutes. One review is at most 2 + MAX_MATCHES requests, spaced out.
MAX_MATCHES = 20
REQUEST_SPACING_SECONDS = 0.08
CACHE_SECONDS = 15 * 60


class RiotError(Exception):
    """A failure that is safe to describe to the visitor."""

    def __init__(self, reason: str, status: Optional[int] = None):
        super().__init__(reason)
        self.reason = reason
        self.status = status


def configuration(env=os.environ) -> dict:
    """What is configured, by name only. Values are never returned."""
    riot_id = (env.get("TFT_REVIEW_RIOT_ID") or "").strip()
    region = (env.get("TFT_REVIEW_REGION") or "americas").strip().lower()
    missing = []
    if not (env.get("RIOT_API_KEY") or "").strip():
        missing.append("RIOT_API_KEY")
    if "#" not in riot_id or not all(part.strip() for part in riot_id.split("#", 1)):
        missing.append("TFT_REVIEW_RIOT_ID")
    return {
        "configured": not missing,
        "missing": missing,
        "region": region if region in REGIONS else "americas",
        "riotId": riot_id if "TFT_REVIEW_RIOT_ID" not in missing else None,
    }


class RiotClient:
    def __init__(
        self,
        key: str,
        region: str = "americas",
        get: Callable = requests.get,
        sleep: Callable[[float], None] = time.sleep,
    ):
        self._key = key
        self._base = f"https://{region}.api.riotgames.com"
        self._get = get
        self._sleep = sleep

    def _request(self, path: str, params: Optional[dict] = None):
        try:
            response = self._get(
                self._base + path,
                params=params,
                headers={"X-Riot-Token": self._key},
                timeout=15,
            )
        except Exception:
            raise RiotError("Riot's API could not be reached.")
        status = response.status_code
        if status == 200:
            return response.json()
        if status in (401, 403):
            raise RiotError(
                "Riot rejected the API key. Development keys expire every 24 hours.", status
            )
        if status == 404:
            raise RiotError("Riot has no record for that request.", status)
        if status == 429:
            raise RiotError("Riot's rate limit was reached. Try again in a couple of minutes.", status)
        raise RiotError(f"Riot's API answered with status {status}.", status)

    def puuid(self, riot_id: str) -> str:
        name, tag = (part.strip() for part in riot_id.split("#", 1))
        account = self._request(
            f"/riot/account/v1/accounts/by-riot-id/{quote(name, safe='')}/{quote(tag, safe='')}"
        )
        return account["puuid"]

    def recent_matches(self, puuid: str, count: int = MAX_MATCHES) -> List[dict]:
        count = max(1, min(count, MAX_MATCHES))
        ids = self._request(
            f"/tft/match/v1/matches/by-puuid/{quote(puuid, safe='')}/ids", {"count": count}
        )
        matches = []
        for match_id in ids[:count]:
            self._sleep(REQUEST_SPACING_SECONDS)
            matches.append(self._request(f"/tft/match/v1/matches/{quote(str(match_id), safe='')}"))
        return matches


class ReviewCache:
    """One review kept for a few minutes so reloading the page does not spend
    the key's request budget again."""

    def __init__(self, ttl_seconds: float = CACHE_SECONDS, clock=time.monotonic):
        self.ttl_seconds = ttl_seconds
        self._clock = clock
        self._value = None
        self._at: Optional[float] = None

    def get(self):
        if self._at is not None and self._clock() - self._at < self.ttl_seconds:
            return self._value
        return None

    def put(self, value):
        self._value, self._at = value, self._clock()
