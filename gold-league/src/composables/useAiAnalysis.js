import { ref, watch } from 'vue'
import { itemsApi } from '@/api/items'

// Lazily fetches the cached Gemini effect analysis for an item. Mirrors the
// useItems shape (loading/error) plus a `pending` flag for "not analyzed yet"
// (no key / no quota / pre-enrichment), which the UI shows as a graceful note
// rather than an error.
export function useAiAnalysis(itemRef) {
  const analysis = ref(null) // { effects, summary, caveats } when ready
  const loading = ref(false)
  const error = ref(false)
  const pending = ref(false)

  async function fetchAnalysis(id) {
    if (!id) return
    loading.value = true
    error.value = false
    pending.value = false
    analysis.value = null
    try {
      const data = await itemsApi.getItemAi(id)
      if (data && data.status === 'ready') {
        analysis.value = data
      } else {
        pending.value = true
      }
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  watch(
    () => itemRef.value?.id,
    id => fetchAnalysis(id),
    { immediate: true }
  )

  return { analysis, loading, error, pending }
}
