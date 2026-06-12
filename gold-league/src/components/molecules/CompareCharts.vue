<script setup>
import { ref, toRef } from 'vue'
import { useCompareCharts } from '@/composables/useCompareCharts'

const props = defineProps({
  items: { type: Array, required: true },
  allItems: { type: Array, required: true },
})

const effCanvas = ref(null)
const costValueCanvas = ref(null)
const componentCanvas = ref(null)

useCompareCharts(toRef(props, 'items'), toRef(props, 'allItems'), {
  effCanvas,
  costValueCanvas,
  componentCanvas,
})
</script>

<template>
  <div class="charts-section">
    <div class="chart-card">
      <div class="chart-header">
        <h3>Gold Efficiency Comparison</h3>
        <span class="chart-subtitle">Higher percentage = better value</span>
      </div>
      <canvas ref="effCanvas"></canvas>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <h3>Cost vs Value Analysis</h3>
        <span class="chart-subtitle"></span>
      </div>
      <canvas ref="costValueCanvas"></canvas>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <h3>Component Cost Breakdown</h3>
        <span class="chart-subtitle">How items build up in cost</span>
      </div>
      <canvas ref="componentCanvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: var(--bg-elevated);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.chart-header { margin-bottom: 1.25rem; }

.chart-card h3 { color: var(--fg-primary); font-size: 1.125rem; margin: 0 0 0.25rem 0; font-weight: 600; }

.chart-subtitle { color: var(--fg-muted); font-size: 0.75rem; }

.chart-card canvas { max-height: 280px; }

@media (max-width: 768px) {
  .charts-section { grid-template-columns: 1fr; }
}
</style>
