"""Grounded prompt builders for Gemini. Every effect estimate is anchored to the
real base-stat gold values from efficiency.py so the model can't free-float — and
the prompts forbid restating the canonical efficiency as fact-including-effects.
"""

import re
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from efficiency import STAT_VALUES  # noqa: E402

# Human-readable base-stat gold values for the prompt (per 1 point unless noted).
_STAT_LABELS = {
    "FlatPhysicalDamageMod": "Attack Damage (per 1)",
    "FlatMagicDamageMod": "Ability Power (per 1)",
    "FlatArmorMod": "Armor (per 1)",
    "FlatSpellBlockMod": "Magic Resist (per 1)",
    "FlatHPPoolMod": "Health (per 1)",
    "FlatMPPoolMod": "Mana (per 1)",
    "FlatHPRegenMod": "Base Health Regen (per 100%)",
    "FlatMPRegenMod": "Base Mana Regen (per 100%)",
    "FlatMovementSpeedMod": "Move Speed (per 1)",
    "PercentAttackSpeedMod": "Attack Speed (per 100%)",
    "PercentCritChanceMod": "Crit Chance (per 100%)",
    "PercentLifeStealMod": "Life Steal (per 100%)",
    "AbilityHaste": "Ability Haste (per 1)",
}


def _base_stat_table() -> str:
    rows = []
    for key, label in _STAT_LABELS.items():
        if key in STAT_VALUES:
            rows.append(f"- {label}: {STAT_VALUES[key]}g")
    return "\n".join(rows)


def strip_html(description: str) -> str:
    """DDragon descriptions are HTML; flatten to readable text for the model."""
    if not description:
        return ""
    text = re.sub(r"<br\s*/?>", " ", description)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", text).strip()


_EFFECT_SYSTEM = """You are a League of Legends itemization analyst estimating the \
gold value of item EFFECTS (passives, actives, on-hit, heals, shields) that the \
standard stat-only gold-efficiency formula cannot price.

Ground every estimate in these base-stat gold values (this is the project's ground truth):
{base_stats}

Rules:
- Value ONLY the non-stat effects. The flat stats are already priced elsewhere — do not re-value them.
- Express each effect's value by relating it to base stats (e.g. "a 200 HP shield every 20s ≈ X gold of effective Health").
- Be explicit that these are APPROXIMATE estimates for a typical use case; real value varies by champion, matchup, and game state.
- NEVER restate the item's overall efficiency as if effects were included; the canonical efficiency stays stat-only.
- Output STRICT JSON only, no prose outside it."""

_EFFECT_USER = """Item: {name} (cost {cost}g)
Already-priced flat stats: {stats}
Effect text: {effect_text}

Return JSON with this exact shape:
{{
  "effects": [
    {{
      "name": "short effect name",
      "estimatedGoldValue": <number, approximate gold value of THIS effect>,
      "confidence": "low" | "medium" | "high",
      "reasoning": ["short step", "short step"],
      "baseStatEquivalence": "one line relating the value to base stats"
    }}
  ],
  "summary": "1-2 sentence plain-language takeaway",
  "caveats": "1 sentence on why this is approximate"
}}
If the item has no meaningful non-stat effect, return {{"effects": [], "summary": "...", "caveats": "..."}}."""


def build_effect_prompt(item: dict) -> str:
    stats = ", ".join(sorted((item.get("statBreakdown") or {}).keys())) or "none"
    effect_text = strip_html(item.get("description", "")) or "(no effect text)"
    system = _EFFECT_SYSTEM.format(base_stats=_base_stat_table())
    user = _EFFECT_USER.format(
        name=item.get("name", "?"),
        cost=item.get("cost", 0),
        stats=stats,
        effect_text=effect_text[:1500],
    )
    return f"{system}\n\n{user}"


_DIGEST_SYSTEM = """You are a League of Legends itemization researcher writing a \
patch digest of DISCOVERIES for patch {patch}. You are given items with their \
stat-only gold efficiency and effect text. Surface non-obvious findings.

Frame everything as hypotheses, not facts. Output STRICT JSON only."""

_DIGEST_USER = """Items (name | cost | stat-efficiency% | short effect):
{item_lines}

Return JSON with this exact shape:
{{
  "outliers": [
    {{"itemId": "id", "name": "name", "claim": "why it's over/under-valued (hypothesis)", "direction": "overvalued" | "undervalued"}}
  ],
  "effectSpotlights": [
    {{"itemId": "id", "name": "name", "insight": "what its effect is really worth / linked mechanic"}}
  ],
  "experimentalBuilds": [
    {{"title": "build name", "itemIds": ["id", "id", "id"], "rationale": "why try this (hypothesis)"}}
  ]
}}
Limit to at most 6 outliers, 6 effectSpotlights, 4 experimentalBuilds. Use only itemIds from the list."""


def build_digest_prompt(items: list, patch: str) -> str:
    lines = []
    for it in items:
        effect = strip_html(it.get("description", ""))[:90]
        lines.append(
            f"{it.get('id')} | {it.get('name')} | {it.get('cost')}g | "
            f"{it.get('goldEfficiency')}% | {effect}"
        )
    system = _DIGEST_SYSTEM.format(patch=patch)
    user = _DIGEST_USER.format(item_lines="\n".join(lines))
    return f"{system}\n\n{user}"
