import { computed } from 'vue'
import { isItemDeprecated } from '@/utils/deprecatedItems'

const CDRAGON = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default'
export const buildRoleOptions = [
  { value: 'all', label: 'All', icon: `${CDRAGON}/star-outline-resting.png` },
  { value: 'marksman', label: 'Marksman', icon: `${CDRAGON}/role-icon-marksman.png` },
  { value: 'mage', label: 'Mage', icon: `${CDRAGON}/role-icon-mage.png` },
  { value: 'tank', label: 'Tank', icon: `${CDRAGON}/role-icon-tank.png` },
  { value: 'fighter', label: 'Fighter', icon: `${CDRAGON}/role-icon-fighter.png` },
  { value: 'assassin', label: 'Assassin', icon: `${CDRAGON}/role-icon-assassin.png` },
  { value: 'support', label: 'Support', icon: `${CDRAGON}/role-icon-support.png` },
]

export const ROLE_MATCHERS = {
  marksman: s => s.FlatPhysicalDamageMod || s.FlatCritChanceMod || s.PercentAttackSpeedMod,
  mage: s => s.FlatMagicDamageMod || s.FlatMPRegenMod,
  tank: s => s.FlatHPPoolMod || s.FlatArmorMod || s.FlatSpellBlockMod,
  fighter: s => (s.FlatPhysicalDamageMod && s.FlatHPPoolMod) || s.PercentLifeStealMod,
  assassin: s => s.FlatPhysicalDamageMod && !s.FlatCritChanceMod,
  support: s => s.FlatMPRegenMod || s.FlatHPRegenMod,
}

function itemReason(item) {
  const stats = item.statBreakdown || {}
  if (stats.FlatPhysicalDamageMod && stats.FlatCritChanceMod) {
    return 'High AD & Crit - Great for sustained DPS'
  } else if (stats.FlatMagicDamageMod && Object.keys(stats).length >= 3) {
    return 'Strong AP with utility stats'
  } else if (stats.FlatHPPoolMod && (stats.FlatArmorMod || stats.FlatSpellBlockMod)) {
    return 'Excellent defensive stats'
  } else if (item.goldEfficiency >= 110) {
    return 'Outstanding gold efficiency'
  } else if (item.goldEfficiency >= 100) {
    return 'Cost-effective core item'
  }
  return 'Solid stats for the price'
}

// Role-filtered "smart suggestions" for the build board.
export function useBuildSuggestions(itemsRef, buildRef, roleRef) {
  const suggestions = computed(() => {
    if (itemsRef.value.length === 0) return []

    let filtered = itemsRef.value.filter(item => {
      if (isItemDeprecated(item)) return false
      if (item.cost < 2000 || item.goldEfficiency < 85) return false
      if (buildRef.value.some(i => i.id === item.id)) return false
      if (!item.id || !/^\d+$/.test(item.id.toString())) return false
      const hasStats = item.statBreakdown && Object.keys(item.statBreakdown).length > 0
      const hasEffects = item.description && item.description.length > 20
      return hasStats || hasEffects
    })

    const matcher = ROLE_MATCHERS[roleRef.value]
    if (roleRef.value !== 'all' && matcher) {
      filtered = filtered.filter(item => matcher(item.statBreakdown || {}))
    }

    return filtered
      .sort((a, b) => b.goldEfficiency - a.goldEfficiency)
      .slice(0, 6)
      .map(item => ({ ...item, reason: itemReason(item) }))
  })

  const subtitle = computed(() => {
    if (roleRef.value === 'all') return 'Top rated items across all categories'
    const roleLabel = buildRoleOptions.find(r => r.value === roleRef.value)?.label || 'this role'
    return `Optimized items for ${roleLabel} builds`
  })

  return { suggestions, subtitle }
}
