<script setup>
// Toggleable chip group: clicking the active chip resets to 'all'.
const value = defineModel({ type: String, default: 'all' })

defineProps({
  options: { type: Array, required: true }, // [{ value, label }]
})

function toggle(option) {
  value.value = value.value === option ? 'all' : option
}
</script>

<template>
  <div class="filter-chip-group">
    <button
      v-for="option in options"
      :key="option.value"
      @click="toggle(option.value)"
      :class="['filter-chip', { active: value === option.value }]"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.filter-chip-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.filter-chip {
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  color: var(--fg-secondary);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: var(--accent-lead);
  color: var(--fg-primary);
}

.filter-chip.active {
  background: var(--accent-lead);
  border-color: var(--accent-lead);
  color: var(--bg-canvas);
  font-weight: 600;
}

@media (max-width: 768px) {
  .filter-chip-group { width: 100%; justify-content: flex-start; }
  .filter-chip { font-size: 0.8125rem; padding: 0.5rem 0.875rem; }
}

@media (max-width: 480px) {
  .filter-chip { font-size: 0.75rem; padding: 0.5rem 0.75rem; }
}
</style>
