<template>
  <div class="chart-container">
    <h2>Gold Efficiency Analysis</h2>
    
    <div class="chart-controls">
      <button 
        v-for="chart in chartTypes" 
        :key="chart.value"
        @click="activeChart = chart.value"
        :class="['chart-btn', { active: activeChart === chart.value }]"
      >
        {{ chart.label }}
      </button>
    </div>

    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div class="chart-stats">
      <div class="stat-card">
        <div class="stat-label">Total Items</div>
        <div class="stat-value">{{ items.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Efficiency</div>
        <div class="stat-value">{{ avgEfficiency.toFixed(2) }}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Most Efficient</div>
        <div class="stat-value">{{ mostEfficient?.name || 'N/A' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Least Efficient</div>
        <div class="stat-value">{{ leastEfficient?.name || 'N/A' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
const activeChart = ref('distribution')
let chartInstance = null

const chartTypes = [
  { value: 'distribution', label: 'Distribution' },
  { value: 'topBottom', label: 'Top & Bottom 10' },
  { value: 'costVsEfficiency', label: 'Cost vs Efficiency' },
  { value: 'byCategory', label: 'By Category' }
]

const avgEfficiency = computed(() => {
  if (props.items.length === 0) return 0
  return props.items.reduce((sum, item) => sum + item.goldEfficiency, 0) / props.items.length
})

const mostEfficient = computed(() => {
  if (props.items.length === 0) return null
  return props.items.reduce((max, item) => 
    item.goldEfficiency > max.goldEfficiency ? item : max
  , props.items[0])
})

const leastEfficient = computed(() => {
  if (props.items.length === 0) return null
  return props.items.reduce((min, item) => 
    item.goldEfficiency < min.goldEfficiency ? item : min
  , props.items[0])
})

watch([activeChart, () => props.items], () => {
  updateChart()
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    updateChart()
  })
})

function updateChart() {
  if (!chartCanvas.value || props.items.length === 0) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  switch(activeChart.value) {
    case 'distribution':
      createDistributionChart(ctx)
      break
    case 'topBottom':
      createTopBottomChart(ctx)
      break
    case 'costVsEfficiency':
      createScatterChart(ctx)
      break
    case 'byCategory':
      createCategoryChart(ctx)
      break
  }
}

function createDistributionChart(ctx) {
  const ranges = ['<80%', '80-100%', '100-120%', '≥120%']
  const counts = [
    props.items.filter(i => i.goldEfficiency < 80).length,
    props.items.filter(i => i.goldEfficiency >= 80 && i.goldEfficiency < 100).length,
    props.items.filter(i => i.goldEfficiency >= 100 && i.goldEfficiency < 120).length,
    props.items.filter(i => i.goldEfficiency >= 120).length
  ]

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ranges,
      datasets: [{
        label: 'Number of Items',
        data: counts,
        backgroundColor: [
          'rgba(248, 113, 113, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(96, 165, 250, 0.8)',
          'rgba(74, 222, 128, 0.8)'
        ],
        borderColor: [
          'rgba(248, 113, 113, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(74, 222, 128, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        },
        title: {
          display: true,
          text: 'Gold Efficiency Distribution',
          color: '#e94560',
          font: { size: 18 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  })
}

function createTopBottomChart(ctx) {
  const sorted = [...props.items].sort((a, b) => b.goldEfficiency - a.goldEfficiency)
  const top10 = sorted.slice(0, 10)
  const bottom10 = sorted.slice(-10).reverse()
  const combined = [...top10, ...bottom10]

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: combined.map(i => i.name),
      datasets: [{
        label: 'Gold Efficiency %',
        data: combined.map(i => i.goldEfficiency),
        backgroundColor: combined.map(i => 
          i.goldEfficiency >= 120 ? 'rgba(74, 222, 128, 0.8)' :
          i.goldEfficiency >= 100 ? 'rgba(96, 165, 250, 0.8)' :
          i.goldEfficiency >= 80 ? 'rgba(251, 191, 36, 0.8)' :
          'rgba(248, 113, 113, 0.8)'
        )
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Top & Bottom 10 Items by Efficiency',
          color: '#e94560',
          font: { size: 18 }
        }
      },
      scales: {
        x: {
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          ticks: { 
            color: '#fff',
            font: { size: 10 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  })
}

function createScatterChart(ctx) {
  chartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Items',
        data: props.items.map(i => ({
          x: i.cost,
          y: i.goldEfficiency,
          label: i.name
        })),
        backgroundColor: 'rgba(233, 69, 96, 0.6)',
        borderColor: 'rgba(233, 69, 96, 1)',
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#fff' } },
        title: {
          display: true,
          text: 'Cost vs Gold Efficiency',
          color: '#e94560',
          font: { size: 18 }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const point = context.raw
              return `${point.label}: ${point.y.toFixed(2)}% at ${point.x}g`
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Cost (gold)',
            color: '#fff'
          },
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          title: {
            display: true,
            text: 'Gold Efficiency %',
            color: '#fff'
          },
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  })
}

function createCategoryChart(ctx) {
  // Group by cost ranges
  const categories = [
    { name: '<1000g', items: props.items.filter(i => i.cost < 1000) },
    { name: '1000-2000g', items: props.items.filter(i => i.cost >= 1000 && i.cost < 2000) },
    { name: '2000-3000g', items: props.items.filter(i => i.cost >= 2000 && i.cost < 3000) },
    { name: '3000+g', items: props.items.filter(i => i.cost >= 3000) }
  ]

  const avgEffByCategory = categories.map(cat => {
    if (cat.items.length === 0) return 0
    return cat.items.reduce((sum, item) => sum + item.goldEfficiency, 0) / cat.items.length
  })

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: categories.map(c => c.name),
      datasets: [{
        label: 'Average Efficiency',
        data: avgEffByCategory,
        borderColor: 'rgba(233, 69, 96, 1)',
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: 'rgba(233, 69, 96, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#fff' } },
        title: {
          display: true,
          text: 'Average Efficiency by Cost Category',
          color: '#e94560',
          font: { size: 18 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  })
}
</script>

<style scoped>
.chart-container {
  padding: 20px;
  background: #1a1a2e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.chart-container h2 {
  color: #e94560;
  margin-bottom: 20px;
  font-size: 28px;
  text-align: center;
}

.chart-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.chart-btn {
  padding: 10px 20px;
  border: 2px solid #0f3460;
  border-radius: 8px;
  background: #16213e;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.chart-btn:hover {
  background: #0f3460;
  border-color: #e94560;
}

.chart-btn.active {
  background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
  border-color: #e94560;
}

.chart-wrapper {
  background: #16213e;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  min-height: 400px;
  max-height: 600px;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #0f3460;
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #e94560;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(233, 69, 96, 0.3);
}

.stat-label {
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  color: #e94560;
  font-size: 24px;
  font-weight: 700;
}
</style>

