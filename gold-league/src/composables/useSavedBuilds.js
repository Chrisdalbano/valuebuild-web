import { ref } from 'vue'

// Named builds persisted to localStorage, orthogonal to the URL `?b=` share
// mechanism (useShareableBuild). Stores item IDs only — names resolve against
// the live catalog at load time, exactly like the share links, so saves survive
// patches and don't bloat storage. Best-effort: quota/private-mode failures are
// swallowed (mirrors useItems' snapshot pattern).
const STORAGE_KEY = 'bv:saved-builds'
const MAX_BUILDS = 30

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data.builds) ? data.builds : []
  } catch {
    return []
  }
}

function persist(builds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, builds }))
  } catch {
    /* quota/private mode — best-effort */
  }
}

export function useSavedBuilds() {
  const savedBuilds = ref(load())

  function commit(next) {
    savedBuilds.value = next
    persist(next)
  }

  function saveBuild(name, itemIds) {
    const trimmed = (name || '').trim()
    if (!trimmed || !Array.isArray(itemIds) || itemIds.length === 0) return null
    const build = {
      id: `b${Date.now()}`,
      name: trimmed,
      itemIds: [...itemIds],
      savedAt: Date.now(),
    }
    commit([build, ...savedBuilds.value].slice(0, MAX_BUILDS))
    return build
  }

  function deleteBuild(id) {
    commit(savedBuilds.value.filter(b => b.id !== id))
  }

  function renameBuild(id, name) {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    commit(savedBuilds.value.map(b => (b.id === id ? { ...b, name: trimmed } : b)))
  }

  function loadBuild(id) {
    return savedBuilds.value.find(b => b.id === id)?.itemIds ?? null
  }

  return { savedBuilds, saveBuild, deleteBuild, renameBuild, loadBuild }
}
