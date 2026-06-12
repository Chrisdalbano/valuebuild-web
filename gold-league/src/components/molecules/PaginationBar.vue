<script setup>
defineProps({
  total: { type: Number, required: true },
  hasMore: { type: Boolean, default: false },
  remaining: { type: Number, default: 0 },
})

const itemsPerPage = defineModel({ type: Number, default: 24 })

defineEmits(['load-more'])
</script>

<template>
  <div class="pagination-simple">
    <div class="pagination-info">
      <span class="showing-count">
        Showing <strong>{{ Math.min(itemsPerPage, total) }}</strong> of <strong>{{ total }}</strong> items
      </span>
      <select v-model.number="itemsPerPage" class="show-select">
        <option :value="24">Show 24</option>
        <option :value="48">Show 48</option>
        <option :value="96">Show 96</option>
        <option :value="total">Show All</option>
      </select>
    </div>

    <button v-if="hasMore && itemsPerPage < total" @click="$emit('load-more')" class="btn-load-more">
      <svg class="load-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12l7 7 7-7"/>
      </svg>
      Load {{ Math.min(24, remaining) }} More
    </button>
  </div>
</template>

<style scoped>
.pagination-simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  flex-wrap: wrap;
}

.pagination-info { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }

.showing-count { color: var(--fg-secondary); font-size: 0.875rem; }
.showing-count strong { color: var(--fg-primary); font-weight: 600; }

.show-select {
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  color: var(--fg-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.show-select:hover { border-color: var(--accent-lead); }

.show-select:focus {
  outline: none;
  border-color: var(--accent-lead);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-lead) 10%, transparent);
}

.btn-load-more {
  background: var(--accent-lead);
  color: var(--bg-canvas);
  border: 1px solid var(--accent-lead);
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-load-more:hover {
  background: var(--accent-lead-press);
  border-color: var(--accent-lead-press);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.load-icon { width: 16px; height: 16px; }

@media (max-width: 768px) {
  .pagination-simple { flex-direction: column; align-items: stretch; gap: 0.75rem; padding: 1rem; }
  .pagination-info { flex-direction: column; align-items: stretch; gap: 0.625rem; }
  .showing-count { text-align: center; }
  .show-select { width: 100%; font-size: 16px; /* Prevents zoom on iOS */ }
  .btn-load-more { width: 100%; justify-content: center; padding: 0.875rem 1.5rem; }
}
</style>
