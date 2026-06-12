<script setup>
const mode = defineModel({ type: String, default: 'grid' })
</script>

<template>
  <div class="view-toggle">
    <button @click="mode = 'grid'" :class="['view-btn', { active: mode === 'grid' }]" title="Grid view">
      <svg class="view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    </button>
    <button @click="mode = 'table'" :class="['view-btn', { active: mode === 'table' }]" title="Table view">
      <svg class="view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.view-toggle {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-elevated);
  padding: 0.375rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.view-btn {
  background: transparent;
  border: none;
  color: var(--fg-secondary);
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-icon { width: 18px; height: 18px; }

.view-btn:hover { color: var(--fg-primary); background: var(--bg-overlay); }

.view-btn.active { background: var(--accent-lead); color: var(--bg-canvas); }

@media (max-width: 768px) {
  .view-toggle { width: 100%; display: flex; gap: 0.5rem; }
  .view-btn { flex: 1; padding: 0.75rem; }
}
</style>
