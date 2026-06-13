import { ref } from 'vue'
import { itemsApi } from '@/api/items'
import { filterDeprecatedItems } from '@/utils/deprecatedItems'

const SNAPSHOT_KEY = 'bv:item-snapshot'

function saveSnapshot(items) {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ savedAt: Date.now(), items }))
  } catch {
    /* quota/private mode — snapshot is best-effort */
  }
}

function loadSnapshot() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    const snap = JSON.parse(raw)
    return Array.isArray(snap.items) && snap.items.length > 0 ? snap : null
  } catch {
    return null
  }
}

// App-level item catalog: fetch once, filter deprecated, expose load state.
// When the network is unavailable, falls back to the last saved snapshot
// (localStorage) so the PWA keeps working offline.
export function useItems() {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const offlineSnapshot = ref(false) // true when showing the saved snapshot

  async function loadItems() {
    loading.value = true
    error.value = null
    offlineSnapshot.value = false
    try {
      const data = await itemsApi.getItems()
      const rawItems = data.items || []
      items.value = filterDeprecatedItems(rawItems)
      console.log(`Loaded ${items.value.length} items (filtered ${rawItems.length - items.value.length} deprecated)`)
      if (items.value.length === 0) {
        error.value = "We couldn't find any item data right now. Please try again shortly."
      } else {
        saveSnapshot(rawItems)
      }
    } catch (err) {
      const snap = loadSnapshot()
      if (snap) {
        items.value = filterDeprecatedItems(snap.items)
        offlineSnapshot.value = true
        console.warn('Network unavailable — showing the saved item snapshot.')
      } else {
        error.value = "We couldn't load item data right now. Please check your connection and try again."
        console.error('Load error:', err)
      }
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, offlineSnapshot, loadItems }
}
