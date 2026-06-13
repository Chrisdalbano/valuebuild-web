"""
Champion ETL Pipeline

Fetches DDragon championFull.json (all champions + spells/passive/stats in one
request) and stores a COMPACT reference per champion in the `champions_cache`
collection. Only names/tags/resource/range/info are kept — NOT spell tooltips —
which is enough to ground the AI "Best on" feature (the model knows kits from
names) while keeping the collection ~90 KB. Decoupled from the item ETL so a
champion-fetch failure never affects item data.
"""

import requests
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReplaceOne


class ChampionETL:
    """ETL for compact champion reference data."""

    def __init__(self, mongo_uri: str = "mongodb://localhost:27017"):
        self.client = AsyncIOMotorClient(mongo_uri)
        self.db = self.client["gold_league"]
        self.champions_collection = self.db["champions_cache"]
        self.ddragon_base = "https://ddragon.leagueoflegends.com"

    def fetch_latest_patch(self) -> str:
        try:
            resp = requests.get(f"{self.ddragon_base}/api/versions.json", timeout=10)
            resp.raise_for_status()
            return resp.json()[0]
        except Exception as e:
            print(f"❌ Champion ETL: error fetching patch version: {e}")
            return "14.20.1"

    @staticmethod
    def transform(champ: dict, patch: str) -> dict:
        """One championFull.json entry -> compact cache doc."""
        stats = champ.get("stats", {}) or {}
        attack_range = stats.get("attackrange", 0)
        passive = (champ.get("passive") or {}).get("name", "")
        spells = [s.get("name", "") for s in (champ.get("spells") or []) if s.get("name")]
        return {
            "_id": champ.get("id", champ.get("name", "")),
            "key": champ.get("key", ""),
            "name": champ.get("name", ""),
            "tags": champ.get("tags", []),
            "resource": champ.get("partype", ""),
            "rangeType": "melee" if attack_range and attack_range <= 325 else "ranged",
            "attackRange": attack_range,
            "passive": passive,
            "spells": spells,
            "info": champ.get("info", {}),
            "patch": patch,
            "lastUpdated": datetime.utcnow(),
        }

    async def extract_and_transform(self) -> int:
        patch = self.fetch_latest_patch()
        url = f"{self.ddragon_base}/cdn/{patch}/data/en_US/championFull.json"
        print(f"🦸 Champion ETL: fetching {url}")
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        data = resp.json().get("data", {})

        operations = []
        for champ in data.values():
            doc = self.transform(champ, patch)
            if doc["_id"]:
                operations.append(ReplaceOne({"_id": doc["_id"]}, doc, upsert=True))

        if not operations:
            print("⚠️  Champion ETL: no champions parsed")
            return 0

        await self.champions_collection.bulk_write(operations)
        print(f"🦸 Champion ETL: cached {len(operations)} champions for patch {patch}")
        return len(operations)


async def run_champion_etl_now(mongo_uri: str = "mongodb://localhost:27017") -> int:
    """Run the champion ETL immediately (manual refresh / bootstrap)."""
    etl = ChampionETL(mongo_uri)
    try:
        return await etl.extract_and_transform()
    finally:
        etl.client.close()
