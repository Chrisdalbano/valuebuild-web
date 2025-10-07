/**
 * Stat Icons Mapping
 * Maps League of Legends stats to their corresponding icon URLs
 */

export const STAT_ICONS = {
  // Offensive Stats
  'FlatPhysicalDamageMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/precision/coup-de-grace/coupgrace.png',
  'FlatMagicDamageMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/sorcery/arcane-comet/arcanecomet.png',
  'PercentAttackSpeedMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/precision/lethal-tempo/lethal-tempo-icon.png',
  'FlatCritChanceMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/first-strike/first-strike.png',
  'PercentCritChanceMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/first-strike/first-strike.png',
  'PercentLifeStealMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/domination/taste-of-blood/greentertaste-of-blood.png',
  
  // Defensive Stats
  'FlatArmorMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/resolve/bone-plating/boneplating.png',
  'FlatSpellBlockMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/resolve/second-wind/secondwind.png',
  'FlatHPPoolMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/resolve/overgrowth/overgrowth.png',
  'FlatHPRegenMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/resolve/revitalize/revitalize.png',
  
  // Mana Stats
  'FlatMPPoolMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/sorcery/manaflow-band/manaflowband.png',
  'FlatMPRegenMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/sorcery/gathering-storm/gathering-storm.png',
  
  // Mobility Stats
  'FlatMovementSpeedMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/sorcery/celerity/celeritytemp.png',
  'PercentMovementSpeedMod': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/sorcery/celerity/celeritytemp.png',
  
  // Utility Stats
  'AbilityHaste': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/sorcery/transcendence/transcendence.png',
  'CooldownReduction': 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/sorcery/transcendence/transcendence.png',
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

