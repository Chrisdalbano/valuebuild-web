"""The refresh endpoints start an ETL run or an AI enrichment run. These tests
cover the guards that keep them from being stacked or called by anyone."""

from refresh_gate import RefreshGate, is_authorized


class FakeClock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now


class TestAuthorization:
    def test_open_when_no_token_is_configured(self):
        assert is_authorized(None, None)
        assert is_authorized("anything", "")

    def test_missing_token_is_rejected_when_one_is_configured(self):
        assert not is_authorized(None, "secret")
        assert not is_authorized("", "secret")

    def test_wrong_token_is_rejected(self):
        assert not is_authorized("guess", "secret")

    def test_matching_token_is_accepted(self):
        assert is_authorized("secret", "secret")


class TestRefreshGate:
    def test_first_call_starts(self):
        gate = RefreshGate(clock=FakeClock())
        assert gate.try_start() == "started"
        assert gate.running

    def test_second_call_while_running_does_not_start_another(self):
        gate = RefreshGate(clock=FakeClock())
        gate.try_start()
        assert gate.try_start() == "running"

    def test_cooldown_applies_after_a_run_finishes(self):
        clock = FakeClock()
        gate = RefreshGate(cooldown_seconds=900, clock=clock)
        gate.try_start()
        gate.finish()
        clock.now += 60
        assert gate.try_start() == "cooldown"
        assert gate.retry_after() == 840

    def test_run_is_allowed_again_after_the_cooldown(self):
        clock = FakeClock()
        gate = RefreshGate(cooldown_seconds=900, clock=clock)
        gate.try_start()
        gate.finish()
        clock.now += 900
        assert gate.retry_after() == 0
        assert gate.try_start() == "started"

    def test_gates_are_independent(self):
        clock = FakeClock()
        etl, ai = RefreshGate(clock=clock), RefreshGate(clock=clock)
        assert etl.try_start() == "started"
        assert ai.try_start() == "started"
