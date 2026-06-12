<script setup>
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import { formatStatName, formatStatValue } from '@/api/items'
import { sanitizeDescription, buildItemImageUrl } from '@/utils/itemHelpers'

defineProps({
  item: { type: Object, required: true },
})
</script>

<template>
  <div class="build-item-tooltip">
    <div class="tooltip-header">
      <img :src="buildItemImageUrl(item.id)" :alt="item.name" class="tooltip-icon" />
      <div class="tooltip-title">
        <h4>{{ item.name }}</h4>
        <GoldValue :amount="item.cost" class="tooltip-cost" />
      </div>
    </div>

    <div class="tooltip-stats-grid">
      <div class="tooltip-stat">
        <span class="tooltip-label">Gold Efficiency</span>
        <EfficiencyBadge :value="item.goldEfficiency" :decimals="1" class="tooltip-value" />
      </div>
      <div class="tooltip-stat">
        <span class="tooltip-label">Stat Value</span>
        <GoldValue :amount="item.totalGoldValue" class="tooltip-value" />
      </div>
    </div>

    <div v-if="item.statBreakdown && Object.keys(item.statBreakdown).length > 0" class="tooltip-breakdown">
      <div class="tooltip-section-title">Stats Provided</div>
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
.build-item-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  width: 320px;
  background: var(--bg-canvas);
  border: 2px solid var(--accent-lead);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  margin-top: 0.5rem;
}

.tooltip-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
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
.tooltip-title h4 { color: var(--fg-primary); font-size: 1rem; margin: 0 0 0.375rem 0; font-weight: 700; }
.tooltip-cost { font-size: 0.875rem; font-weight: 700; }

.tooltip-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }

.tooltip-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
}

.tooltip-label {
  color: var(--fg-muted);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tooltip-value { color: var(--fg-primary); font-size: 1rem; font-weight: 700; }

.tooltip-breakdown { margin-bottom: 1rem; }

.tooltip-section-title {
  color: var(--accent-lead);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.tooltip-stats-list { display: flex; flex-direction: column; gap: 0.5rem; }

.tooltip-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
}

.tooltip-stat-item .stat-name { color: var(--fg-secondary); font-size: 0.8125rem; }

.tooltip-stat-item .stat-amount {
  color: var(--accent-lead);
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.tooltip-description { margin-bottom: 0; }
.tooltip-desc-text { color: var(--fg-secondary); font-size: 0.8125rem; line-height: 1.6; }
</style>
