<script setup>
import { formatStatName, formatStatValue } from '@/api/items'

defineProps({
  stats: { type: Object, required: true },
})
</script>

<template>
  <div class="analysis-card">
    <div class="analysis-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <h4>Combined Stats</h4>
    </div>
    <div class="combined-stats-list">
      <div v-for="(value, stat) in stats" :key="stat" class="combined-stat-row">
        <span class="stat-icon">▸</span>
        <span class="stat-name">{{ formatStatName(stat) }}</span>
        <span class="stat-value">{{ formatStatValue(stat, value) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-card {
  background: var(--bg-surface);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--accent-lead);
  font-weight: 700;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.analysis-header svg { width: 20px; height: 20px; }
.analysis-header h4 { margin: 0; font-size: 1rem; }

.combined-stats-list { max-height: 200px; overflow-y: auto; }

.combined-stat-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
}

.stat-icon { color: var(--accent-lead); font-weight: bold; }
.combined-stat-row .stat-name { color: var(--fg-secondary); font-size: 0.8125rem; }
.combined-stat-row .stat-value { color: var(--fg-primary); font-size: 0.875rem; font-weight: 600; text-align: right; }
</style>
