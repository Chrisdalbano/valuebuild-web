// Known deprecated items that should NEVER be displayed
// This includes Mythic items (removed Season 2024) and other deprecated items

export const DEPRECATED_ITEM_IDS = new Set([
  // Truly deprecated/removed items (NOT available on Summoner's Rift)
  '4636', // Night Harvester (not on SR)
  '3001', // Evenshroud (not on SR)
  '4005', // Imperial Mandate (not on SR)
  '6632', // Divine Sunderer (not on SR)
  '6691', // Duskblade of Draktharr (not on SR)
  '6692', // Eclipse (not on SR)
  '6693', // Prowler's Claw (not on SR)
  '6664', // Turbo Chemtank (not on SR)
  '6630', // Goredrinker (confirmed not on SR)
  '4644', // Crown of the Shattered Queen (confirmed not on SR)
  '3146', // Hextech Gunblade (removed from game)
  '3030', // Hextech GLP-800 (removed from game)
  '3092', // Frost Queen's Claim (removed from game)
  '3401', // Face of the Mountain (removed from game)
  '3069', // Abyssal Mask (old version)

  // ARAM-exclusive "Guardian's" starter line (DDragon mis-marks them SR-available;
  // structurally identical to Doran's, so blocked by id + the name guard below).
  // 3026 "Guardian Angel" is a legit SR legendary and is NOT listed.
  '2051', // Guardian's Horn (ARAM)
  '3112', // Guardian's Orb (ARAM)
  '3177', // Guardian's Blade (ARAM)
  '3184', // Guardian's Hammer (ARAM)

  // NOTE: The following items ARE available on SR and were removed from this list:
  // '3152' - Hextech Rocketbelt (available on SR)
  // '4633' - Riftmaker (available on SR)
  // '6653' - Liandry's Torment (available on SR)
  // '2065' - Shurelya's Battlesong (available on SR)
  // '3190' - Locket of the Iron Solari (available on SR)
  // '6617' - Moonstone Renewer (available on SR)
  // '6631' - Stridebreaker (available on SR)
  // '3068' - Sunfire Aegis (available on SR)
])

export const DEPRECATED_KEYWORDS = [
  'mythic',
  'removed',
  'deprecated',
  'legacy'
]

// NOTE: Removed 'old' keyword - causes false positives
// Items like Statikk Shiv have "cooldown" which contains "old"

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

  // ARAM-exclusive "Guardian's X" line ("Guardian Angel" has no apostrophe-s)
  if (name.startsWith("guardian's ")) {
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

