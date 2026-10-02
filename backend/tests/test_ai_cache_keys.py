"""Each AI section of an item document is fresh or stale on its own."""

from ai.cache_keys import best_on_fresh_query, current_sections, effects_fresh_query


def matches(doc, query):
    """Tiny evaluator for the subset of Mongo filters these queries use."""
    def get(d, dotted):
        for part in dotted.split("."):
            if not isinstance(d, dict) or part not in d:
                return None, False
            d = d[part]
        return d, True

    def clause(d, key, cond):
        value, present = get(d, key)
        if isinstance(cond, dict) and "$exists" in cond:
            return present == cond["$exists"]
        return present and value == cond

    for key, cond in query.items():
        if key == "$or":
            if not any(all(clause(doc, k, c) for k, c in alt.items()) for alt in cond):
                return False
        elif not clause(doc, key, cond):
            return False
    return True


NEW_EFFECTS_OLD_BEST_ON = {
    # Effects were regenerated for 16.19; best-on is still from 16.18.
    "_id": "3031", "patch": "16.19.1",
    "effects": [{"name": "crit"}], "effectsVersion": 3, "effectsPatch": "16.19.1",
    "bestOn": {"champions": ["Jinx"], "version": 2, "patch": "16.18.1"},
}

LEGACY_DOC = {
    # Written before per-section patches existed.
    "_id": "3031", "patch": "16.19.1",
    "effects": [{"name": "crit"}], "effectsVersion": 3,
    "bestOn": {"champions": ["Jinx"], "version": 2},
}


class TestSkipQueries:
    def test_stale_best_on_is_not_skipped_after_effects_were_refreshed(self):
        # Bug: the effects pass stamped the document with the new patch, so
        # the best-on pass saw "current patch" and skipped an old section.
        assert matches(NEW_EFFECTS_OLD_BEST_ON, effects_fresh_query("3031", "16.19.1", 3))
        assert not matches(NEW_EFFECTS_OLD_BEST_ON, best_on_fresh_query("3031", "16.19.1", 2))

    def test_both_sections_current(self):
        doc = dict(NEW_EFFECTS_OLD_BEST_ON, bestOn={"champions": [], "version": 2, "patch": "16.19.1"})
        assert matches(doc, effects_fresh_query("3031", "16.19.1", 3))
        assert matches(doc, best_on_fresh_query("3031", "16.19.1", 2))

    def test_prompt_version_bump_invalidates(self):
        assert not matches(NEW_EFFECTS_OLD_BEST_ON, effects_fresh_query("3031", "16.19.1", 4))

    def test_untouched_legacy_document_is_still_trusted_for_its_patch(self):
        # Avoids regenerating every cached study the first time this ships.
        assert matches(LEGACY_DOC, effects_fresh_query("3031", "16.19.1", 3))
        assert matches(LEGACY_DOC, best_on_fresh_query("3031", "16.19.1", 2))
        assert not matches(LEGACY_DOC, effects_fresh_query("3031", "16.20.1", 3))

    def test_legacy_section_stops_being_trusted_once_the_other_is_rewritten(self):
        doc = dict(LEGACY_DOC, patch="16.20.1", effectsPatch="16.20.1")
        assert not matches(doc, best_on_fresh_query("3031", "16.20.1", 2))


class TestReader:
    def test_stale_section_is_not_served(self):
        out = current_sections(NEW_EFFECTS_OLD_BEST_ON, "16.19.1")
        assert "effects" in out
        assert "bestOn" not in out

    def test_nothing_current_returns_empty(self):
        assert current_sections(NEW_EFFECTS_OLD_BEST_ON, "16.20.1") == {}
        assert current_sections(None, "16.19.1") == {}
        assert current_sections(LEGACY_DOC, None) == {}

    def test_legacy_document_is_served_for_its_patch(self):
        out = current_sections(LEGACY_DOC, "16.19.1")
        assert "effects" in out and "bestOn" in out

    def test_input_is_not_mutated(self):
        before = dict(NEW_EFFECTS_OLD_BEST_ON)
        current_sections(NEW_EFFECTS_OLD_BEST_ON, "16.19.1")
        assert NEW_EFFECTS_OLD_BEST_ON == before
