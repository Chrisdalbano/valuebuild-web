import { computed } from 'vue'

const STAT_KEYWORDS = {
  'ad': 'FlatPhysicalDamageMod',
  'attack damage': 'FlatPhysicalDamageMod',
  'damage': 'FlatPhysicalDamageMod',
  'ap': 'FlatMagicDamageMod',
  'ability power': 'FlatMagicDamageMod',
  'magic damage': 'FlatMagicDamageMod',
  'armor': 'FlatArmorMod',
  'mr': 'FlatSpellBlockMod',
  'magic resist': 'FlatSpellBlockMod',
  'health': 'FlatHPPoolMod',
  'hp': 'FlatHPPoolMod',
  'mana': 'FlatMPPoolMod',
  'crit': 'FlatCritChanceMod',
  'critical': 'FlatCritChanceMod',
  'attack speed': 'PercentAttackSpeedMod',
  'as': 'PercentAttackSpeedMod',
  'movement speed': 'FlatMovementSpeedMod',
  'ms': 'FlatMovementSpeedMod',
  'speed': 'FlatMovementSpeedMod',
  'lifesteal': 'PercentLifeStealMod',
  'life steal': 'PercentLifeStealMod',
}

// Smart search suggestions: stat-keyword queries ("crit", "armor") rank items
// by that stat; anything else falls back to name search ranked by efficiency.
export function useItemSuggestions(itemsRef, searchRef, failedImagesRef) {
  const suggestions = computed(() => {
    if (!searchRef.value || searchRef.value.length < 2) return []
    const query = searchRef.value.toLowerCase()

    let matchingStat = null
    for (const [keyword, stat] of Object.entries(STAT_KEYWORDS)) {
      if (query.includes(keyword)) {
        matchingStat = stat
        break
      }
    }

    if (matchingStat) {
      return itemsRef.value
        .filter(item => {
          if (failedImagesRef.value.has(item.id)) return false
          if (!item.statBreakdown) return false
          return item.statBreakdown[matchingStat] && item.statBreakdown[matchingStat].amount > 0
        })
        .sort((a, b) => {
          const aAmount = a.statBreakdown[matchingStat]?.amount || 0
          const bAmount = b.statBreakdown[matchingStat]?.amount || 0
          return bAmount - aAmount
        })
        .slice(0, 10)
    }

    return itemsRef.value
      .filter(item => !failedImagesRef.value.has(item.id) && item.name.toLowerCase().includes(query))
      .sort((a, b) => b.goldEfficiency - a.goldEfficiency)
      .slice(0, 10)
  })

  return { suggestions }
}
