// Known deprecated items that should NEVER be displayed
// This includes Mythic items (removed Season 2024) and other deprecated items

export const DEPRECATED_ITEM_IDS = new Set([
  // Mythic Items (Season 2023 and earlier)
  '3152', // Hextech Rocketbelt
  '4633', // Riftmaker
  '4636', // Night Harvester
  '6653', // Liandry's Anguish (Mythic)
  '3001', // Evenshroud (Mythic)
  '4005', // Imperial Mandate
  '2065', // Shurelya's Battlesong (Mythic)
  '3190', // Locket of the Iron Solari (Mythic)
  '6617', // Moonstone Renewer
  '6630', // Goredrinker
  '6631', // Stridebreaker
  '6632', // Divine Sunderer
  '6691', // Duskblade of Draktharr (Mythic)
  '6692', // Eclipse (Mythic)
  '6693', // Prowler's Claw
  '3068', // Sunfire Aegis (Mythic)
  '6664', // Turbo Chemtank
  '4644', // Crown of the Shattered Queen
  '3146', // Hextech Gunblade (removed)
  '3030', // Hextech GLP-800 (removed)
  '3092', // Frost Queen's Claim (removed)
  '3401', // Face of the Mountain (removed)
  '3069', // Abyssal Mask (old version)
  
  // Add more as discovered
])

export const DEPRECATED_KEYWORDS = [
  'mythic',
  'removed',
  'deprecated',
  'old',
  'legacy'
]

/**
 * Check if an item is deprecated and should not be displayed
 * @param {Object} item - The item object to check
 * @returns {boolean} - True if item is deprecated
 */
export function isItemDeprecated(item) {
  if (!item || !item.id) return true
  
  // Check ID against blacklist
  if (DEPRECATED_ITEM_IDS.has(String(item.id))) {
    return true
  }
  
  // Check description for deprecated keywords
  const description = (item.description || '').toLowerCase()
  if (DEPRECATED_KEYWORDS.some(keyword => description.includes(keyword))) {
    return true
  }
  
  // Check name for deprecated keywords
  const name = (item.name || '').toLowerCase()
  if (DEPRECATED_KEYWORDS.some(keyword => name.includes(keyword))) {
    return true
  }
  
  return false
}

/**
 * Filter out deprecated items from a list
 * @param {Array} items - Array of items to filter
 * @returns {Array} - Filtered array without deprecated items
 */
export function filterDeprecatedItems(items) {
  return items.filter(item => !isItemDeprecated(item))
}

