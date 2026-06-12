import { computed } from 'vue'

// Derived metrics for the current build: totals, combined stats,
// recommendation text, and synergy callouts.
export function useBuildStats(buildRef) {
  const totalCost = computed(() =>
    buildRef.value.reduce((sum, item) => sum + (item.cost || 0), 0)
  )

  const totalValue = computed(() =>
    buildRef.value.reduce((sum, item) => sum + (item.totalGoldValue || 0), 0)
  )

  const avgEfficiency = computed(() => {
    if (buildRef.value.length === 0) return 0
    const total = buildRef.value.reduce((sum, item) => sum + (item.goldEfficiency || 0), 0)
    return total / buildRef.value.length
  })

  const combinedStats = computed(() => {
    const stats = {}
    buildRef.value.forEach(item => {
      if (item.stats) {
        Object.entries(item.stats).forEach(([key, value]) => {
          stats[key] = (stats[key] || 0) + value
        })
      }
    })
    return stats
  })

  const recommendation = computed(() => {
    if (buildRef.value.length === 0) return ''
    const avgEff = avgEfficiency.value
    let text = ''
    if (avgEff >= 110) {
      text = 'Excellent build! High gold efficiency across all items. '
    } else if (avgEff >= 100) {
      text = 'Solid build with good stat value for the cost. '
    } else if (avgEff >= 90) {
      text = 'Decent build, but consider swapping lower efficiency items. '
    } else {
      text = 'This build has low gold efficiency. Look for more cost-effective alternatives. '
    }
    if (totalCost.value > 15000) {
      text += 'This is a very expensive full build.'
    } else if (totalCost.value > 10000) {
      text += 'Mid-late game build path.'
    } else {
      text += 'Early-mid game build path.'
    }
    return text
  })

  const synergies = computed(() => {
    if (buildRef.value.length < 2) return []
    const found = []
    const allStats = combinedStats.value
    if (allStats.FlatPhysicalDamageMod && allStats.FlatCritChanceMod) {
      found.push('Critical Strike synergy - AD and Crit work together for multiplicative damage')
    }
    if (allStats.FlatMagicDamageMod && allStats.PercentCooldownMod) {
      found.push('AP + CDR synergy - More spell casts with higher damage')
    }
    if (allStats.FlatHPPoolMod && (allStats.FlatArmorMod || allStats.FlatSpellBlockMod)) {
      found.push('Tank synergy - Health and resistances provide effective HP')
    }
    if (allStats.PercentLifeStealMod && allStats.FlatPhysicalDamageMod) {
      found.push('Sustain synergy - Higher AD increases healing from lifesteal')
    }
    if (allStats.PercentMovementSpeedMod) {
      found.push('Mobility advantage - Enhanced roaming and kiting potential')
    }
    return found
  })

  return { totalCost, totalValue, avgEfficiency, combinedStats, recommendation, synergies }
}
