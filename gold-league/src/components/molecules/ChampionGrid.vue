<script setup>
import { ref, computed } from 'vue'
import ChampionCard from './ChampionCard.vue'

const props = defineProps({
  champions: { type: Array, required: true },
})
defineEmits(['select'])

const search = ref('')
const classFilter = ref('all')
const CLASSES = ['all', 'Fighter', 'Mage', 'Tank', 'Marksman', 'Assassin', 'Support']

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.champions
    .filter(c => {
      if (classFilter.value !== 'all' && !(c.tags || []).includes(classFilter.value)) return false
      if (q && !c.name.toLowerCase().includes(q)) return false
      return true
    })
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
})
</script>

<template>
  <div class="champion-grid-wrap">
    <div class="grid-controls">
      <input v-model="search" class="champ-search" type="text" placeholder="Search champions…" />
      <div class="class-chips">
        <button
          v-for="c in CLASSES"
          :key="c"
          :class="['class-chip', { active: classFilter === c }]"
          @click="classFilter = c"
        >{{ c === 'all' ? 'All' : c }}</button>
      </div>
    </div>

    <p v-if="filtered.length === 0" class="grid-empty">No champions match.</p>
    <div v-else class="champion-grid">
      <ChampionCard
        v-for="champ in filtered"
        :key="champ.id"
        :champion="champ"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.grid-controls {
  display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;
  padding: 1rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
}
.champ-search {
  padding: 0.75rem 1rem; background: var(--bg-canvas); border: 1px solid var(--border);
  border-radius: var(--radius-md); color: var(--fg-primary); font-size: 0.9375rem;
}
.champ-search:focus { outline: none; border-color: var(--accent-lead); }

.class-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.class-chip {
  padding: 0.5rem 0.875rem; background: var(--bg-elevated); border: 2px solid var(--border);
  color: var(--fg-secondary); border-radius: var(--radius-md); cursor: pointer; font-weight: 500;
  font-size: 0.8125rem; transition: all 0.2s;
}
.class-chip:hover { border-color: var(--accent-lead); color: var(--fg-primary); }
.class-chip.active { background: var(--accent-lead); border-color: var(--accent-lead); color: var(--bg-canvas); font-weight: 600; }

.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: 1rem;
}
.grid-empty { color: var(--fg-muted); text-align: center; padding: 2rem; }

@media (max-width: 768px) {
  .champion-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.75rem; }
}
</style>
