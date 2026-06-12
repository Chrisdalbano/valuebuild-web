<script setup>
import { ref } from 'vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import { formatStatName } from '@/api/items'

const query = defineModel({ type: String, default: '' })

defineProps({
  suggestions: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-suggestion'])

const showSuggestions = ref(false)

function suggestionStats(item) {
  if (!item.statBreakdown) return ''
  return Object.keys(item.statBreakdown).slice(0, 2).map(formatStatName).join(', ')
}

function pick(item) {
  emit('select-suggestion', item)
  showSuggestions.value = false
}
</script>

<template>
  <div class="search-box-container">
    <div class="search-box">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="query"
        placeholder="Search items by name or stats (e.g., 'AD', 'crit', 'armor')..."
        class="search-input"
        @focus="showSuggestions = true"
        @blur="() => setTimeout(() => showSuggestions = false, 200)"
      />
      <button v-if="query" @click="query = ''" class="btn-clear-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div v-if="showSuggestions && query.length > 0 && suggestions.length > 0" class="search-suggestions">
      <div class="suggestions-header">Smart Suggestions</div>
      <button
        v-for="suggestion in suggestions.slice(0, 5)"
        :key="suggestion.id"
        @click="pick(suggestion)"
        class="suggestion-item"
      >
        <ItemIcon :item="suggestion" size="md" :alt="suggestion.name" class="suggestion-img" />
        <div class="suggestion-info">
          <div class="suggestion-name">{{ suggestion.name }}</div>
          <div class="suggestion-meta">
            <EfficiencyBadge :value="suggestion.goldEfficiency" class="suggestion-eff" />
            <span class="suggestion-stats">{{ suggestionStats(suggestion) }}</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-box-container { flex: 1; position: relative; }

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0 1rem;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: var(--accent-lead);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-lead) 10%, transparent);
}

.search-icon { width: 18px; height: 18px; color: var(--fg-muted); margin-right: 0.75rem; flex-shrink: 0; }

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.875rem 0;
  color: var(--fg-primary);
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder { color: var(--fg-muted); }

.btn-clear-search {
  background: transparent;
  border: none;
  color: var(--fg-secondary);
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear-search svg { width: 16px; height: 16px; }
.btn-clear-search:hover { color: var(--fg-primary); }
.btn-clear-search:hover svg { transform: rotate(90deg); }

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg-surface);
  border: 2px solid var(--accent-lead);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);
  z-index: var(--z-dropdown);
  max-height: 400px;
  overflow-y: auto;
}

.suggestions-header {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-lead);
  border-bottom: 1px solid var(--border);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--fg-primary);
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: var(--bg-elevated); }

.suggestion-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 2px solid var(--accent-lead);
  object-fit: contain;
  background: var(--bg-elevated);
  flex-shrink: 0;
}

.suggestion-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.suggestion-name { font-weight: 600; font-size: 0.9375rem; color: var(--fg-primary); }
.suggestion-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8125rem; }
.suggestion-eff { font-weight: 600; }
.suggestion-stats { color: var(--fg-muted); }

@media (max-width: 768px) {
  .search-box-container { width: 100%; }
  .search-box { width: 100%; }
  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 0.875rem 2.75rem 0.875rem 2.75rem;
  }
}
</style>
