<script setup>
import GoldValue from '@/components/atoms/GoldValue.vue'

defineProps({
  totalCost: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  netGain: { type: Number, required: true },
  avgCost: { type: Number, required: true },
})
</script>

<template>
  <div class="insight-card">
    <div class="insight-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
      <span>Gold Analysis</span>
    </div>
    <div class="gold-analysis">
      <div class="analysis-row">
        <span class="analysis-label">Total Investment</span>
        <GoldValue :amount="totalCost" class="analysis-value" />
      </div>
      <div class="analysis-row">
        <span class="analysis-label">Total Stat Value</span>
        <GoldValue :amount="totalValue" class="analysis-value" />
      </div>
      <div class="analysis-row highlight">
        <span class="analysis-label">Net Value Gain</span>
        <span class="analysis-value" :class="netGain >= 0 ? 'positive' : 'negative'">
          {{ netGain >= 0 ? '+' : '' }}{{ netGain }}g
        </span>
      </div>
      <div class="analysis-row">
        <span class="analysis-label">Average Cost/Item</span>
        <GoldValue :amount="avgCost" class="analysis-value" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.insight-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  transition: all 0.2s;
}

.insight-card:hover {
  border-color: var(--accent-lead);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--fg-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.insight-header svg { width: 16px; height: 16px; }

.gold-analysis { display: flex; flex-direction: column; gap: 0.625rem; }

.analysis-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
}

.analysis-row.highlight {
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--accent-lead) 10%, transparent),
    color-mix(in srgb, var(--accent-warm) 5%, transparent));
  border: 1px solid var(--border-strong);
}

.analysis-label { color: var(--fg-secondary); font-size: 0.8125rem; font-weight: 500; }
.analysis-value { color: var(--fg-primary); font-size: 1rem; font-weight: 700; }
.analysis-value.positive { color: var(--fb-success); }
.analysis-value.negative { color: var(--fb-error); }
</style>
