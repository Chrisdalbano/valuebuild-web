<script setup>
import SuggestionCard from './SuggestionCard.vue'

defineProps({
  suggestions: { type: Array, required: true },
  subtitle: { type: String, required: true },
  build: { type: Array, required: true },
  goldIconUrl: { type: String, default: '' },
})

defineEmits(['add'])
</script>

<template>
  <div class="smart-suggestions">
    <div class="suggestions-header">
      <div>
        <h3>💡 Smart Suggestions</h3>
        <p class="suggestions-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="suggestions-grid">
      <SuggestionCard
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        :suggestion="suggestion"
        :disabled="build.length >= 6 || build.some(i => i.id === suggestion.id)"
        :gold-icon-url="goldIconUrl"
        @add="$emit('add', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.smart-suggestions {
  background: var(--bg-elevated);
  padding: 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 2px solid var(--border);
}

.suggestions-header { margin-bottom: 1.5rem; }
.smart-suggestions h3 { color: var(--accent-lead); margin-bottom: 0.5rem; font-size: 1.5rem; }
.suggestions-subtitle { color: var(--fg-muted); font-size: 0.9375rem; }

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .suggestions-grid { grid-template-columns: 1fr; }
}
</style>
