<script setup>
import { watch, nextTick, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { Chart, registerables } from 'chart.js'
import GoldValue from '@/components/atoms/GoldValue.vue'
import { formatStatName, formatStatValue } from '@/api/items'

Chart.register(...registerables)

const props = defineProps({
  item: { type: Object, required: true },
})

const statsChart = useTemplateRef('statsChart')
let chartInstance = null

function statPercent(goldValue) {
  if (!props.item?.totalGoldValue) return 0
  return Math.round((goldValue / props.item.totalGoldValue) * 100)
}

// NOTE: raw chart colors on purpose — data-viz layer, Phase 3 token item
function createStatsChart() {
  if (!statsChart.value || !props.item?.statBreakdown) return
  if (chartInstance) chartInstance.destroy()

  const stats = props.item.statBreakdown
  chartInstance = new Chart(statsChart.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(stats).map(key => formatStatName(key)),
      datasets: [{
        data: Object.values(stats).map(stat => stat.goldValue),
        backgroundColor: [
          'rgba(240, 168, 41, 0.8)', 'rgba(135, 64, 55, 0.8)', 'rgba(100, 100, 108, 0.8)',
          'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: '#18181b',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#e4e4e7', font: { size: 12 }, padding: 12 },
        },
        tooltip: {
          backgroundColor: '#18181b',
          titleColor: '#e4e4e7',
          bodyColor: '#a1a1aa',
          borderColor: '#3f3f46',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label(context) {
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              return `${context.label}: ${value}g (${((value / total) * 100).toFixed(1)}%)`
            },
          },
        },
      },
    },
  })
}

watch(() => props.item, () => nextTick(createStatsChart), { immediate: true })
onMounted(createStatsChart)
onUnmounted(() => chartInstance && chartInstance.destroy())
</script>

<template>
  <div class="stat-analysis">
    <h3>Stat Value Analysis</h3>
    <div class="chart-container">
      <canvas ref="statsChart"></canvas>
    </div>
    <div class="stat-list">
      <div v-for="(stat, key) in item.statBreakdown" :key="key" class="stat-item">
        <div class="stat-name">{{ formatStatName(key) }}</div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: statPercent(stat.goldValue) + '%' }"></div>
        </div>
        <div class="stat-details">
          <span class="stat-amount">{{ formatStatValue(key, stat.amount) }}</span>
          <GoldValue :amount="stat.goldValue" class="stat-value" />
          <span class="stat-percent">({{ statPercent(stat.goldValue) }}%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-analysis {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.stat-analysis h3 { color: var(--fg-primary); margin-bottom: 1.5rem; font-size: 1.125rem; font-weight: 600; }

.chart-container { max-width: 400px; margin: 0 auto 2rem; }

.stat-list { display: flex; flex-direction: column; gap: 1rem; }

.stat-item {
  background: var(--bg-surface);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.stat-name { font-weight: 600; color: var(--fg-primary); margin-bottom: 0.5rem; font-size: 0.875rem; }

.stat-bar {
  height: 8px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-lead), var(--accent-warm));
  transition: width 0.3s ease;
}

.stat-details { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--fg-secondary); }
.stat-amount { font-weight: 600; color: var(--fg-primary); }
.stat-percent { color: var(--fg-secondary); }
</style>
