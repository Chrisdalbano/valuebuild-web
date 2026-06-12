<script setup>
defineProps({
  count: { type: Number, required: true },
})

defineEmits(['clear'])
</script>

<template>
  <div class="compare-header">
    <div class="header-left">
      <h2>
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        Item Comparison
      </h2>
      <span class="item-count">{{ count }} items selected</span>
    </div>
    <div class="header-actions">
      <button @click="$emit('clear')" class="btn-clear">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
        Clear All
      </button>
    </div>
  </div>
</template>

<style scoped>
.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border);
}

.header-left { display: flex; flex-direction: column; gap: 0.5rem; }

h2 {
  color: var(--accent-lead);
  font-size: 1.75rem;
  margin: 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.header-icon { width: 28px; height: 28px; color: var(--accent-lead); }
.item-count { color: var(--fg-muted); font-size: 0.875rem; font-weight: 500; }
.header-actions { display: flex; gap: 0.75rem; }

.btn-clear {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-clear svg { width: 16px; height: 16px; }
.btn-clear:hover { background: var(--fb-error); border-color: var(--fb-error); color: white; transform: translateY(-1px); }

@media (max-width: 768px) {
  .compare-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .header-actions { width: 100%; justify-content: space-between; }
  .btn-clear { flex: 1; }
}
</style>
