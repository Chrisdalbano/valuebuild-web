import { ref, watch } from 'vue'
import { itemsApi } from '@/api/items'

// Lazily fetches the cached per-champion itemization analysis. Mirrors
// useAiAnalysis: loading/error plus a `pending` flag for "not generated yet"
// (pre-enrichment), shown as a graceful note rather than an error.
export function useChampionAnalysis(championIdRef) {
  const analysis = ref(null) // { coreBuild, buildPath, situational, experimental, economy, caveats }
  const loading = ref(false)
  const error = ref(false)
  const pending = ref(false)

  async function fetchAnalysis(id) {
    if (!id) {
      analysis.value = null
      return
    }
    loading.value = true
    error.value = false
    pending.value = false
    analysis.value = null
    try {
      const data = await itemsApi.getChampionAi(id)
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

  watch(() => championIdRef.value, id => fetchAnalysis(id), { immediate: true })

  return { analysis, loading, error, pending }
}
