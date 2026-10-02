"""Scheduling and safety rules of the weekly item ETL."""

from datetime import datetime

from etl.data_pipeline import next_weekly_run, should_retire_stale_items


class TestNextWeeklyRun:
    def test_midweek_points_at_the_coming_monday(self):
        # Friday 2026-10-02 -> Monday 2026-10-05 02:00 UTC
        assert next_weekly_run(datetime(2026, 10, 2, 15, 30)) == datetime(2026, 10, 5, 2, 0)

    def test_monday_before_the_run_is_the_same_day(self):
        assert next_weekly_run(datetime(2026, 10, 5, 1, 59)) == datetime(2026, 10, 5, 2, 0)

    def test_monday_at_or_after_the_run_is_next_week(self):
        assert next_weekly_run(datetime(2026, 10, 5, 2, 0)) == datetime(2026, 10, 12, 2, 0)
        assert next_weekly_run(datetime(2026, 10, 5, 9, 0)) == datetime(2026, 10, 12, 2, 0)

    def test_result_is_always_a_monday_at_two(self):
        for day in range(1, 29):
            run = next_weekly_run(datetime(2026, 2, day, 12, 0))
            assert (run.weekday(), run.hour, run.minute) == (0, 2, 0)


class TestRetirement:
    def test_first_run_may_retire(self):
        assert should_retire_stale_items(200, None)
        assert should_retire_stale_items(200, 0)

    def test_normal_run_may_retire(self):
        assert should_retire_stale_items(215, 218)

    def test_a_run_that_lost_most_items_retires_nothing(self):
        # For example every image check failing because the CDN is unreachable.
        assert not should_retire_stale_items(40, 218)

    def test_threshold_is_eighty_percent(self):
        assert should_retire_stale_items(80, 100)
        assert not should_retire_stale_items(79, 100)
