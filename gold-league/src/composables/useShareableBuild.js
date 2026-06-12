import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Serializes the 6-item build into `/builds?b=3071,3153,...` and back.
// `buildRef` is the v-model array from App; `itemsRef` is the full catalog.
export function useShareableBuild(buildRef, itemsRef) {
  const route = useRoute()
  const router = useRouter()
  const hydrated = ref(false)

  function hydrateFromUrl() {
    if (hydrated.value) return
    const raw = route.query.b
    if (!raw || itemsRef.value.length === 0) return
    hydrated.value = true
    const ids = String(raw).split(',').map(s => s.trim()).filter(Boolean)
    const seen = new Set()
    const items = []
    for (const id of ids) {
      if (items.length >= 6 || seen.has(id)) continue
      const item = itemsRef.value.find(i => i.id === id)
      if (item) {
        items.push(item)
        seen.add(id)
      }
    }
    if (items.length > 0) buildRef.value = items
  }

  function syncToUrl() {
    const b = buildRef.value.map(i => i.id).join(',')
    const current = String(route.query.b || '')
    if (b === current) return
    router.replace({ query: { ...route.query, b: b || undefined } })
  }

  // hydrate as soon as both the route and the catalog are ready
  watch(itemsRef, hydrateFromUrl, { immediate: true })

  // keep the URL canonical as the build changes (after hydration settled)
  watch(buildRef, () => {
    if (route.path === '/builds') syncToUrl()
  }, { deep: true })

  function shareUrl() {
    const b = buildRef.value.map(i => i.id).join(',')
    return `${window.location.origin}/builds${b ? `?b=${b}` : ''}`
  }

  return { shareUrl }
}
