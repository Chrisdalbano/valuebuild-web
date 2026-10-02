"""
Guards for the endpoints that start expensive background work (the item ETL
and the AI enrichment run).

Two protections, both independent of MongoDB so they can be unit tested:

- `is_authorized`: when ADMIN_TOKEN is configured, callers must send it in the
  X-Admin-Token header. When it is not configured the endpoints stay open, as
  they were before, and rely on the gate below.
- `RefreshGate`: one run at a time, and a cooldown between runs, so repeated
  calls cannot stack jobs or burn API quota.
"""

import hmac
import time
from typing import Callable, Optional

DEFAULT_COOLDOWN_SECONDS = 15 * 60


def is_authorized(provided: Optional[str], configured: Optional[str]) -> bool:
    """True when no token is configured, or the provided token matches it."""
    if not configured:
        return True
    if not provided:
        return False
    return hmac.compare_digest(provided.encode(), configured.encode())


class RefreshGate:
    """Single-flight plus cooldown for one kind of background job."""

    def __init__(
        self,
        cooldown_seconds: float = DEFAULT_COOLDOWN_SECONDS,
        clock: Callable[[], float] = time.monotonic,
    ):
        self.cooldown_seconds = cooldown_seconds
        self._clock = clock
        self._running = False
        self._last_started: Optional[float] = None

    @property
    def running(self) -> bool:
        return self._running

    def retry_after(self) -> int:
        """Seconds until a new run is allowed. 0 when one can start now."""
        if self._last_started is None:
            return 0
        remaining = self.cooldown_seconds - (self._clock() - self._last_started)
        return max(0, int(remaining + 0.999))

    def try_start(self) -> str:
        """Claim the gate. Returns "started", "running" or "cooldown"."""
        if self._running:
            return "running"
        if self.retry_after() > 0:
            return "cooldown"
        self._running = True
        self._last_started = self._clock()
        return "started"

    def finish(self) -> None:
        self._running = False
