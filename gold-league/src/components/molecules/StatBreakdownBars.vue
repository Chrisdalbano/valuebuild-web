<script setup>
import { formatStatValue } from '@/api/items'
import { getStatIcon, formatStatName, getStatColor } from '@/utils/statIcons.js'

defineProps({
  item: { type: Object, required: true },
})

function statPercent(goldValue, totalValue) {
  if (!totalValue) return 0
  return Math.round((goldValue / totalValue) * 100)
}
</script>

<template>
  <div class="stat-breakdown-visual">
    <div class="breakdown-header">
      <span class="breakdown-title">Stat Breakdown</span>
      <span class="breakdown-total">{{ item.totalGoldValue }}g total</span>
    </div>
    <div class="breakdown-bars">
      <div v-for="(stat, key) in item.statBreakdown" :key="key" class="breakdown-bar-item">
        <div class="bar-label">
          <div class="bar-stat-name">
            <img v-if="getStatIcon(key)" :src="getStatIcon(key)" :alt="formatStatName(key)" class="stat-icon" />
            <span>{{ formatStatName(key) }}</span>
          </div>
          <span class="bar-stat-value">{{ formatStatValue(key, stat.amount) }}</span>
        </div>
        <div class="bar-wrapper">
          <div
            class="bar-fill"
            :style="{ width: statPercent(stat.goldValue, item.totalGoldValue) + '%', backgroundColor: getStatColor(key) }"
          ></div>
        </div>
        <span class="bar-gold">{{ stat.goldValue }}g</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-breakdown-visual {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.breakdown-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

.breakdown-title {
  color: var(--accent-lead);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.breakdown-total {
  color: var(--accent-lead);
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.breakdown-bars { display: flex; flex-direction: column; gap: 0.75rem; }

.breakdown-bar-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 0.75rem;
  align-items: center;
}

.bar-label { display: flex; flex-direction: column; gap: 0.125rem; }

.bar-stat-name {
  color: var(--fg-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.stat-icon { width: 16px; height: 16px; object-fit: contain; flex-shrink: 0; filter: brightness(1.1); }

.bar-stat-value {
  color: var(--accent-lead);
  font-size: 0.8125rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.bar-wrapper { height: 8px; background: var(--bg-elevated); border-radius: 4px; overflow: hidden; }

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-lead), var(--accent-warm));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-gold {
  color: var(--accent-lead);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
  text-align: right;
  min-width: 50px;
}
</style>
