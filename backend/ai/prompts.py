"""Grounded prompt builders for Gemini. Every effect estimate is anchored to the
real base-stat gold values from efficiency.py so the model can't free-float — and
the prompts forbid restating the canonical efficiency as fact-including-effects.
"""

import re
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from efficiency import STAT_VALUES  # noqa: E402

# Bump a version to force re-generation of that pass on the next enrichment run
# (the resumable skip-check compares stored version == current). Use when the
# prompt/JSON shape changes so cached docs for the SAME patch get refreshed.
EFFECT_PROMPT_VERSION = 2
BEST_ON_PROMPT_VERSION = 1
DIGEST_PROMPT_VERSION = 2
CHAMPION_PROMPT_VERSION = 3  # v3: component-aware staged build progression

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
- For EACH effect, give a hard number (estimatedGoldValue) AND express that gold as concrete amounts
  of 2-3 RELEVANT base stats using the table above — e.g. 480g = "≈16 Magic Resist" OR "≈17 Armor" OR
  "≈178 Health". Use the table's gold-per-stat to do the division; show the actual numbers.
- Pick the comparison stats that fit the effect: shields/heals/tenacity -> MR/Armor/Health (effective HP);
  on-hit/empowered attacks/burn -> Attack Damage or Ability Power (think in terms of total bonus damage).
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
      "baseStatEquivalence": "one line relating the value to base stats",
      "comparisons": [
        {{"stat": "Magic Resist" | "Armor" | "Health" | "Attack Damage" | "Ability Power",
          "amount": <number of that stat this gold buys>, "gold": <gold = amount * table value>}}
      ]
    }}
  ],
  "summary": "1-2 sentence plain-language takeaway",
  "caveats": "1 sentence on why this is approximate"
}}
Each effect's comparisons array should have 2-3 entries with REAL numbers derived from the table.
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
stat-only gold efficiency and effect text, plus the champion roster. Surface \
non-obvious, SPECIFIC findings — not textbook meta knowledge.

Ground every estimate in these base-stat gold values:
{base_stats}

Hard rules:
- Quantify. Every outlier states its actual efficiency % and HOW FAR off it is, in gold terms
  (e.g. "97% efficient — its passive adds ~450g, ≈15 MR of effective value, that the % ignores").
- Effect spotlights must put a GOLD NUMBER on the effect and relate it to a base stat (MR/Armor/HP/AD/AP).
- Experimental builds must be NON-OBVIOUS and CHAMPION-SPECIFIC. Name the champion (from the roster) and
  the exact mechanic the build exploits. BAN generic meta stacks (e.g. Warmog's + Titanic on a generic
  tank, standard ADC crit cores) — if it's a build everyone already runs, do not include it.
- Use only itemIds from the provided list; use only champion names from the roster.
- Frame everything as hypotheses, not facts. Output STRICT JSON only."""

_DIGEST_USER = """Items (id | name | cost | stat-efficiency% | short effect):
{item_lines}

Champion roster (name | tags | range):
{roster}

Return JSON with this exact shape:
{{
  "outliers": [
    {{"itemId": "id", "name": "name", "efficiency": <number, the stat-only %>,
      "direction": "overvalued" | "undervalued",
      "claim": "quantified hypothesis citing gold/stat numbers"}}
  ],
  "effectSpotlights": [
    {{"itemId": "id", "name": "name", "estimatedEffectGold": <number>,
      "insight": "what the effect is worth in gold + the base-stat it compares to"}}
  ],
  "experimentalBuilds": [
    {{"title": "build name", "forChampion": "champion from roster", "itemIds": ["id", "id", "id"],
      "rationale": "the specific mechanic exploited + quantitative hook (NON-generic)"}}
  ]
}}
Limit to at most 6 outliers, 6 effectSpotlights, 4 experimentalBuilds."""


_BEST_ON_SYSTEM = """You are a League of Legends itemization analyst. Given one \
item and the current champion roster, name the champions who get the MOST value \
from this item and explain why, referencing their kit (abilities, scalings, \
resource, range) and the item's real stats/effect.

These base-stat gold values are the project's ground truth (context only):
{base_stats}

Rules:
- Pick champions ONLY from the provided roster; use their exact names.
- At most 5 champions, strongest synergy first.
- Each "why" is 1-2 sentences tying a concrete part of the champion's kit to this item.
- These are hypotheses about synergy, NOT statements about the item's gold efficiency.
- NEVER restate the item's overall efficiency; the canonical efficiency stays stat-only.
- Output STRICT JSON only, no prose outside it."""

_BEST_ON_USER = """Item: {name} (cost {cost}g)
Flat stats: {stats}
Effect text: {effect_text}

Champion roster (name | tags | range):
{roster}

Return JSON with this exact shape:
{{
  "champions": [
    {{
      "name": "exact champion name from the roster",
      "why": "1-2 sentences tying their kit to this item",
      "synergyStat": "the key stat/effect they exploit (e.g. AbilityHaste, OnHit, Lethality, Shield)",
      "confidence": "low" | "medium" | "high"
    }}
  ],
  "caveats": "1 sentence: speculative, varies by matchup/patch"
}}"""


def build_best_on_prompt(item: dict, champion_roster: list, patch: str) -> str:
    stats = ", ".join(sorted((item.get("statBreakdown") or {}).keys())) or "none"
    effect_text = strip_html(item.get("description", "")) or "(no effect text)"
    roster_lines = []
    for c in champion_roster:
        tags = "/".join(c.get("tags", [])) or "?"
        roster_lines.append(f"{c.get('name')} | {tags} | {c.get('rangeType', '?')}")
    system = _BEST_ON_SYSTEM.format(base_stats=_base_stat_table())
    user = _BEST_ON_USER.format(
        name=item.get("name", "?"),
        cost=item.get("cost", 0),
        stats=stats,
        effect_text=effect_text[:1200],
        roster="\n".join(roster_lines),
    )
    return f"{system}\n\n{user}"


def build_digest_prompt(items: list, patch: str, champions: list = None) -> str:
    lines = []
    for it in items:
        effect = strip_html(it.get("description", ""))[:90]
        lines.append(
            f"{it.get('id')} | {it.get('name')} | {it.get('cost')}g | "
            f"{it.get('goldEfficiency')}% | {effect}"
        )
    roster_lines = []
    for c in (champions or []):
        tags = "/".join(c.get("tags", [])) or "?"
        roster_lines.append(f"{c.get('name')} | {tags} | {c.get('rangeType', '?')}")
    system = _DIGEST_SYSTEM.format(patch=patch, base_stats=_base_stat_table())
    user = _DIGEST_USER.format(
        item_lines="\n".join(lines),
        roster="\n".join(roster_lines) or "(roster unavailable)",
    )
    return f"{system}\n\n{user}"


# compact stat readout from the priced statBreakdown, so the model picks items by
# what they actually give (not just by name) — reduces off-kit suggestions.
_STAT_SHORT = {
    "FlatPhysicalDamageMod": "AD", "FlatMagicDamageMod": "AP", "FlatArmorMod": "Armor",
    "FlatSpellBlockMod": "MR", "FlatHPPoolMod": "HP", "FlatMPPoolMod": "Mana",
    "PercentAttackSpeedMod": "AS", "PercentCritChanceMod": "Crit", "AbilityHaste": "AH",
    "PercentLifeStealMod": "Lifesteal", "FlatMovementSpeedMod": "MS",
}


def _stat_summary(item: dict) -> str:
    sb = item.get("statBreakdown") or {}
    parts = []
    for key, label in _STAT_SHORT.items():
        node = sb.get(key)
        amt = node.get("amount") if isinstance(node, dict) else None
        if not amt:
            continue
        parts.append(f"{round(amt * 100)}% {label}" if key.startswith("Percent") else f"{round(amt)} {label}")
    return ", ".join(parts) or "—"


_CHAMPION_SYSTEM = """You are a League of Legends itemization coach. For ONE champion, \
produce a focused, patch-{patch} Summoner's Rift itemization guide grounded in the \
champion's kit (abilities, scalings, resource, range) and the items' real stats/effects.

These base-stat gold values are the project's ground truth (context only):
{base_stats}

Rules:
- Recommend ONLY itemIds that appear in the rosters below. Use the exact ids.
- Be specific to THIS champion's kit and the items' stats; no generic "build damage" filler.
- The PROGRESSION is the heart of it: show how the player builds up stage by stage. Early
  stages (first back, first spike) should name the COMPONENT ids you buy and complete first
  (e.g. the AD/AP/health components toward the first item); later stages name FINISHED items.
- coreBuild = the ~5 FINISHED items of the standard full build.
- Situational entries name a real situation (vs heavy AP, vs tanks, vs healing, vs hard CC).
- experimental = one OFF-META idea the numbers/kit suggest, not the standard build.
- Speculative suggestions, NOT ground truth; never restate or alter the canonical efficiency.
- Output STRICT JSON only."""

_CHAMPION_USER = """Champion: {name}
Class tags: {tags} | Resource: {resource} | Range: {range_type}
Kit: passive "{passive}"; abilities {spells}
Riot ratings (0-10): attack {attack}, defense {defense}, magic {magic}

FINISHED items (id | name | cost | stats | effect):
{items}

COMPONENTS (id | name | cost | stats | builds toward):
{components}

Return JSON with this exact shape:
{{
  "coreBuild": {{ "itemIds": ["finished id", ...], "rationale": "1-2 sentences" }},
  "progression": [
    {{ "stage": "First back" | "First spike" | "Mid game" | "Full build" | "...",
       "gold": "approx gold for this stage, e.g. ~1300g",
       "itemIds": ["id (components early, finished later)"],
       "note": "what to buy now and why" }}
  ],
  "situational": [
    {{ "when": "vs heavy AP" | "vs tanks" | "vs healing" | "vs hard CC" | "...",
       "itemIds": ["finished id"], "why": "one line" }}
  ],
  "experimental": {{ "title": "name", "itemIds": ["finished id", ...], "rationale": "off-meta hook" }},
  "economy": {{ "ahead": "one line on snowballing", "behind": "one line on stabilizing" }},
  "caveats": "1 sentence: speculative, varies by matchup/patch"
}}
Limit: coreBuild ~5 finished items, progression 4-5 stages, 2-4 situational. Only roster ids."""


def build_champion_prompt(champion: dict, build_items: list, component_items: list, patch: str) -> str:
    info = champion.get("info", {}) or {}
    name_by_id = {it.get("id"): it.get("name") for it in (build_items + (component_items or []))}

    item_lines = []
    for it in build_items:
        effect = strip_html(it.get("description", ""))[:60]
        item_lines.append(
            f"{it.get('id')} | {it.get('name')} | {it.get('cost')}g | {_stat_summary(it)} | {effect}"
        )

    comp_lines = []
    for it in (component_items or []):
        into = (it.get("into") or [])
        toward = name_by_id.get(into[0]) if into else None
        toward = f"-> {toward}" if toward else ""
        comp_lines.append(
            f"{it.get('id')} | {it.get('name')} | {it.get('cost')}g | {_stat_summary(it)} | {toward}"
        )

    system = _CHAMPION_SYSTEM.format(patch=patch, base_stats=_base_stat_table())
    user = _CHAMPION_USER.format(
        name=champion.get("name", "?"),
        tags="/".join(champion.get("tags", [])) or "?",
        resource=champion.get("resource", "?"),
        range_type=champion.get("rangeType", "?"),
        passive=champion.get("passive", ""),
        spells=", ".join(champion.get("spells", [])) or "?",
        attack=info.get("attack", "?"),
        defense=info.get("defense", "?"),
        magic=info.get("magic", "?"),
        items="\n".join(item_lines),
        components="\n".join(comp_lines) or "(none)",
    )
    return f"{system}\n\n{user}"
