import { ref } from 'vue'
import { isItemDeprecated } from '@/utils/deprecatedItems'

// Random "Flash Comparisons" sets for the home page QuickInsights.
export function useRandomComparisons(itemsRef) {
  const randomComparisons = ref([])

  function generateRandomComparisons() {
    if (itemsRef.value.length < 4) return

    const legendaryItems = itemsRef.value.filter(item => {
      if (isItemDeprecated(item)) return false
      if (item.cost < 2000 || item.goldEfficiency < 90) return false
      if (!item.id || !/^\d+$/.test(item.id.toString())) return false
      const hasStats = item.statBreakdown && Object.keys(item.statBreakdown).length > 0
      const hasEffects = item.description && item.description.length > 20
      return hasStats || hasEffects
    })

    if (legendaryItems.length < 3) return

    randomComparisons.value = []
    for (let i = 0; i < 3; i++) {
      const shuffled = [...legendaryItems].sort(() => 0.5 - Math.random())
      randomComparisons.value.push(shuffled.slice(0, 3))
    }
  }

  return { randomComparisons, generateRandomComparisons }
}
