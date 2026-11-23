"""TFT routes. Neither uses MongoDB.

GET /api/tft/set     static set data, priced; no Riot key
GET /api/tft/review  the configured player's own recent games; needs a key
"""

import asyncio
import os

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .review import build_review
from .riot_api import MAX_MATCHES, ReviewCache, RiotClient, RiotError, configuration
from .static_data import SetCache

router = APIRouter(prefix="/api/tft")
set_cache = SetCache()
review_cache = ReviewCache()
_review_lock = asyncio.Lock()


@router.get("/set")
async def get_set():
    """The live set from Community Dragon, trimmed and priced. Cached in
    memory; the 24 MB source is fetched off the event loop."""
    data = await asyncio.to_thread(set_cache.get)
    if data is None:
        return JSONResponse(
            status_code=503,
            content={"status": "unavailable", "reason": "Set data could not be loaded yet."},
        )
    return data


def _fetch_review(config: dict, static: dict) -> dict:
    client = RiotClient(os.environ["RIOT_API_KEY"].strip(), config["region"])
    puuid = client.puuid(config["riotId"])
    matches = client.recent_matches(puuid, MAX_MATCHES)
    return build_review(matches, puuid, static)


@router.get("/review")
async def get_review():
    """Decision review for the one account named in the environment. There is
    no parameter: a visitor cannot ask about anyone else."""
    config = configuration()
    if not config["configured"]:
        return {
            "status": "needs_key",
            "missing": config["missing"],
            "note": (
                "The match review reads Riot's API on the server. It needs a Riot API "
                "key and the Riot ID to review, both set as environment variables on "
                "the backend."
            ),
        }
    async with _review_lock:  # one run at a time: the key's budget is small
        cached = review_cache.get()
        if cached is not None:
            return cached
        static = await asyncio.to_thread(set_cache.get)
        if static is None:
            return JSONResponse(
                status_code=503,
                content={"status": "unavailable", "reason": "Set data could not be loaded yet."},
            )
        try:
            review = await asyncio.to_thread(_fetch_review, config, static)
        except RiotError as error:
            return {"status": "error", "reason": error.reason}
        except Exception:
            return {"status": "error", "reason": "The review could not be built."}
        result = {"status": "ready", "riotId": config["riotId"], **review}
        review_cache.put(result)
        return result
