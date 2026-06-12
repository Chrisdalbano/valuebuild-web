<script setup>
import { computed } from 'vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import NumberTicker from '@/components/atoms/NumberTicker.vue'

const props = defineProps({
  totalCost: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  avgEfficiency: { type: Number, required: true },
  goldIconUrl: { type: String, default: '' },
})

const netGain = computed(() => props.totalValue - props.totalCost)
</script>

<template>
  <div class="analysis-card">
    <div class="analysis-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
      <h4>Build Statistics</h4>
    </div>
    <div class="build-stats-grid">
      <div class="build-stat">
        <span class="stat-label">Total Cost</span>
        <span class="stat-value gold-line">
          <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> <NumberTicker :value="totalCost" />
        </span>
      </div>
      <div class="build-stat">
        <span class="stat-label">Gold Value</span>
        <span class="stat-value gold-line">
          <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> <NumberTicker :value="totalValue" />
        </span>
      </div>
      <div class="build-stat">
        <span class="stat-label">Net Gain</span>
        <span class="stat-value" :class="netGain >= 0 ? 'positive' : 'negative'">
          <NumberTicker :value="netGain" :prefix="netGain >= 0 ? '+' : ''" :decimals="2" />
          <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" />
        </span>
      </div>
      <div class="build-stat">
        <span class="stat-label">Avg Efficiency</span>
        <EfficiencyBadge :value="avgEfficiency" :decimals="1" class="stat-value" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-card {
  background: var(--bg-surface);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--accent-lead);
  font-weight: 700;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.analysis-header svg { width: 20px; height: 20px; }
.analysis-header h4 { margin: 0; font-size: 1rem; }

.build-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.build-stat {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.875rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.stat-label {
  color: var(--fg-muted);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  color: var(--fg-primary);
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.stat-value.positive { color: var(--fb-success); }
.stat-value.negative { color: var(--fb-error); }

.gold-line { color: var(--accent-lead); display: inline-flex; align-items: center; gap: 0.25rem; }

.gold-icon-inline {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
  margin-right: 2px;
}
</style>
