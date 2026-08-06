import logging
import random
import time
from typing import Callable, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")

MAX_RETRIES = 3
BASE_DELAY_SECONDS = 5
MAX_DELAY_SECONDS = 300

# Same classification split as publishing/engine/recovery.py's
# RETRYABLE_CLASSIFICATIONS / NON_RETRYABLE_CLASSIFICATIONS, generalized by
# string-sniffing since LLM/provider calls in this pipeline raise plain
# Exceptions rather than a typed ProviderException.
_NON_RETRYABLE_MARKERS = ("401", "unauthorized", "403", "forbidden", "invalid api key", "invalid_api_key")


def _is_retryable(error: Exception) -> bool:
    message = str(error).lower()
    return not any(marker in message for marker in _NON_RETRYABLE_MARKERS)


def _backoff_seconds(attempt: int) -> float:
    delay = min(BASE_DELAY_SECONDS * (2 ** (attempt - 1)), MAX_DELAY_SECONDS)
    return delay * random.uniform(0.8, 1.2)


def run_stage_with_retry(fn: Callable[[], T], stage_name: str, max_retries: int = MAX_RETRIES) -> T:
    """Runs `fn`, retrying with exponential backoff + jitter on transient
    failures - the same proven pattern as publishing/engine/recovery.py,
    generalized here for LLM-call pipeline stages instead of publish attempts."""
    attempt = 0
    last_error: Exception = RuntimeError(f"{stage_name} never ran")
    while attempt < max_retries:
        attempt += 1
        try:
            return fn()
        except Exception as e:
            last_error = e
            if not _is_retryable(e) or attempt >= max_retries:
                logger.error(f"[{stage_name}] failed permanently after {attempt} attempt(s): {e}")
                raise
            delay = _backoff_seconds(attempt)
            logger.warning(f"[{stage_name}] attempt {attempt} failed ({e}); retrying in {delay:.1f}s")
            time.sleep(delay)
    raise last_error
