# Gold efficiency calculator based on League of Legends Wiki data
# Reference: https://leagueoflegends.fandom.com/wiki/Gold_efficiency

import re

# Base stat gold values (from reference items)
# NOTE: API returns percentages as decimals (0.4 = 40%, 1.0 = 100%)
STAT_VALUES = {
    # Basic stats from base items (flat values)
    "FlatPhysicalDamageMod": 35,        # AD from Long Sword (35g per 1 AD)
    "FlatMagicDamageMod": 20,           # AP from Amplifying Tome (20g per 1 AP)
    "FlatArmorMod": 20,                 # Armor from Cloth Armor (20g per 1 Armor)
    "FlatSpellBlockMod": 20,            # MR from Null-Magic Mantle (20g per 1 MR)
    "FlatHPPoolMod": 2.666667,          # HP from Ruby Crystal (2.67g per 1 HP)
    "FlatMPPoolMod": 1,                 # Mana from Sapphire Crystal (1g per 1 Mana)
    "FlatHPRegenMod": 300,              # HP Regen from Rejuvenation Bead (300g per 100% base, API gives 1.0 = 100%)
    "FlatMPRegenMod": 400,              # MP Regen from Faerie Charm (200g per 50% base, so 400g per 100%)
    "FlatMovementSpeedMod": 12,         # MS from Boots (12g per 1 MS)
    
    # Percentage stats (API returns as decimal where 1.0 = 100%)
    "PercentCritChanceMod": 4000,       # Crit: 40g per 1%, API gives decimal, so 4000g per 1.0 (100%)
    "PercentAttackSpeedMod": 2500,      # AS: 250g per 10%, API gives decimal, so 2500g per 1.0 (100%)
    "FlatCritChanceMod": 4000,          # Same as PercentCritChance (API returns as decimal)
    
    # Secondary stats from composite items
    "PercentLifeStealMod": 5355,        # Lifesteal: 53.55g per 1%, API gives decimal, so 5355g per 1.0 (100%)
    
    # Ability Haste (introduced in Season 11, replaces CDR)
    "AbilityHaste": 50,                 # Ability Haste: 25g per 1 AH (10 AH = 250g from Kindlegem)
}

# Additional stat mappings for Data Dragon API response
STAT_MAPPING = {
    "FlatPhysicalDamageMod": "FlatPhysicalDamageMod",
    "FlatMagicDamageMod": "FlatMagicDamageMod",
    "FlatArmorMod": "FlatArmorMod",
    "FlatSpellBlockMod": "FlatSpellBlockMod",
    "FlatHPPoolMod": "FlatHPPoolMod",
    "FlatMPPoolMod": "FlatMPPoolMod",
    "FlatHPRegenMod": "FlatHPRegenMod",
    "FlatMPRegenMod": "FlatMPRegenMod",
    "PercentCritChanceMod": "PercentCritChanceMod",
    "PercentAttackSpeedMod": "PercentAttackSpeedMod",
    "FlatMovementSpeedMod": "FlatMovementSpeedMod",
    "PercentLifeStealMod": "PercentLifeStealMod",
    "FlatCritChanceMod": "FlatCritChanceMod",
    "AbilityHaste": "AbilityHaste",
}

def parse_stats_from_description(description):
    """
    Parse stats from item description when stats field is empty or incomplete.
    Handles cases where stats appear only in description text.
    """
    stats = {}
    
    if not description:
        return stats
    
    # Remove HTML tags for cleaner parsing
    clean_desc = re.sub(r'<[^>]+>', ' ', description)
    
    # Pattern: "100% Base Health Regen" -> FlatHPRegenMod: 1.0
    # Also matches: "50% base health regeneration", "150% Base Health Regen"
    hp_regen_match = re.search(r'(\d+(?:\.\d+)?)%?\s+[Bb]ase [Hh]ealth [Rr]egen(?:eration)?', clean_desc)
    if hp_regen_match:
        value = float(hp_regen_match.group(1)) / 100  # Convert percentage to decimal (100% -> 1.0)
        stats['FlatHPRegenMod'] = value
    
    # Pattern: "50% Base Mana Regen" -> FlatMPRegenMod: 0.5
    # Also matches: "100% base mana regeneration"
    mp_regen_match = re.search(r'(\d+(?:\.\d+)?)%?\s+[Bb]ase [Mm]ana [Rr]egen(?:eration)?', clean_desc)
    if mp_regen_match:
        value = float(mp_regen_match.group(1)) / 100  # Convert percentage to decimal
        stats['FlatMPRegenMod'] = value
    
    # Pattern: "10 Ability Haste" or "15 ability haste" -> AbilityHaste: 10
    # Also matches: "20 Haste", "25 AH"
    ability_haste_match = re.search(r'(\d+(?:\.\d+)?)\s+[Aa]bility [Hh]aste', clean_desc)
    if ability_haste_match:
        value = float(ability_haste_match.group(1))
        stats['AbilityHaste'] = value
    else:
        # Alternative pattern: just "15 Haste" (less common)
        haste_match = re.search(r'(\d+(?:\.\d+)?)\s+[Hh]aste(?!\w)', clean_desc)
        if haste_match:
            stats['AbilityHaste'] = float(haste_match.group(1))
    
    return stats

def calculate_efficiency(item):
    """
    Calculate gold efficiency for an item based on its stats.
    
    Gold Efficiency = (Gold Value / Item Price) × 100%
    
    Where Gold Value is the sum of (stat amount × gold per stat point)
    """
    stats = item.get("stats", {}).copy() if item.get("stats") else {}
    
    # Always try to parse additional stats from description
    # This catches stats that DDragon might miss or put only in description
    description = item.get("description", "")
    parsed_stats = parse_stats_from_description(description)
    
    # Merge parsed stats with API stats
    # Parsed stats only add if the stat key doesn't already exist
    for stat_key, stat_value in parsed_stats.items():
        if stat_key not in stats:
            stats[stat_key] = stat_value
    
    gold = item.get("gold", {})
    cost = gold.get("total", 1)
    
    if cost <= 0:
        cost = 1  # Avoid division by zero
    
    # Calculate total gold value from stats
    gold_value = 0
    stat_breakdown = {}
    
    for stat_key, stat_value in stats.items():
        if stat_key in STAT_VALUES:
            value = STAT_VALUES[stat_key] * stat_value
            gold_value += value
            stat_breakdown[stat_key] = {
                "amount": stat_value,
                "goldValue": round(value, 2)
            }
    
    # Calculate efficiency percentage
    efficiency = (gold_value / cost) * 100 if cost > 0 else 0
    
    # Return item with additional calculated fields
    return {
        **item,
        "goldEfficiency": round(efficiency, 2),
        "totalGoldValue": round(gold_value, 2),
        "statBreakdown": stat_breakdown,
        "cost": cost
    }

def get_efficiency_rating(efficiency):
    """Get a text rating for gold efficiency"""
    if efficiency >= 120:
        return "Excellent"
    elif efficiency >= 100:
        return "Good"
    elif efficiency >= 80:
        return "Fair"
    else:
        return "Poor"

