<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Two deterministic charts for the final core build (no AI): the stat-gold MIX
// (what the build invests in) and each item's gold-efficiency (its power per
// gold). Both read backend-computed numbers (statBreakdown goldValue,
// goldEfficiency) — raw rgba palette like the other charts.
const props = defineProps({
  items: { type: Array, required: true }, // resolved core-build item objects
})

const STAT_LABEL = {
  FlatPhysicalDamageMod: 'Attack Damage', FlatMagicDamageMod: 'Ability Power',
  FlatArmorMod: 'Armor', FlatSpellBlockMod: 'Magic Resist', FlatHPPoolMod: 'Health',
  FlatMPPoolMod: 'Mana', PercentAttackSpeedMod: 'Attack Speed', PercentCritChanceMod: 'Crit',
  AbilityHaste: 'Ability Haste', PercentLifeStealMod: 'Lifesteal', FlatMovementSpeedMod: 'Move Speed',
}
const MIX_COLORS = [
  '240,168,41', '135,64,55', '58,191,145', '59,130,246', '168,85,247',
  '236,72,153', '245,158,11', '20,184,166', '161,161,170', '244,114,182',
]

const mixCanvas = ref(null)
const effCanvas = ref(null)
let mixChart = null
let effChart = null

const data = computed(() => props.items.filter(i => i && i.statBreakdown))

function effColor(e, a = 0.8) {
  if (e >= 100) return `rgba(58,191,145,${a})`
  if (e >= 85) return `rgba(240,168,41,${a})`
  return `rgba(225,90,76,${a})`
}

function render() {
  const items = data.value
  if (!items.length) return

  // --- stat mix (doughnut): sum goldValue per stat across the build ---
  const mix = {}
  for (const it of items) {
    for (const [k, v] of Object.entries(it.statBreakdown || {})) {
      const g = (v && v.goldValue) || 0
      if (g) mix[STAT_LABEL[k] || k] = (mix[STAT_LABEL[k] || k] || 0) + g
    }
  }
  const labels = Object.keys(mix)
  if (mixChart) mixChart.destroy()
  if (mixCanvas.value && labels.length) {
    mixChart = new Chart(mixCanvas.value.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: labels.map(l => Math.round(mix[l])),
          backgroundColor: labels.map((_, i) => `rgba(${MIX_COLORS[i % MIX_COLORS.length]},0.85)`),
          borderColor: '#18181b', borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '58%',
        plugins: {
          legend: { position: 'right', labels: { color: '#e4e4e7', font: { size: 11 }, padding: 8, boxWidth: 12 } },
          tooltip: {
            backgroundColor: '#18181b', titleColor: '#e4e4e7', bodyColor: '#a1a1aa',
            borderColor: '#3f3f46', borderWidth: 1, padding: 10,
            callbacks: { label: c => ` ${c.label}: ${c.parsed}g` },
          },
        },
      },
    })
  }

  // --- per-item gold efficiency (horizontal bars) ---
  const eff = items.filter(i => typeof i.goldEfficiency === 'number')
  if (effChart) effChart.destroy()
  if (effCanvas.value && eff.length) {
    effChart = new Chart(effCanvas.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: eff.map(i => (i.name.length > 16 ? i.name.slice(0, 16) + '…' : i.name)),
        datasets: [{
          data: eff.map(i => Math.round(i.goldEfficiency)),
          backgroundColor: eff.map(i => effColor(i.goldEfficiency)),
          borderColor: eff.map(i => effColor(i.goldEfficiency, 1)),
          borderWidth: 1.5, borderRadius: 5,
        }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#18181b', titleColor: '#e4e4e7', bodyColor: '#a1a1aa',
            borderColor: '#3f3f46', borderWidth: 1, padding: 10,
            callbacks: { label: c => ` ${c.parsed.x}% stat efficiency` },
          },
        },
        scales: {
          x: { beginAtZero: true, suggestedMax: 130, grid: { color: 'rgba(255,255,255,0.05)' },
               ticks: { color: '#a1a1aa', font: { size: 11 }, callback: v => v + '%' } },
          y: { grid: { display: false }, ticks: { color: '#e4e4e7', font: { size: 11 } } },
        },
      },
    })
  }
}

onMounted(render)
watch(data, render)
onUnmounted(() => { mixChart && mixChart.destroy(); effChart && effChart.destroy() })
</script>

<template>
  <div v-if="data.length" class="build-charts">
    <div class="bc-cell">
      <div class="bc-title">Where the gold goes</div>
      <div class="bc-wrap"><canvas ref="mixCanvas"></canvas></div>
    </div>
    <div class="bc-cell">
      <div class="bc-title">Efficiency per item</div>
      <div class="bc-wrap"><canvas ref="effCanvas"></canvas></div>
    </div>
  </div>
</template>

<style scoped>
.build-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem; }
.bc-title { color: var(--fg-secondary); font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; }
.bc-wrap { height: 200px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.875rem; }
@media (max-width: 640px) { .build-charts { grid-template-columns: 1fr; } }
</style>
