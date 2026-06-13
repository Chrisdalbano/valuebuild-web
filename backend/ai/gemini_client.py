"""Thin wrapper around the google-genai SDK for Gemini Flash JSON calls.

Reads GEMINI_API_KEY lazily (so app.py's load_dotenv runs first). Returns parsed
JSON or None on ANY failure — callers degrade gracefully. The API key is never
logged. Validated 2026-06-13: the AQ.-format key authenticates; the default
model is gemini-flash-latest, which auto-tracks the current stable Flash so a
retirement can't strand us again. (gemini-2.0-flash was retired at the generate
endpoint — 404 NOT_FOUND — even though it still appears in models.list();
gemini-2.5-flash and gemini-flash-latest both generate JSON fine.) Override with
the GEMINI_MODEL env var. Any failure surfaces as None, not a crash.
"""

import os
import re
import json
import logging

logger = logging.getLogger("ai.gemini")

_client = None
_client_key = None


def _key() -> str:
    return os.getenv("GEMINI_API_KEY", "")


def _model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-flash-latest")


def is_configured() -> bool:
    """True when a GEMINI_API_KEY is present (does not guarantee quota)."""
    return bool(_key())


def _get_client():
    """Lazily build + cache a genai.Client for the current key."""
    global _client, _client_key
    key = _key()
    if not key:
        return None
    if _client is None or _client_key != key:
        try:
            from google import genai
            _client = genai.Client(api_key=key)
            _client_key = key
        except Exception as e:  # SDK missing / bad key shape
            logger.warning("Gemini client init failed: %s", _redact(str(e)))
            return None
    return _client


def _redact(msg: str) -> str:
    key = _key()
    return msg.replace(key, "<redacted>") if key else msg


def _parse_json(text: str):
    """Parse a model response into JSON, tolerating ```json fences."""
    if not text:
        return None
    cleaned = text.strip()
    fence = re.match(r"^```(?:json)?\s*(.+?)\s*```$", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1)
    return json.loads(cleaned)


def generate_json(prompt: str, *, temperature: float = 0.4, max_output_tokens: int = 2048):
    """Call Gemini Flash for a JSON object/array. Returns the parsed value, or
    None on any failure (no quota, network, parse error, missing key)."""
    client = _get_client()
    if client is None:
        return None
    try:
        from google.genai import types
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=temperature,
            max_output_tokens=max_output_tokens,
        )
        resp = client.models.generate_content(model=_model(), contents=prompt, config=config)
        return _parse_json(resp.text)
    except Exception as e:
        logger.warning("Gemini call failed: %s", _redact(str(e))[:200])
        return None
