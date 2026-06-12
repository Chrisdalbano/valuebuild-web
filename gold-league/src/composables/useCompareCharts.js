import { watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getComponentsCost, getCombineCost } from '@/utils/itemHelpers'

Chart.register(...registerables)

// NOTE: chart colors are raw values on purpose — Chart.js config is JS, not
// CSS; tokenizing the data-viz layer is an explicit Phase 3 work item.
const TICKS = { color: '#a1a1aa', font: { size: 11 } }
const X_TICKS = { color: '#a1a1aa', maxRotation: 45, minRotation: 0, font: { size: 11 } }
const GRID = { color: 'rgba(255, 255, 255, 0.05)' }
const TOOLTIP = {
  backgroundColor: '#18181b',
  titleColor: '#e4e4e7',
  bodyColor: '#a1a1aa',
  borderColor: '#3f3f46',
  borderWidth: 1,
  padding: 12,
}
const LEGEND_LABELS = { color: '#e4e4e7', padding: 15, usePointStyle: true }

function truncatedLabels(items) {
  return items.map(item => (item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name))
}

// Renders the three comparison charts into the given canvas refs and keeps
// them in sync with the item list. Caller owns the canvases.
export function useCompareCharts(itemsRef, allItemsRef, { effCanvas, costValueCanvas, componentCanvas }) {
  const instances = { eff: null, costValue: null, component: null }

  function render(key, canvas, config) {
    if (!canvas.value || itemsRef.value.length < 2) return
    if (instances[key]) instances[key].destroy()
    instances[key] = new Chart(canvas.value.getContext('2d'), config)
  }

  function renderAll() {
    const items = itemsRef.value
    const labels = truncatedLabels(items)

    render('eff', effCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Gold Efficiency %',
          data: items.map(i => i.goldEfficiency),
          backgroundColor: items.map(i => {
            const eff = i.goldEfficiency
            if (eff >= 120) return 'rgba(34, 197, 94, 0.8)'
            if (eff >= 100) return 'rgba(59, 130, 246, 0.8)'
            if (eff >= 80) return 'rgba(245, 158, 11, 0.8)'
            return 'rgba(239, 68, 68, 0.8)'
          }),
          borderColor: items.map(i => {
            const eff = i.goldEfficiency
            if (eff >= 120) return 'rgba(34, 197, 94, 1)'
            if (eff >= 100) return 'rgba(59, 130, 246, 1)'
            if (eff >= 80) return 'rgba(245, 158, 11, 1)'
            return 'rgba(239, 68, 68, 1)'
          }),
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: { beginAtZero: true, grid: GRID, ticks: TICKS },
          x: { grid: { display: false }, ticks: X_TICKS },
        },
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP, displayColors: false } },
      },
    })

    const lineDataset = (label, data, rgb) => ({
      label,
      data,
      borderColor: `rgba(${rgb}, 1)`,
      backgroundColor: `rgba(${rgb}, 0.1)`,
      tension: 0.3,
      fill: true,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: `rgba(${rgb}, 1)`,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    })

    render('costValue', costValueCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          lineDataset('Item Cost', items.map(i => i.cost), '135, 64, 55'),
          lineDataset('Stat Value', items.map(i => i.totalGoldValue), '240, 168, 41'),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { beginAtZero: true, grid: GRID, ticks: TICKS },
          x: { grid: { display: false }, ticks: X_TICKS },
        },
        plugins: { legend: { labels: LEGEND_LABELS }, tooltip: TOOLTIP },
      },
    })

    render('component', componentCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Components Cost',
            data: items.map(i => getComponentsCost(i, allItemsRef.value)),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
          },
          {
            label: 'Combine Cost',
            data: items.map(i => getCombineCost(i)),
            backgroundColor: 'rgba(245, 158, 11, 0.7)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: X_TICKS },
          y: { stacked: true, beginAtZero: true, grid: GRID, ticks: TICKS },
        },
        plugins: {
          legend: { labels: LEGEND_LABELS },
          tooltip: {
            ...TOOLTIP,
            callbacks: {
              footer: tooltipItems => `Total: ${tooltipItems.reduce((sum, it) => sum + it.parsed.y, 0)}g`,
            },
          },
        },
      },
    })
  }

  watch(itemsRef, () => nextTick(renderAll), { immediate: true, deep: true })
  onMounted(renderAll)
  onUnmounted(() => Object.values(instances).forEach(c => c && c.destroy()))
}
