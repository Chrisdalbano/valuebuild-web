<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Build timeline: each stage's cumulative gold (exact, from real item costs) vs
// game time under three farm paces. The item spikes are plotted where the "even"
// pace reaches them, so you can read WHEN each power spike comes online and how a
// lead/deficit shifts it. Gold totals are exact; timings are an estimate from a
// gold/min model (passive + CS), labeled as such. Raw rgba like the other charts.
const props = defineProps({
  // [{ name, gold }] cumulative gold per stage, in order
  stages: { type: Array, required: true },
})

const canvas = ref(null)
let chart = null

const START_GOLD = 500 // starting gold
// gold/min incl. passive (~125) + CS/kills by pace
const PACES = [
  { key: 'Behind', rate: 255, color: '225, 90, 76' },
  { key: 'Even', rate: 345, color: '240, 168, 41' },
  { key: 'Ahead', rate: 445, color: '58, 191, 145' },
]
const EVEN = PACES[1]

const data = computed(() => props.stages.filter(s => s.gold > 0))

function timeFor(gold, rate) {
  return Math.max(0, (gold - START_GOLD) / rate)
}

function render() {
  if (!canvas.value || data.value.length === 0) return
  if (chart) chart.destroy()
  const rows = data.value
  const maxGold = rows[rows.length - 1].gold
  const maxMin = Math.ceil(timeFor(maxGold, PACES[0].rate)) + 1 // when 'behind' finishes

  const line = pace => ({
    label: pace.key,
    data: [
      { x: 0, y: START_GOLD },
      { x: maxMin, y: START_GOLD + pace.rate * maxMin },
    ],
    borderColor: `rgba(${pace.color}, 0.9)`,
    backgroundColor: `rgba(${pace.color}, 0.08)`,
    borderWidth: 2,
    pointRadius: 0,
    tension: 0,
    fill: false,
  })

  const spikes = {
    label: 'Item spikes (even pace)',
    data: rows.map(s => ({ x: timeFor(s.gold, EVEN.rate), y: s.gold, name: s.name })),
    showLine: false,
    pointRadius: 6,
    pointHoverRadius: 8,
    pointBackgroundColor: '#f0a829',
    pointBorderColor: '#18181b',
    pointBorderWidth: 2,
  }

  chart = new Chart(canvas.value.getContext('2d'), {
    type: 'line',
    data: { datasets: [...PACES.map(line), spikes] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      plugins: {
        legend: { labels: { color: '#e4e4e7', usePointStyle: true, padding: 14, font: { size: 11 } } },
        tooltip: {
          backgroundColor: '#18181b', titleColor: '#e4e4e7', bodyColor: '#a1a1aa',
          borderColor: '#3f3f46', borderWidth: 1, padding: 12,
          callbacks: {
            label(c) {
              const p = c.raw
              if (p.name) return ` ${p.name}: ${Math.round(p.y)}g @ ~${p.x.toFixed(1)} min`
              return ` ${c.dataset.label}: ${Math.round(p.y)}g`
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear', min: 0, max: maxMin,
          title: { display: true, text: 'Game time (min)', color: '#a1a1aa', font: { size: 11 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#a1a1aa', font: { size: 11 }, callback: v => v + "'" },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Gold', color: '#a1a1aa', font: { size: 11 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#a1a1aa', font: { size: 11 }, callback: v => (v >= 1000 ? (v / 1000) + 'k' : v) },
        },
      },
    },
  })
}

onMounted(render)
watch(data, render)
onUnmounted(() => chart && chart.destroy())
</script>

<template>
  <div v-if="data.length" class="timeline-chart">
    <div class="tc-head">
      <span class="tc-title">Build timeline</span>
      <span class="tc-sub">when each spike comes online by farm pace · gold exact, timing estimated</span>
    </div>
    <div class="tc-wrap"><canvas ref="canvas"></canvas></div>
  </div>
</template>

<style scoped>
.timeline-chart { margin-top: 0.5rem; }
.tc-head { display: flex; align-items: baseline; gap: 0.625rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.tc-title { color: var(--fg-primary); font-weight: 700; font-size: 0.9375rem; }
.tc-sub { color: var(--fg-muted); font-size: 0.75rem; }
.tc-wrap { height: 260px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; }
</style>
