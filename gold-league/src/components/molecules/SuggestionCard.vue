<script setup>
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import { buildItemImageUrl } from '@/utils/itemHelpers'

defineProps({
  suggestion: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
  goldIconUrl: { type: String, default: '' },
})

defineEmits(['add'])
</script>

<template>
  <div class="suggestion-card">
    <div class="suggestion-header">
      <img :src="buildItemImageUrl(suggestion.id)" :alt="suggestion.name" class="suggestion-icon" />
      <div class="suggestion-info">
        <div class="suggestion-name">{{ suggestion.name }}</div>
        <div class="suggestion-reason">{{ suggestion.reason }}</div>
      </div>
    </div>
    <div class="suggestion-stats">
      <span class="suggestion-cost gold-line">
        <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> {{ suggestion.cost }}
      </span>
      <EfficiencyBadge :value="suggestion.goldEfficiency" :decimals="0" suffix=" efficient" class="suggestion-eff" />
    </div>
    <button @click="$emit('add', suggestion)" class="btn-add-suggestion" :disabled="disabled">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      Add to Build
    </button>
  </div>
</template>

<style scoped>
.suggestion-card {
  background: var(--bg-surface);
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.suggestion-card:hover {
  border-color: var(--accent-lead);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.suggestion-header { display: flex; gap: 1rem; margin-bottom: 1rem; }

.suggestion-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-strong);
  object-fit: contain;
  background: var(--bg-canvas);
}

.suggestion-info { flex: 1; }
.suggestion-name { color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.375rem; }
.suggestion-reason { color: var(--fg-muted); font-size: 0.75rem; line-height: 1.4; }

.suggestion-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
}

.suggestion-cost { font-weight: 700; font-family: 'Monaco', 'Courier New', monospace; }
.suggestion-eff { font-weight: 600; font-size: 0.8125rem; }

.gold-line { color: var(--accent-lead); display: inline-flex; align-items: center; gap: 0.25rem; }

.gold-icon-inline {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
  margin-right: 2px;
}

.btn-add-suggestion {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--accent-lead);
  border: none;
  border-radius: var(--radius-md);
  color: var(--bg-canvas);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-suggestion svg { width: 14px; height: 14px; }
.btn-add-suggestion:not(:disabled):hover { background: var(--accent-lead-press); transform: translateY(-1px); }
.btn-add-suggestion:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
