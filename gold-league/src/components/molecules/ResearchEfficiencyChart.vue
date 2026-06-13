<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Horizontal bar of the AI-flagged outliers' stat-only efficiency %, with a
// 100% break-even reference line. Green = undervalued, red = overvalued — a
// quick visual of HOW mispriced each item is. Chart colours are raw rgba on
// purpose (Chart.js config is JS, not CSS), matching useCompareCharts.
const props = defineProps({
  outliers: { type: Array, required: true },
})

const canvas = ref(null)
let chart = null

// only outliers that carry a numeric efficiency, sorted low -> high
const data = computed(() =>
  props.outliers
    .filter(o => typeof o.efficiency === 'number')
    .sort((a, b) => a.efficiency - b.efficiency)
)

function render() {
  if (!canvas.value || data.value.length === 0) return
  if (chart) chart.destroy()
  const rows = data.value
  chart = new Chart(canvas.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: rows.map(o => (o.name?.length > 18 ? o.name.slice(0, 18) + '…' : o.name)),
      datasets: [{
        label: 'Stat-only efficiency %',
        data: rows.map(o => o.efficiency),
        backgroundColor: rows.map(o =>
          o.direction === 'overvalued' ? 'rgba(225, 90, 76, 0.78)' : 'rgba(58, 191, 145, 0.78)'),
        borderColor: rows.map(o =>
          o.direction === 'overvalued' ? 'rgba(225, 90, 76, 1)' : 'rgba(58, 191, 145, 1)'),
        borderWidth: 1.5,
        borderRadius: 5,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#18181b', titleColor: '#e4e4e7', bodyColor: '#a1a1aa',
          borderColor: '#3f3f46', borderWidth: 1, padding: 12,
          callbacks: { label: c => ` ${c.parsed.x}% efficiency` },
        },
        // 100% break-even reference line
        annotation: undefined,
      },
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: 130,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#a1a1aa', font: { size: 11 }, callback: v => v + '%' },
        },
        y: { grid: { display: false }, ticks: { color: '#e4e4e7', font: { size: 11 } } },
      },
    },
  })
}

onMounted(render)
watch(data, render)
onUnmounted(() => chart && chart.destroy())
</script>

<template>
  <section v-if="data.length" class="research-section">
    <h3 class="research-h3">Mispricing Map <span class="legend">
      <span class="leg leg-under">undervalued</span><span class="leg leg-over">overvalued</span>
      <span class="leg-mark">100% = break-even</span>
    </span></h3>
    <div class="chart-wrap" :style="{ height: Math.max(180, data.length * 38) + 'px' }">
      <canvas ref="canvas"></canvas>
    </div>
  </section>
</template>

<style scoped>
.research-section { margin-bottom: 2.5rem; }
.research-h3 {
  display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
  color: var(--fg-primary); font-size: 1.25rem; font-weight: 700; margin-bottom: 1.25rem;
}
.legend { display: flex; align-items: center; gap: 0.625rem; margin-left: auto; }
.leg { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.125rem 0.5rem; border-radius: 999px; }
.leg-under { color: var(--eff-positive); background: color-mix(in srgb, var(--eff-positive) 14%, transparent); }
.leg-over { color: var(--eff-negative); background: color-mix(in srgb, var(--eff-negative) 14%, transparent); }
.leg-mark { font-size: 0.6875rem; color: var(--fg-muted); font-weight: 600; }

.chart-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
}
</style>
