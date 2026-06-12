<script setup>
const sortKey = defineModel('sortKey', { type: String, default: 'goldEfficiency' })
const sortDir = defineModel('sortDir', { type: Number, default: -1 })
</script>

<template>
  <select v-model="sortKey" class="sort-select">
    <option value="goldEfficiency">Sort: Efficiency</option>
    <option value="cost">Sort: Cost</option>
    <option value="name">Sort: Name</option>
    <option value="totalGoldValue">Sort: Gold Value</option>
  </select>

  <button @click="sortDir *= -1" class="btn-sort-dir" title="Toggle sort direction">
    {{ sortDir === 1 ? '↑' : '↓' }}
  </button>
</template>

<style scoped>
.sort-select {
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  color: var(--fg-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.sort-select:focus {
  outline: none;
  border-color: var(--accent-lead);
}

.btn-sort-dir {
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  color: var(--fg-primary);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sort-dir:hover {
  border-color: var(--accent-lead);
  background: var(--accent-lead);
  color: var(--bg-canvas);
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .sort-select {
    width: 100%;
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 0.75rem 1rem;
  }
  .btn-sort-dir { display: none; /* Hide on mobile to save space */ }
}
</style>
