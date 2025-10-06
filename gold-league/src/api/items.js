import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export const itemsApi = {
  /**
   * Fetch all items with calculated gold efficiency
   */
  async getItems() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/items`)
      return response.data
    } catch (error) {
      console.error('Error fetching items:', error)
      throw error
    }
  },

  /**
   * Force refresh items from Riot API
   */
  async refreshItems() {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/items/refresh`)
      return response.data
    } catch (error) {
      console.error('Error refreshing items:', error)
      throw error
    }
  },

  /**
   * Get a specific item by ID
   */
  async getItem(itemId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/items/${itemId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching item ${itemId}:`, error)
      throw error
    }
  }
}

/**
 * Get image URL for an item
 * Try multiple CDN sources for reliability
 */
export function getItemImageUrl(itemId, version = '14.20.1') {
  // Primary: Data Dragon
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`
}

/**
 * Get fallback image URL from Community Dragon
 */
export function getItemImageUrlFallback(itemId) {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/${itemId.toLowerCase()}.png`
}

/**
 * Format stat names for display
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
    'FlatCritChanceMod': 'Crit Chance',
    'PercentLifeStealMod': 'Life Steal',
    'AbilityHaste': 'Ability Haste'
  }
  return statNames[statKey] || statKey
}

/**
 * Format stat value for display (converts decimals to percentages where needed)
 */
export function formatStatValue(statKey, value) {
  const percentageStats = [
    'PercentCritChanceMod',
    'PercentAttackSpeedMod',
    'FlatCritChanceMod',
    'PercentLifeStealMod',
    'PercentMovementSpeedMod'
  ]
  
  // API returns these as decimals (0.4 = 40%), so multiply by 100 for display
  if (percentageStats.includes(statKey)) {
    return `${(value * 100).toFixed(1)}%`
  }
  
  return value.toFixed(1)
}

