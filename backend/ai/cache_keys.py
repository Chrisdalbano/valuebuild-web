"""
Freshness rules for the cached AI analysis of one item.

An item's document holds two independently generated sections: `effects` and
`bestOn`. Each records the patch it was generated for (`effectsPatch`,
`bestOn.patch`), so regenerating one section for a new patch can never make the
other, older section look current.

Documents written before these fields existed carry only a document-level
`patch`. They count as fresh only while neither section has been rewritten by
the newer code; after that the per-section field is the only thing trusted.
"""

from typing import Any, Dict, Optional


def effects_fresh_query(item_id: str, patch: str, version: int) -> Dict[str, Any]:
    """Mongo filter matching an item whose effects are current for `patch`."""
    return {
        "_id": item_id,
        "effectsVersion": version,
        "$or": [
            {"effectsPatch": patch},
            {"effectsPatch": {"$exists": False}, "bestOn.patch": {"$exists": False}, "patch": patch},
        ],
    }


def best_on_fresh_query(item_id: str, patch: str, version: int) -> Dict[str, Any]:
    """Mongo filter matching an item whose best-on section is current for `patch`."""
    return {
        "_id": item_id,
        "bestOn.version": version,
        "$or": [
            {"bestOn.patch": patch},
            {"bestOn.patch": {"$exists": False}, "effectsPatch": {"$exists": False}, "patch": patch},
        ],
    }


def _section_patch(doc: Dict[str, Any], explicit: Optional[str]) -> Optional[str]:
    """Patch a section was generated for, falling back to the document patch
    only for documents no newer code has touched."""
    if explicit is not None:
        return explicit
    best_on = doc.get("bestOn")
    touched = "effectsPatch" in doc or (isinstance(best_on, dict) and "patch" in best_on)
    return None if touched else doc.get("patch")


def current_sections(doc: Dict[str, Any], patch: Optional[str]) -> Dict[str, Any]:
    """Copy of `doc` with any section generated for another patch removed.
    Returns an empty dict when nothing in the document is current."""
    if not doc or patch is None:
        return {}
    out = dict(doc)
    if _section_patch(doc, doc.get("effectsPatch")) != patch:
        for key in ("effects", "effectsVersion", "effectsPatch", "summary", "caveats"):
            out.pop(key, None)
    best_on = doc.get("bestOn")
    if not isinstance(best_on, dict) or _section_patch(doc, best_on.get("patch")) != patch:
        out.pop("bestOn", None)
    if "effects" not in out and "bestOn" not in out:
        return {}
    out["patch"] = patch
    return out
