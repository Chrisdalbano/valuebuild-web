<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import ItemHoverCard from './ItemHoverCard.vue'
import BuildItemRow from './BuildItemRow.vue'
import { itemsApi } from '@/api/items'
import { useChampions } from '@/composables/useChampions'

// Deterministic champion-derived research: the most-built items across all
// champion core builds this patch, plus a sample of off-meta champion
// experiments. No AI call — aggregated server-side from champion_analysis.
const props = defineProps({
  allItems: { type: Array, default: () => [] },
})

const router = useRouter()
const { championIcon } = useChampions()
const data = ref(null)

onMounted(async () => {
  try {
    const d = await itemsApi.getResearchChampions()
    if (d && d.status === 'ready') data.value = d
  } catch { /* stays hidden if unavailable */ }
})

const byId = computed(() => new Map(props.allItems.map(i => [i.id, i])))
const resolve = ids => (ids || []).map(id => byId.value.get(id)).filter(Boolean)
function tryBuild(ids) {
  const valid = resolve(ids).map(i => i.id)
  if (valid.length) router.push({ path: '/builds', query: { b: valid.join(',') } })
}
const maxCount = computed(() => Math.max(1, ...(data.value?.topItems || []).map(t => t.count)))
</script>

<template>
  <section v-if="data" class="research-section">
    <h3 class="research-h3">
      From the Champion Lab
      <span class="hyp">{{ data.championCount }} champions analyzed</span>
    </h3>

    <div class="rcm-block">
      <div class="rcm-label">Most-built items this patch</div>
      <div class="topitems">
        <div v-for="t in data.topItems" v-show="resolve([t.itemId]).length" :key="t.itemId" class="topitem">
          <ItemHoverCard :item="resolve([t.itemId])[0]" :mobile-tap="false">
            <ItemIcon :item="resolve([t.itemId])[0]" size="md" :alt="t.itemId" class="ti-icon" />
          </ItemHoverCard>
          <div class="ti-bar"><div class="ti-fill" :style="{ width: (t.count / maxCount * 100) + '%' }"></div></div>
          <span class="ti-count">{{ t.count }}</span>
        </div>
      </div>
    </div>

    <div v-if="data.experiments.length" class="rcm-block">
      <div class="rcm-label">Champion experiments <span class="off">off-meta</span></div>
      <div class="exp-grid">
        <article v-for="(e, i) in data.experiments" :key="i" class="exp-card">
          <div class="exp-champ">
            <img v-if="championIcon(e.champion)" :src="championIcon(e.champion)" :alt="e.champion" class="exp-cicon" @error="ev => (ev.target.style.display = 'none')" />
            <span>{{ e.champion }}</span>
            <span class="exp-title">{{ e.title }}</span>
          </div>
          <BuildItemRow :items="resolve(e.itemIds)" tryable @try="tryBuild" />
          <p v-if="e.rationale" class="exp-why">{{ e.rationale }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.research-section { margin-bottom: 2.5rem; }
.research-h3 { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; color: var(--fg-primary); font-size: 1.25rem; font-weight: 700; margin-bottom: 1.25rem; }
.hyp { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-support); background: var(--accent-support-tint); padding: 0.2rem 0.5rem; border-radius: 999px; }

.rcm-block { margin-bottom: 1.5rem; }
.rcm-label { color: var(--fg-muted); font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.875rem; }
.off { color: var(--accent-warm); background: color-mix(in srgb, var(--accent-warm) 15%, transparent); padding: 0.1rem 0.45rem; border-radius: 999px; margin-left: 0.375rem; }

.topitems { display: flex; flex-direction: column; gap: 0.5rem; }
.topitem { display: flex; align-items: center; gap: 0.75rem; }
.ti-icon { width: 34px; height: 34px; border-radius: var(--radius-sm); border: 1px solid var(--border-strong); object-fit: contain; background: var(--bg-surface); flex-shrink: 0; }
.ti-bar { flex: 1; height: 8px; background: var(--bg-surface); border-radius: 999px; overflow: hidden; }
.ti-fill { height: 100%; background: var(--accent-lead); border-radius: 999px; }
.ti-count { color: var(--accent-lead); font-weight: 800; font-size: 0.8125rem; min-width: 1.5rem; text-align: right; font-variant-numeric: tabular-nums; }

.exp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
.exp-card { padding: 1rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); }
.exp-champ { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.exp-cicon { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
.exp-champ > span:first-of-type { color: var(--fg-primary); font-weight: 700; font-size: 0.9375rem; }
.exp-title { color: var(--accent-warm); font-size: 0.75rem; font-weight: 600; }
.exp-why { color: var(--fg-secondary); font-size: 0.8125rem; line-height: 1.5; margin: 0.625rem 0 0; }
</style>
