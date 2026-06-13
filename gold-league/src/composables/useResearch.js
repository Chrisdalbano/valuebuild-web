import { ref, onMounted } from 'vue'
import { itemsApi } from '@/api/items'

// Fetches the current patch's AI research digest. `pending` covers
// no-key/no-quota/pre-enrichment (the UI shows an explanatory state, not an error).
export function useResearch() {
  const digest = ref(null) // { patch, outliers, effectSpotlights, experimentalBuilds, ... }
  const loading = ref(false)
  const error = ref(false)
  const pending = ref(false)

  async function load() {
    loading.value = true
    error.value = false
    pending.value = false
    try {
      const data = await itemsApi.getResearch()
      if (data && data.status === 'ready') {
        digest.value = data
      } else {
        pending.value = true
        digest.value = data || null // keep patch/configured for the pending message
      }
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { digest, loading, error, pending, reload: load }
}
