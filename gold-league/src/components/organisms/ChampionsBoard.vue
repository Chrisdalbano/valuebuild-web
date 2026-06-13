<script setup>
import { ref } from 'vue'
import ChampionGrid from '../molecules/ChampionGrid.vue'
import ChampionAnalysisPanel from '../molecules/ChampionAnalysisPanel.vue'
import { useChampions } from '@/composables/useChampions'

// Champions page: pick a champion, see a per-patch itemization guide
// (core build, build path, situational swaps, an off-meta experiment, economy).
defineProps({
  allItems: { type: Array, default: () => [] },
})

const { champions, iconById, loaded } = useChampions()
const selected = ref(null)

function select(champ) {
  selected.value = champ
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="champions-board">
    <header class="champions-header">
      <h1>Champions</h1>
      <p class="champions-sub">
        Pick a champion for a patch-specific itemization read: what to build, how it shifts by situation,
        and an off-meta idea the numbers suggest.
      </p>
    </header>

    <!-- detail view -->
    <template v-if="selected">
      <button class="back-btn" @click="selected = null">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        All champions
      </button>
      <div class="champ-detail-head">
        <img v-if="iconById(selected.id, selected.patch)" :src="iconById(selected.id, selected.patch)" :alt="selected.name" class="detail-portrait" @error="e => (e.target.style.display = 'none')" />
        <div>
          <h2>{{ selected.name }}</h2>
          <div class="detail-tags">
            <span v-for="t in selected.tags" :key="t" class="detail-tag">{{ t }}</span>
          </div>
        </div>
      </div>
      <ChampionAnalysisPanel :key="selected.id" :champion="selected" :all-items="allItems" />
    </template>

    <!-- grid view -->
    <template v-else>
      <div v-if="!loaded && champions.length === 0" class="champions-loading">Loading champions…</div>
      <ChampionGrid v-else :champions="champions" @select="select" />
    </template>
  </div>
</template>

<style scoped>
.champions-board { width: 100%; }
.champions-header { margin-bottom: 1.5rem; }
.champions-header h1 { font-size: clamp(1.75rem, 4vw, 2.25rem); font-weight: 800; color: var(--fg-primary); letter-spacing: -0.02em; margin-bottom: 0.5rem; }
.champions-sub { color: var(--fg-secondary); font-size: 1rem; line-height: 1.6; max-width: 64ch; }

.back-btn {
  display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;
  padding: 0.5rem 0.875rem; background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); color: var(--fg-secondary); font-weight: 600; font-size: 0.875rem; cursor: pointer;
  transition: all var(--dur-fast) var(--ease-standard);
}
.back-btn:hover { border-color: var(--accent-lead); color: var(--fg-primary); }
.back-btn svg { width: 16px; height: 16px; }

.champ-detail-head { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.detail-portrait { width: 72px; height: 72px; border-radius: var(--radius-md); border: 2px solid var(--accent-lead); object-fit: cover; }
.champ-detail-head h2 { color: var(--fg-primary); font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem; }
.detail-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.detail-tag { color: var(--accent-support); font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; background: var(--accent-support-tint); padding: 0.125rem 0.5rem; border-radius: 999px; }

.champions-loading { color: var(--fg-muted); text-align: center; padding: 3rem; }
</style>
