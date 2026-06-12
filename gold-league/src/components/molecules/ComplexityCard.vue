<script setup>
defineProps({
  itemsWithComponents: { type: Number, required: true },
  totalComponents: { type: Number, required: true },
  avgBuildCost: { type: Number, required: true },
})
</script>

<template>
  <div class="insight-card">
    <div class="insight-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <span>Build Complexity</span>
    </div>
    <div class="complexity-stats">
      <div class="complexity-item">
        <div class="complexity-number">{{ itemsWithComponents }}</div>
        <div class="complexity-label">Items with Components</div>
      </div>
      <div class="complexity-item">
        <div class="complexity-number">{{ totalComponents }}</div>
        <div class="complexity-label">Total Components</div>
      </div>
      <div class="complexity-item">
        <div class="complexity-number">{{ avgBuildCost }}g</div>
        <div class="complexity-label">Avg Build Cost</div>
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

.complexity-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }

.complexity-item {
  text-align: center;
  padding: 0.75rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
}

.complexity-number { color: var(--accent-lead); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
.complexity-label { color: var(--fg-muted); font-size: 0.6875rem; font-weight: 500; line-height: 1.3; }

@media (max-width: 768px) {
  .complexity-stats { grid-template-columns: 1fr; }
}
</style>
