"""AI enrichment orchestration: pick a curated subset of high-impact items, value
their effects with Gemini, generate a per-patch research digest, and cache both in
the `ai_analysis` collection. Decoupled from the core ETL so a Gemini outage (or
depleted quota) never breaks item refresh. Resumable (skips items already enriched
for the current patch); throttled to respect the API rate limit.
"""

import os
import asyncio
import logging
from functools import partial
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorClient

from .gemini_client import generate_json, is_configured, _model
from .prompts import build_effect_prompt, build_digest_prompt

logger = logging.getLogger("ai.enrich")

CURATED_LIMIT = int(os.getenv("AI_CURATED_LIMIT", "80"))
# seconds between Gemini calls — default respects ~15 RPM free-tier limits
CALL_DELAY = float(os.getenv("AI_CALL_DELAY_SECONDS", "4"))


def _has_effect(item: dict) -> bool:
    desc = (item.get("description") or "").lower()
    return ("<passive" in desc) or ("<active" in desc)


def select_curated_items(items: list, limit: int = CURATED_LIMIT) -> list:
    """High-impact items whose effects matter: legendary/epic (cost >= 1300) with a
    passive or active, most expensive first, capped at `limit`."""
    pool = [it for it in items if it.get("cost", 0) >= 1300 and _has_effect(it)]
    pool.sort(key=lambda it: it.get("cost", 0), reverse=True)
    return pool[:limit]


# Flash models spend "thinking" tokens out of max_output_tokens BEFORE emitting
# JSON; at the old 2048 cap thinking (~2k) starved the response and it truncated
# mid-string (finish_reason=MAX_TOKENS) -> parse failure -> None. Give thinking +
# JSON real headroom: effects responses are small, the 80-item digest is large.
EFFECT_MAX_TOKENS = int(os.getenv("AI_EFFECT_MAX_TOKENS", "3072"))
DIGEST_MAX_TOKENS = int(os.getenv("AI_DIGEST_MAX_TOKENS", "8192"))


async def _gen(prompt: str, max_output_tokens: int = 3072):
    """Run the sync Gemini call off the event loop."""
    fn = partial(generate_json, max_output_tokens=max_output_tokens)
    return await asyncio.get_event_loop().run_in_executor(None, fn, prompt)


async def enrich_item_effects(items, patch, ai_col) -> dict:
    curated = select_curated_items(items)
    enriched = skipped = failed = 0
    logger.info("AI effect enrichment: %d curated items for patch %s", len(curated), patch)
    for it in curated:
        if await ai_col.find_one({"_id": it["id"], "patch": patch}):
            skipped += 1
            continue
        result = await _gen(build_effect_prompt(it), EFFECT_MAX_TOKENS)
        if isinstance(result, dict):
            await ai_col.replace_one(
                {"_id": it["id"]},
                {
                    "_id": it["id"],
                    "itemId": it["id"],
                    "name": it.get("name", ""),
                    "patch": patch,
                    "model": _model(),
                    "effects": result.get("effects", []),
                    "summary": result.get("summary", ""),
                    "caveats": result.get("caveats", ""),
                    "generatedAt": datetime.utcnow(),
                },
                upsert=True,
            )
            enriched += 1
        else:
            failed += 1  # Gemini returned None (quota/parse/network) — logged in client
        await asyncio.sleep(CALL_DELAY)
    logger.info("AI effect enrichment done: %d enriched, %d skipped, %d failed", enriched, skipped, failed)
    return {"enriched": enriched, "skipped": skipped, "failed": failed, "curated": len(curated)}


async def generate_research_digest(items, patch, ai_col) -> bool:
    curated = select_curated_items(items)
    if not curated:
        return False
    digest = await _gen(build_digest_prompt(curated, patch), DIGEST_MAX_TOKENS)
    if not isinstance(digest, dict):
        return False
    await ai_col.replace_one(
        {"_id": "research_digest"},
        {
            "_id": "research_digest",
            "patch": patch,
            "model": _model(),
            "outliers": digest.get("outliers", []),
            "effectSpotlights": digest.get("effectSpotlights", []),
            "experimentalBuilds": digest.get("experimentalBuilds", []),
            "generatedAt": datetime.utcnow(),
        },
        upsert=True,
    )
    return True


async def run_ai_enrichment(mongo_uri: str) -> dict:
    """Top-level: enrich curated item effects + the patch digest. Mirrors run_etl_now."""
    if not is_configured():
        logger.warning("AI enrichment skipped: GEMINI_API_KEY not set")
        return {"status": "skipped", "reason": "no_key"}

    client = AsyncIOMotorClient(mongo_uri)
    try:
        db = client["gold_league"]
        meta = await db["etl_metadata"].find_one({"_id": "latest"})
        patch = (meta or {}).get("patch", "unknown")
        items = await db["items_cache"].find(
            {"isDeprecated": False, "imageValidated": True}, {"_id": 0}
        ).to_list(length=None)
        ai_col = db["ai_analysis"]

        # Digest first: it's a single Gemini call that only needs items_cache, so
        # it must not be starved by the long (resumable) per-item effects loop —
        # on a constrained worker the batch can recycle before the digest runs.
        digest_ok = await generate_research_digest(items, patch, ai_col)
        effect_stats = await enrich_item_effects(items, patch, ai_col)

        return {"status": "complete", "patch": patch, "digest": digest_ok, **effect_stats}
    except Exception as e:
        logger.warning("AI enrichment failed: %s", str(e)[:200])
        return {"status": "error", "error": str(e)[:200]}
    finally:
        client.close()
