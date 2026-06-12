<script setup>
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import { formatStatName, formatStatValue } from '@/api/items'
import { sanitizeDescription } from '@/utils/itemHelpers'

defineProps({
  item: { type: Object, required: true },
  // shows a close button (mobile tap mode)
  closable: { type: Boolean, default: false },
})

defineEmits(['close'])
</script>

<template>
  <div>
    <div class="tooltip-close-btn" v-if="closable" @click.stop="$emit('close')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </div>

    <div class="tooltip-header">
      <ItemIcon :item-id="item.id" :alt="item.name" class="tooltip-icon" />
      <div class="tooltip-title">
        <h4>{{ item.name }}</h4>
      </div>
    </div>

    <div v-if="item.statBreakdown && Object.keys(item.statBreakdown).length > 0" class="tooltip-breakdown">
      <div class="tooltip-section-title">Stats</div>
      <div class="tooltip-stats-list">
        <div v-for="(stat, key) in item.statBreakdown" :key="key" class="tooltip-stat-item">
          <span class="stat-name">{{ formatStatName(key) }}</span>
          <span class="stat-amount">{{ formatStatValue(key, stat.amount) }}</span>
        </div>
      </div>
    </div>

    <div v-if="item.description" class="tooltip-description">
      <div class="tooltip-section-title">Effects</div>
      <div class="tooltip-desc-text">{{ sanitizeDescription(item.description) }}</div>
    </div>
  </div>
</template>

<style scoped>
.tooltip-close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.tooltip-close-btn svg { width: 14px; height: 14px; color: var(--fg-secondary); }
.tooltip-close-btn:hover { background: var(--accent-lead); border-color: var(--accent-lead); }
.tooltip-close-btn:hover svg { color: var(--bg-canvas); }

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.tooltip-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--accent-lead);
  object-fit: contain;
  background: var(--bg-surface);
}

.tooltip-title { flex: 1; }

.tooltip-title h4 {
  color: var(--fg-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.tooltip-breakdown { margin-bottom: 1rem; }

.tooltip-section-title {
  color: var(--accent-lead);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.625rem;
}

.tooltip-stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  background: var(--bg-surface);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.tooltip-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.tooltip-stat-item .stat-name { color: var(--fg-secondary); font-weight: 500; }

.tooltip-stat-item .stat-amount {
  color: var(--accent-lead);
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.tooltip-description {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.tooltip-desc-text {
  color: var(--fg-secondary);
  font-size: 0.8125rem;
  line-height: 1.6;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.tooltip-desc-text::-webkit-scrollbar { width: 4px; }
.tooltip-desc-text::-webkit-scrollbar-track { background: var(--bg-elevated); border-radius: 2px; }
.tooltip-desc-text::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }
.tooltip-desc-text::-webkit-scrollbar-thumb:hover { background: var(--accent-lead); }

@media (max-width: 480px) {
  .tooltip-header { gap: 0.625rem; }
  .tooltip-icon { width: 40px; height: 40px; }
  .tooltip-title h4 { font-size: 0.9375rem; }
  .tooltip-section-title { font-size: 0.6875rem; }
}
</style>
