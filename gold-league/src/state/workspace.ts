import { computed, inject, onMounted, provide, ref, shallowRef, watch, type InjectionKey } from 'vue';
import snapshot from '../data/items.snapshot.json';
import { normalizeItems, parseIds, totals, type Dataset, type Item } from '../domain/items';
interface SavedBuild { id: string; name: string; items: string[]; patch: string; savedAt: string }
const key: InjectionKey<ReturnType<typeof createWorkspace>> = Symbol('buildvalue');
function createWorkspace() {
  const dataset = shallowRef<Dataset>(snapshot as Dataset);
  const items = computed(() => normalizeItems(dataset.value));
  const byId = computed(() => new Map(items.value.map(item => [item.id, item])));
  const buildIds = ref<string[]>([]), compareIds = ref<string[]>([]), saved = ref<SavedBuild[]>([]);
  const message = shallowRef(''), loading = shallowRef(false), source = shallowRef('Bundled snapshot');
  const selected = shallowRef<Item | null>(null), detailOpen = shallowRef(false);
  const undoIds = shallowRef<string[] | null>(null), storageAvailable = shallowRef(true);
  const name = shallowRef('Untitled build');
  const resolve = (ids: readonly string[]) => ids.flatMap(id => byId.value.get(id) || []);
  const build = computed(() => resolve(buildIds.value)), comparison = computed(() => resolve(compareIds.value));
  const summary = computed(() => totals(build.value));
  function announce(text: string) { message.value = text; }
  function add(item: Item) {
    if (buildIds.value.includes(item.id)) { announce(`${item.name} is already in your build.`); return; }
    if (buildIds.value.length >= 6) { announce('All six slots are filled. Remove an item before adding another.'); return; }
    undoIds.value = [...buildIds.value]; buildIds.value.push(item.id); announce(`Added ${item.name}.`);
  }
  function remove(id: string) { undoIds.value = [...buildIds.value]; buildIds.value = buildIds.value.filter(i => i !== id); announce('Item removed. Undo is available.'); }
  function clear() { undoIds.value = [...buildIds.value]; buildIds.value = []; announce('Build cleared. Undo is available.'); }
  function undo() { if (undoIds.value) { buildIds.value = [...undoIds.value]; undoIds.value = null; announce('Build restored.'); } }
  function compare(item: Item) {
    if (compareIds.value.includes(item.id)) compareIds.value = compareIds.value.filter(id => id !== item.id);
    else if (compareIds.value.length < 6) compareIds.value.push(item.id);
    else announce('Compare up to six items. Remove one to add another.');
  }
  function inspect(item: Item) { selected.value = item; detailOpen.value = true; }
  function save() {
    if (!build.value.length) { announce('Add an item before saving a build.'); return; }
    const label = name.value.trim().slice(0, 80) || 'Untitled build';
    saved.value.unshift({ id: crypto.randomUUID(), name: label, items: [...buildIds.value], patch: dataset.value.version, savedAt: new Date().toISOString() });
    saved.value = saved.value.slice(0, 30);
    announce(storageAvailable.value ? `Saved ${label} on this device.` : 'Storage is unavailable. Keep this tab open or copy a share link.');
  }
  function load(entry: SavedBuild) {
    undoIds.value = [...buildIds.value]; buildIds.value = entry.items.filter(id => byId.value.has(id)); name.value = entry.name;
    announce(entry.patch !== dataset.value.version ? `Loaded ${entry.name} with current patch values. Unavailable items were omitted.` : `Loaded ${entry.name}.`);
  }
  function discard(id: string) { saved.value = saved.value.filter(entry => entry.id !== id); announce('Saved build deleted.'); }
  function shareUrl() { const url = new URL('/builds', location.origin); url.searchParams.set('items', buildIds.value.join(',')); return url.href; }
  async function refresh() {
    if (loading.value) return;
    loading.value = true;
    try {
      const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', { signal: AbortSignal.timeout(8000) });
      if (!versionsResponse.ok) throw new Error('Versions unavailable');
      const versions: unknown = await versionsResponse.json();
      if (!Array.isArray(versions) || typeof versions[0] !== 'string' || !/^\d+\.\d+\.\d+$/.test(versions[0])) throw new Error('Invalid version');
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/item.json`, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Items unavailable');
      const data = await response.json() as Dataset;
      if (!data.version || !data.data || !Object.values(data.data).every(item => typeof item.name === 'string' && item.gold && item.stats && item.image && Array.isArray(item.tags))) throw new Error('Invalid item data');
      if (!normalizeItems(data).length) throw new Error('Empty dataset');
      dataset.value = data; source.value = 'Data Dragon';
      const previous = buildIds.value.length;
      buildIds.value = buildIds.value.filter(id => byId.value.has(id));
      compareIds.value = compareIds.value.filter(id => byId.value.has(id));
      if (previous !== buildIds.value.length) announce('Patch updated. Unavailable items were removed from your draft.');
      if (selected.value) selected.value = byId.value.get(selected.value.id) || null;
    } catch { source.value = 'Bundled snapshot · offline fallback'; }
    finally { loading.value = false; }
  }
  onMounted(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('buildvalue.workspace.v2') || '{}');
      buildIds.value = parseIds(stored.build).filter(id => byId.value.has(id));
      compareIds.value = parseIds(stored.compare).filter(id => byId.value.has(id));
      if (typeof stored.name === 'string') name.value = stored.name.slice(0, 80);
      if (Array.isArray(stored.saved)) saved.value = stored.saved.filter((entry: SavedBuild) => typeof entry?.id === 'string' && typeof entry.name === 'string' && typeof entry.patch === 'string' && Array.isArray(entry.items)).slice(0, 30).map((entry: SavedBuild) => ({ ...entry, name: entry.name.slice(0, 80), items: parseIds(entry.items) }));
    } catch { storageAvailable.value = false; }
    const shared = new URLSearchParams(location.search).get('items');
    if (shared !== null) { buildIds.value = parseIds(shared.split(',')).filter(id => byId.value.has(id)); announce('Shared build loaded. Stats use the displayed patch.'); }
    watch([buildIds, compareIds, saved, name], () => {
      try { localStorage.setItem('buildvalue.workspace.v2', JSON.stringify({ build: buildIds.value, compare: compareIds.value, saved: saved.value, name: name.value })); }
      catch { storageAvailable.value = false; announce('Your browser could not save this workspace. Copy a share link to keep your build.'); }
    }, { deep: true });
    void refresh();
  });
  return { items, dataset, build, buildIds, comparison, compareIds, summary, saved, selected, detailOpen, name, message, loading, source, storageAvailable, undoIds, add, remove, clear, undo, compare, inspect, save, load, discard, shareUrl, refresh, announce };
}
export function provideWorkspace() { const workspace = createWorkspace(); provide(key, workspace); return workspace; }
export function useWorkspace() { const workspace = inject(key); if (!workspace) throw new Error('Workspace provider missing'); return workspace; }

