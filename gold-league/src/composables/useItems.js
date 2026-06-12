import { ref } from 'vue'
import { itemsApi } from '@/api/items'
import { filterDeprecatedItems } from '@/utils/deprecatedItems'

// App-level item catalog: fetch once, filter deprecated, expose load state.
export function useItems() {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadItems() {
    loading.value = true
    error.value = null
    try {
      const data = await itemsApi.getItems()
      const rawItems = data.items || []
      items.value = filterDeprecatedItems(rawItems)
      console.log(`Loaded ${items.value.length} items (filtered ${rawItems.length - items.value.length} deprecated)`)
      if (items.value.length === 0) {
        error.value = 'No items found. Please refresh the data.'
      }
    } catch (err) {
      error.value = 'Failed to load items. Make sure the backend is running on http://localhost:8000'
      console.error('Load error:', err)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, loadItems }
}
