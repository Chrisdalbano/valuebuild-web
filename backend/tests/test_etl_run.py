"""One full ETL run against in-memory stand-ins for Data Dragon and MongoDB."""

import asyncio
import os

import pytest

import etl.data_pipeline as pipeline
from tests.conftest import make_item


class FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


class FakeResult:
    upserted_count = 0
    modified_count = 0


class FakeItems:
    def __init__(self, existing_ids=()):
        self.docs = {i: {"_id": i, "isDeprecated": False} for i in existing_ids}
        self.retired = []

    async def bulk_write(self, operations):
        for op in operations:
            doc = op._doc
            self.docs[doc["_id"]] = doc
        return FakeResult()

    async def update_many(self, query, update):
        keep = set(query["_id"]["$nin"])
        result = FakeResult()
        for item_id, doc in self.docs.items():
            if item_id not in keep and doc.get("isDeprecated") is not True:
                doc["isDeprecated"] = True
                self.retired.append(item_id)
                result.modified_count += 1
        return result


class FakeMetadata:
    def __init__(self, latest=None):
        self.latest = latest

    async def find_one(self, query):
        return self.latest

    async def replace_one(self, query, doc, upsert=False):
        self.latest = doc

    async def update_one(self, query, update, upsert=False):
        self.latest = {**(self.latest or {"_id": "latest"}), **update["$set"]}


RAW_ITEMS = {
    "1036": make_item(1036, "Long Sword", 350, {"FlatPhysicalDamageMod": 10}),
    "6653": make_item(6653, "Liandry's Torment", 3000, {"FlatMagicDamageMod": 60, "FlatHPPoolMod": 300}),
    "3146": make_item(3146, "Hextech Gunblade", 3400, {"FlatMagicDamageMod": 80}),   # removed from the game
    "226653": make_item(226653, "Liandry's Torment", 3000, {"FlatMagicDamageMod": 60}),  # game-mode copy
    "2051": make_item(2051, "Guardian's Horn", 950, {"FlatHPPoolMod": 150}),         # ARAM only
}


@pytest.fixture
def etl(monkeypatch, tmp_path):
    def fake_get(url, timeout=None, **kwargs):
        if url.endswith("versions.json"):
            return FakeResponse(["16.19.1", "16.18.1"])
        assert "16.19.1" in url
        return FakeResponse({"data": {k: dict(v) for k, v in RAW_ITEMS.items()}})

    monkeypatch.setattr(pipeline.requests, "get", fake_get)
    monkeypatch.chdir(tmp_path)  # the run writes a log file to the working directory
    instance = pipeline.DDragonETL("mongodb://unused")
    monkeypatch.setattr(instance, "_validate_image_blocking", lambda item_id, patch: True)
    instance.items_collection = FakeItems()
    instance.metadata_collection = FakeMetadata()
    return instance


def test_run_loads_only_eligible_items_with_their_efficiency(etl):
    count = asyncio.run(etl.extract_and_transform())
    assert count == 2
    assert set(etl.items_collection.docs) == {"1036", "6653"}
    sword = etl.items_collection.docs["1036"]
    assert sword["goldEfficiency"] == 100.0
    assert sword["patch"] == "16.19.1"
    assert sword["imageUrl"].endswith("/cdn/16.19.1/img/item/1036.png")


def test_run_records_metadata(etl):
    asyncio.run(etl.extract_and_transform())
    meta = etl.metadata_collection.latest
    assert meta["status"] == "success"
    assert meta["patch"] == "16.19.1"
    assert meta["itemCount"] == 2
    assert meta["filteredCounts"] == {"deprecated": 0, "no_image": 0, "riot_filter": 3, "total": 3}
    assert (meta["nextScheduledUpdate"].weekday(), meta["nextScheduledUpdate"].hour) == (0, 2)


def test_item_that_left_the_catalog_is_flagged_not_deleted(etl):
    etl.items_collection = FakeItems(existing_ids=["9999"])
    asyncio.run(etl.extract_and_transform())
    assert etl.items_collection.retired == ["9999"]
    assert "9999" in etl.items_collection.docs


def test_item_without_an_image_is_left_out(etl, monkeypatch):
    monkeypatch.setattr(etl, "_validate_image_blocking", lambda item_id, patch: item_id != "6653")
    assert asyncio.run(etl.extract_and_transform()) == 1
    assert set(etl.items_collection.docs) == {"1036"}


def test_a_much_smaller_run_retires_nothing(etl, monkeypatch):
    # Every image check fails except one, as if the CDN were unreachable.
    etl.items_collection = FakeItems(existing_ids=["6653", "3031", "3089"])
    etl.metadata_collection = FakeMetadata({"_id": "latest", "itemCount": 200})
    monkeypatch.setattr(etl, "_validate_image_blocking", lambda item_id, patch: item_id == "1036")
    asyncio.run(etl.extract_and_transform())
    assert etl.items_collection.retired == []


def test_failed_patch_lookup_writes_no_items(etl, monkeypatch):
    def broken_get(url, timeout=None, **kwargs):
        raise ConnectionError("offline")

    monkeypatch.setattr(pipeline.requests, "get", broken_get)
    with pytest.raises(RuntimeError):
        asyncio.run(etl.extract_and_transform())
    assert etl.items_collection.docs == {}
    assert etl.metadata_collection.latest["status"] == "error"


def test_failed_run_keeps_the_last_good_patch_in_metadata(etl, monkeypatch):
    # Bug: a failed run replaced the metadata document, dropping the patch the
    # API and the front end read from it.
    etl.metadata_collection = FakeMetadata({"_id": "latest", "patch": "16.18.1", "itemCount": 200, "status": "success"})

    def broken_get(url, timeout=None, **kwargs):
        raise ConnectionError("offline")

    monkeypatch.setattr(pipeline.requests, "get", broken_get)
    with pytest.raises(RuntimeError):
        asyncio.run(etl.extract_and_transform())
    meta = etl.metadata_collection.latest
    assert meta["status"] == "error"
    assert meta["patch"] == "16.18.1"
    assert meta["itemCount"] == 200


def test_run_leaves_its_log_in_the_working_directory(etl, tmp_path):
    asyncio.run(etl.extract_and_transform())
    assert any(name.startswith("etl_run_") for name in os.listdir(tmp_path))


def test_two_suspect_runs_in_a_row_still_retire_nothing(etl, monkeypatch):
    # Bug caught in review: the first suspect run stored its own small count,
    # so a second one looked normal against it and retired the catalog.
    etl.items_collection = FakeItems(existing_ids=["6653", "3031", "3089"])
    etl.metadata_collection = FakeMetadata({"_id": "latest", "itemCount": 200, "status": "success"})
    monkeypatch.setattr(etl, "_validate_image_blocking", lambda item_id, patch: item_id == "1036")
    asyncio.run(etl.extract_and_transform())
    first = etl.metadata_collection.latest
    assert (first["status"], first["itemCount"], first["keptThisRun"]) == ("partial", 200, 1)
    asyncio.run(etl.extract_and_transform())
    assert etl.items_collection.retired == []
    assert etl.metadata_collection.latest["itemCount"] == 200


def test_image_checks_run_concurrently_but_bounded(etl, monkeypatch):
    import threading
    import time

    lock = threading.Lock()
    state = {"now": 0, "peak": 0}

    def slow_check(item_id, patch):
        with lock:
            state["now"] += 1
            state["peak"] = max(state["peak"], state["now"])
        time.sleep(0.05)
        with lock:
            state["now"] -= 1
        return True

    many = {str(7000 + n): make_item(7000 + n, f"Item {n}", 1000, {"FlatHPPoolMod": 100}) for n in range(24)}

    def fake_get(url, timeout=None, **kwargs):
        if url.endswith("versions.json"):
            return FakeResponse(["16.19.1"])
        return FakeResponse({"data": {k: dict(v) for k, v in many.items()}})

    monkeypatch.setattr(pipeline.requests, "get", fake_get)
    monkeypatch.setattr(etl, "_validate_image_blocking", slow_check)
    assert asyncio.run(etl.extract_and_transform()) == 24
    assert 1 < state["peak"] <= pipeline.IMAGE_CHECK_CONCURRENCY
