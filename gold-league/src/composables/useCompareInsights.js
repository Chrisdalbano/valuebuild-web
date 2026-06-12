import { computed } from 'vue'

// All derived comparison metrics for a set of items (winner, totals,
// ranges, complexity, recommendation text).
export function useCompareInsights(itemsRef) {
  const bestEfficiency = computed(() => {
    if (itemsRef.value.length === 0) return null
    return itemsRef.value.reduce(
      (best, item) => (item.goldEfficiency > best.goldEfficiency ? item : best),
      itemsRef.value[0]
    )
  })

  const secondBestEfficiency = computed(() => {
    if (itemsRef.value.length < 2) return null
    const sorted = [...itemsRef.value].sort((a, b) => b.goldEfficiency - a.goldEfficiency)
    return sorted[1]
  })

  const efficiencyGap = computed(() => {
    if (!bestEfficiency.value || !secondBestEfficiency.value) return 0
    return bestEfficiency.value.goldEfficiency - secondBestEfficiency.value.goldEfficiency
  })

  const totalCost = computed(() => itemsRef.value.reduce((sum, item) => sum + item.cost, 0))
  const totalValue = computed(() => itemsRef.value.reduce((sum, item) => sum + item.totalGoldValue, 0))
  const netGain = computed(() => Math.round(totalValue.value - totalCost.value))
  const avgCost = computed(() =>
    itemsRef.value.length === 0 ? 0 : Math.round(totalCost.value / itemsRef.value.length)
  )

  const minEfficiency = computed(() =>
    itemsRef.value.length === 0 ? 0 : Math.min(...itemsRef.value.map(i => i.goldEfficiency))
  )
  const maxEfficiency = computed(() =>
    itemsRef.value.length === 0 ? 0 : Math.max(...itemsRef.value.map(i => i.goldEfficiency))
  )
  const minCost = computed(() =>
    itemsRef.value.length === 0 ? 0 : Math.min(...itemsRef.value.map(i => i.cost))
  )
  const maxCost = computed(() =>
    itemsRef.value.length === 0 ? 0 : Math.max(...itemsRef.value.map(i => i.cost))
  )

  const itemsWithComponents = computed(() =>
    itemsRef.value.filter(item => item.from && item.from.length > 0)
  )
  const totalComponents = computed(() =>
    itemsWithComponents.value.reduce((sum, item) => sum + (item.from ? item.from.length : 0), 0)
  )
  const avgBuildCost = computed(() => {
    if (itemsWithComponents.value.length === 0) return 0
    const totalBuildCost = itemsWithComponents.value.reduce((sum, item) => sum + item.cost, 0)
    return Math.round(totalBuildCost / itemsWithComponents.value.length)
  })

  const recommendation = computed(() => {
    if (itemsRef.value.length < 2) return ''
    const sorted = [...itemsRef.value].sort((a, b) => b.goldEfficiency - a.goldEfficiency)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    const diffPercent = (((best.goldEfficiency - worst.goldEfficiency) / worst.goldEfficiency) * 100).toFixed(1)
    return `${best.name} offers the best gold efficiency at ${best.goldEfficiency.toFixed(1)}%, which is ${diffPercent}% better than ${worst.name}. However, remember that item passives, active effects, and champion synergies are equally important factors. Consider your champion's playstyle and team composition when making final decisions.`
  })

  return {
    bestEfficiency, efficiencyGap, totalCost, totalValue, netGain, avgCost,
    minEfficiency, maxEfficiency, minCost, maxCost,
    itemsWithComponents, totalComponents, avgBuildCost, recommendation,
  }
}
