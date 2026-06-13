import { ref, computed, watch } from 'vue'
import { matchesCategory, isSupport } from '@/utils/itemClassify'

const PAGE_SIZE = 24

function matchesTier(item, tier) {
  if (tier === 'legendary') return item.cost >= 2500 && (!item.into || item.into.length === 0)
  if (tier === 'epic') return item.cost >= 1200 && item.cost < 2500
  if (tier === 'component') return item.into && item.into.length > 0 && item.cost < 1200
  if (tier === 'basic') return item.cost < 500
  return true
}

// Search/tier/type filtering + sorting + load-more pagination for an item list.
// `itemsRef` is the source list; `failedImages` excludes items whose icons 404'd.
// `typeFilter` matches Riot-tag-driven categories (see utils/itemClassify);
// `excludeSupport` hides GoldPer support items by default (they distort efficiency
// comparisons) unless the Support category is explicitly selected.
export function useItemFilters(itemsRef) {
  const search = ref('')
  const sortKey = ref('goldEfficiency')
  const sortDir = ref(-1)
  const tierFilter = ref('all')
  const typeFilter = ref('all')
  const excludeSupport = ref(true)
  const itemsPerPage = ref(PAGE_SIZE)
  const failedImages = ref(new Set())

  const filtered = computed(() => {
    const result = itemsRef.value.filter(item => {
      if (failedImages.value.has(item.id)) return false
      if (!item.id || typeof item.id !== 'string') return false

      // hide support items unless the Support category is the active filter
      if (excludeSupport.value && typeFilter.value !== 'support' && isSupport(item)) return false

      const matchesSearch = item.name.toLowerCase().includes(search.value.toLowerCase())
      const tierOk = tierFilter.value === 'all' || matchesTier(item, tierFilter.value)
      const typeOk = matchesCategory(item, typeFilter.value)

      return matchesSearch && tierOk && typeOk
    })

    return result.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]
      if (typeof aVal === 'string') return sortDir.value * aVal.localeCompare(bVal)
      return sortDir.value * (aVal - bVal)
    })
  })

  const displayedItems = computed(() => filtered.value.slice(0, itemsPerPage.value))
  const hasMoreItems = computed(() => filtered.value.length > itemsPerPage.value)
  const remainingItems = computed(() => filtered.value.length - itemsPerPage.value)

  function sortBy(key) {
    if (sortKey.value === key) {
      sortDir.value *= -1
    } else {
      sortKey.value = key
      sortDir.value = -1
    }
    itemsPerPage.value = PAGE_SIZE
  }

  function loadMore(count = PAGE_SIZE) {
    itemsPerPage.value += count
  }

  function markImageFailed(itemId) {
    if (!failedImages.value.has(itemId)) {
      failedImages.value.add(itemId)
      failedImages.value = new Set(failedImages.value)
    }
  }

  // Reset pagination when any filter changes
  watch([search, tierFilter, typeFilter, excludeSupport, sortKey], () => {
    itemsPerPage.value = PAGE_SIZE
  })

  watch(itemsPerPage, () => {
    if (itemsPerPage.value > filtered.value.length) {
      itemsPerPage.value = filtered.value.length
    }
  })

  return {
    search, sortKey, sortDir, tierFilter, typeFilter, excludeSupport, itemsPerPage, failedImages,
    filtered, displayedItems, hasMoreItems, remainingItems,
    sortBy, loadMore, markImageFailed,
  }
}
