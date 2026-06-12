<script setup>
const props = defineProps({
  items: { type: Array, required: true },
})

function truncate(name) {
  return name.substring(0, 15) + (name.length > 15 ? '...' : '')
}

function normalizedWidth(item) {
  const max = Math.max(...props.items.map(i => i.goldEfficiency))
  return (item.goldEfficiency / max) * 100
}
</script>

<template>
  <div class="insight-card">
    <div class="insight-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      <span>Component Efficiency</span>
    </div>
    <div class="component-comparison">
      <div v-for="item in items" :key="item.id" class="component-item">
        <div class="component-name">{{ truncate(item.name) }}</div>
        <div class="component-bar">
          <div class="component-fill" :style="{ width: normalizedWidth(item) + '%' }"></div>
          <span class="component-value">{{ item.goldEfficiency.toFixed(0) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.insight-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  transition: all 0.2s;
}

.insight-card:hover {
  border-color: var(--accent-lead);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--fg-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.insight-header svg { width: 16px; height: 16px; }

.component-comparison { display: flex; flex-direction: column; gap: 0.75rem; }
.component-item { display: flex; flex-direction: column; gap: 0.375rem; }
.component-name { color: var(--fg-secondary); font-size: 0.75rem; font-weight: 500; }

.component-bar {
  position: relative;
  height: 24px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.component-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-lead), var(--accent-warm));
  transition: width 0.3s ease;
}

.component-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--fg-primary);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}
</style>
