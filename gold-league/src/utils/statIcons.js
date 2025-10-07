/**
 * Stat Icons Mapping
 * Maps League of Legends stats to their corresponding official stat mod icon URLs
 * Icons from: https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/
 */

const STAT_MODS_BASE_URL = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods'
const STATS_BASE_URL = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/'

export const STAT_ICONS = {
  // Offensive Stats - Adaptive Force
  'FlatPhysicalDamageMod': `${STATS_BASE_URL}/icon_damage.png`,
  'FlatMagicDamageMod': `${STAT_MODS_BASE_URL}/statmodsadaptiveforceicon.png`,
  
  // Attack Speed
  'PercentAttackSpeedMod': `${STAT_MODS_BASE_URL}/statmodsattackspeedicon.png`,
  
  // Crit Chance - Use Adaptive Force (no specific crit icon)
  'FlatCritChanceMod': `${STATS_BASE_URL}/icon_crit.png`,
  'PercentCritChanceMod': `${STAT_MODS_BASE_URL}/icon_crit.png`,
  
  // Life Steal - Use Adaptive Force (no specific lifesteal icon)
  'PercentLifeStealMod': `${STAT_MODS_BASE_URL}/statmodsadaptiveforceicon.png`,
  
  // Defensive Stats
  'FlatArmorMod': `${STAT_MODS_BASE_URL}/statmodsarmoricon.png`,
  'FlatSpellBlockMod': `${STAT_MODS_BASE_URL}/statmodsmagicresicon.png`,
  'FlatHPPoolMod': `${STAT_MODS_BASE_URL}/statmodshealthplusicon.png`,
  'FlatHPRegenMod': `${STAT_MODS_BASE_URL}/statmodshealthscalingicon.png`,
  
  // Mana Stats - Use Health Plus as placeholder (no mana icon in statmods)
  'FlatMPPoolMod': `${STAT_MODS_BASE_URL}/statmodsadaptiveforceicon.png`,
  'FlatMPRegenMod': `${STAT_MODS_BASE_URL}/statmodsadaptiveforceicon.png`,
  
  // Mobility Stats
  'FlatMovementSpeedMod': `${STAT_MODS_BASE_URL}/statmodsmovementspeedicon.png`,
  'PercentMovementSpeedMod': `${STAT_MODS_BASE_URL}/statmodsmovementspeedicon.png`,
  
  // Utility Stats - Ability Haste / CDR
  'AbilityHaste': `${STAT_MODS_BASE_URL}/statmodscdrscalingicon.png`,
  'CooldownReduction': `${STAT_MODS_BASE_URL}/statmodscdrscalingicon.png`,
}

/**
 * Get icon URL for a stat
 * @param {string} statKey - The stat key (e.g., 'FlatPhysicalDamageMod')
 * @returns {string|null} Icon URL or null if not found
 */
export function getStatIcon(statKey) {
  return STAT_ICONS[statKey] || null
}

/**
 * Format stat name for display (moved from items.js)
 */
export function formatStatName(statKey) {
  const statNames = {
    'FlatPhysicalDamageMod': 'Attack Damage',
    'FlatMagicDamageMod': 'Ability Power',
    'FlatArmorMod': 'Armor',
    'FlatSpellBlockMod': 'Magic Resist',
    'FlatHPPoolMod': 'Health',
    'FlatMPPoolMod': 'Mana',
    'FlatHPRegenMod': 'HP Regen',
    'FlatMPRegenMod': 'Mana Regen',
    'PercentCritChanceMod': 'Crit Chance',
    'PercentAttackSpeedMod': 'Attack Speed',
    'FlatMovementSpeedMod': 'Movement Speed',
    'PercentMovementSpeedMod': 'Movement Speed %',
    'FlatCritChanceMod': 'Crit Chance',
    'PercentLifeStealMod': 'Life Steal',
    'AbilityHaste': 'Ability Haste'
  }
  return statNames[statKey] || statKey
}

/**
 * Get stat category color
 */
export function getStatColor(statKey) {
  const colors = {
    // Offensive - Red/Orange
    'FlatPhysicalDamageMod': '#ff6b6b',
    'FlatMagicDamageMod': '#a78bfa',
    'PercentAttackSpeedMod': '#fbbf24',
    'FlatCritChanceMod': '#f59e0b',
    'PercentCritChanceMod': '#f59e0b',
    'PercentLifeStealMod': '#ef4444',
    
    // Defensive - Blue/Green
    'FlatArmorMod': '#60a5fa',
    'FlatSpellBlockMod': '#8b5cf6',
    'FlatHPPoolMod': '#10b981',
    'FlatHPRegenMod': '#34d399',
    
    // Mana - Blue
    'FlatMPPoolMod': '#3b82f6',
    'FlatMPRegenMod': '#60a5fa',
    
    // Mobility - Yellow
    'FlatMovementSpeedMod': '#fbbf24',
    'PercentMovementSpeedMod': '#fbbf24',
    
    // Utility - Purple
    'AbilityHaste': '#a78bfa',
    'CooldownReduction': '#a78bfa',
  }
  return colors[statKey] || '#94a3b8'
}

