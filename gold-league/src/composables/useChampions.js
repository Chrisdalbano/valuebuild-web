import { ref } from 'vue'
import { itemsApi } from '@/api/items'

// Champion reference fetched once and shared across all callers (module-level
// singleton). Exposes a champ-by-name lookup + a DDragon portrait icon URL, so
// the "Best on" panel can show a champion's face next to its name. Best-effort:
// if the fetch fails the panel just renders names without icons.
const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn'

const byName = ref(new Map())
const loaded = ref(false)
let inflight = null

function load() {
  if (loaded.value || inflight) return inflight
  inflight = itemsApi
    .getChampions()
    .then(data => {
      const map = new Map()
      for (const c of data.champions || []) map.set(c.name, c)
      byName.value = map
      loaded.value = true
    })
    .catch(() => { /* names render without icons */ })
    .finally(() => { inflight = null })
  return inflight
}

// resolve a champion name (exact DDragon name from the AI roster) to its square
// portrait icon URL, or null if unknown
function championIcon(name) {
  const c = byName.value.get(name)
  if (!c || !c.id || !c.patch) return null
  return `${DDRAGON}/${c.patch}/img/champion/${c.id}.png`
}

export function useChampions() {
  load()
  return { championIcon, loaded }
}
