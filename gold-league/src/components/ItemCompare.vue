<template>
  <div v-if="items.length >= 2" class="compare-container">
    <div class="compare-header">
      <h2>Item Comparison ({{ items.length }} items)</h2>
      <div class="header-actions">
        <button @click="viewDetailed(items[0])" class="btn-secondary">View Detailed Breakdown</button>
        <button @click="emit('clear')" class="btn-clear">Clear Comparison</button>
      </div>
    </div>

    <!-- Chart Visualizations -->
    <div class="charts-section">
      <div class="chart-card">
        <h3>Efficiency Comparison</h3>
        <canvas ref="efficiencyChart"></canvas>
      </div>
      <div class="chart-card">
        <h3>Cost vs Value</h3>
        <canvas ref="costValueChart"></canvas>
      </div>
    </div>
    
    <div class="comparison-grid">
      <div v-for="item in items" :key="item.id" class="item-card">
        <div class="item-header">
          <img 
            :src="getImageUrl(item.id)" 
            :alt="item.name"
            class="item-icon-large"
          />
          <h3>{{ item.name }}</h3>
        </div>
        
        <div class="item-stats">
          <div class="stat-row main-stat">
            <span class="label">Gold Efficiency:</span>
            <span :class="getEfficiencyClass(item.goldEfficiency)">
              {{ item.goldEfficiency }}%
            </span>
          </div>
          
          <div class="stat-row">
            <span class="label">Total Cost:</span>
            <span class="value gold">{{ item.cost }}g</span>
          </div>
          
          <div class="stat-row">
            <span class="label">Gold Value:</span>
            <span class="value gold">{{ item.totalGoldValue }}g</span>
          </div>
          
          <div class="stat-row">
            <span class="label">Rating:</span>
            <span :class="getRatingClass(item.goldEfficiency)">
              {{ getEfficiencyRating(item.goldEfficiency) }}
            </span>
          </div>
        </div>

        <div v-if="item.statBreakdown" class="stat-breakdown">
          <h4>Stat Breakdown</h4>
          <div v-for="(stat, key) in item.statBreakdown" :key="key" class="breakdown-row">
            <span class="stat-name">{{ formatStatName(key) }}</span>
            <span class="stat-amount">{{ formatStatValue(key, stat.amount) }}</span>
            <span class="stat-value gold">{{ stat.goldValue }}g</span>
          </div>
        </div>

        <div class="item-description" v-if="item.description">
          <h4>Description</h4>
          <div v-html="sanitizeHtml(item.description)"></div>
        </div>
      </div>
    </div>

    <div class="comparison-summary">
      <h3>Comparison Summary</h3>
      <div class="summary-stats">
        <div class="summary-item">
          <span class="label">Best Efficiency:</span>
          <span class="value">
            {{ bestEfficiency?.name }} ({{ bestEfficiency?.goldEfficiency.toFixed(2) }}%)
          </span>
        </div>
        
        <div class="summary-item">
          <span class="label">Average Efficiency:</span>
          <span class="value">{{ avgEfficiency.toFixed(2) }}%</span>
        </div>
        
        <div class="summary-item">
          <span class="label">Total Cost:</span>
          <span class="value gold">{{ totalCost }}g</span>
        </div>
        
        <div class="summary-item">
          <span class="label">Items Compared:</span>
          <span class="value">{{ items.length }}</span>
        </div>
        
        <div class="summary-item recommendation">
          <span class="label">Analysis:</span>
          <span class="value">{{ recommendation }}</span>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="empty-state">
    <p>Select 2-6 items from the Items Database to compare their stats and efficiency</p>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getItemImageUrl, formatStatName, formatStatValue } from '../api/items'

Chart.register(...registerables)

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  allItems: {
    type: Array,
    default: () => []
  }
})

const efficiencyChart = ref(null)
const costValueChart = ref(null)
let efficiencyChartInstance = null
let costValueChartInstance = null

const emit = defineEmits(['clear', 'viewDetailed'])

function viewDetailed(item) {
  emit('viewDetailed', item)
}

function createEfficiencyChart() {
  if (!efficiencyChart.value || props.items.length < 2) return

  if (efficiencyChartInstance) {
    efficiencyChartInstance.destroy()
  }

  const ctx = efficiencyChart.value.getContext('2d')
  const labels = props.items.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name)
  const data = props.items.map(item => item.goldEfficiency)
  const colors = data.map(eff => {
    if (eff >= 110) return 'rgba(16, 185, 129, 0.8)'
    if (eff >= 100) return 'rgba(59, 130, 246, 0.8)'
    if (eff >= 90) return 'rgba(245, 158, 11, 0.8)'
    return 'rgba(239, 68, 68, 0.8)'
  })

  efficiencyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Gold Efficiency %',
        data: data,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.8', '1')),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#3f3f46' },
          ticks: { color: '#a1a1aa' }
        },
        x: {
          grid: { color: '#3f3f46' },
          ticks: { color: '#a1a1aa', maxRotation: 45, minRotation: 45 }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#18181b',
          titleColor: '#e4e4e7',
          bodyColor: '#a1a1aa',
          borderColor: '#3f3f46',
          borderWidth: 1
        }
      }
    }
  })
}

function createCostValueChart() {
  if (!costValueChart.value || props.items.length < 2) return

  if (costValueChartInstance) {
    costValueChartInstance.destroy()
  }

  const ctx = costValueChart.value.getContext('2d')
  const labels = props.items.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name)

  costValueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Cost',
          data: props.items.map(item => item.cost),
          borderColor: 'rgba(135, 64, 55, 1)',
          backgroundColor: 'rgba(135, 64, 55, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Gold Value',
          data: props.items.map(item => item.totalGoldValue),
          borderColor: 'rgba(240, 168, 41, 1)',
          backgroundColor: 'rgba(240, 168, 41, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#3f3f46' },
          ticks: { color: '#a1a1aa' }
        },
        x: {
          grid: { color: '#3f3f46' },
          ticks: { color: '#a1a1aa', maxRotation: 45, minRotation: 45 }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#e4e4e7' }
        },
        tooltip: {
          backgroundColor: '#18181b',
          titleColor: '#e4e4e7',
          bodyColor: '#a1a1aa',
          borderColor: '#3f3f46',
          borderWidth: 1
        }
      }
    }
  })
}

watch(() => props.items, () => {
  nextTick(() => {
    createEfficiencyChart()
    createCostValueChart()
  })
}, { immediate: true, deep: true })

onMounted(() => {
  createEfficiencyChart()
  createCostValueChart()
})

const bestEfficiency = computed(() => {
  if (props.items.length === 0) return null
  return props.items.reduce((best, item) => 
    item.goldEfficiency > best.goldEfficiency ? item : best
  , props.items[0])
})

const avgEfficiency = computed(() => {
  if (props.items.length === 0) return 0
  return props.items.reduce((sum, item) => sum + item.goldEfficiency, 0) / props.items.length
})

const totalCost = computed(() => {
  return props.items.reduce((sum, item) => sum + item.cost, 0)
})

const recommendation = computed(() => {
  if (props.items.length < 2) return ''
  
  const sorted = [...props.items].sort((a, b) => b.goldEfficiency - a.goldEfficiency)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  
  const diffPercent = ((best.goldEfficiency - worst.goldEfficiency) / worst.goldEfficiency * 100).toFixed(1)
  
  return `${best.name} has ${diffPercent}% higher gold efficiency than ${worst.name}. Consider item passives and synergies with your champion.`
})

function getImageUrl(itemId) {
  return getItemImageUrl(itemId)
}

function getEfficiencyClass(eff) {
  if (eff >= 120) return 'eff-excellent'
  if (eff >= 100) return 'eff-good'
  if (eff >= 80) return 'eff-fair'
  return 'eff-poor'
}

function getRatingClass(eff) {
  if (eff >= 120) return 'rating-excellent'
  if (eff >= 100) return 'rating-good'
  if (eff >= 80) return 'rating-fair'
  return 'rating-poor'
}

function getEfficiencyRating(eff) {
  if (eff >= 120) return 'Excellent'
  if (eff >= 100) return 'Good'
  if (eff >= 80) return 'Fair'
  return 'Poor'
}

function sanitizeHtml(html) {
  if (!html) return ''
  // Enhanced sanitization and formatting
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n') // Max 2 line breaks
    .trim()
}
</script>

<style scoped>
.compare-container {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.compare-container h2 {
  color: var(--gold);
  font-size: 1.75rem;
  margin: 0;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

.chart-card h3 {
  color: var(--text-primary);
  font-size: 1.125rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.chart-card canvas {
  max-height: 300px;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  border-radius: var(--radius-md);
  color: var(--error);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-clear:hover {
  background: var(--error);
  color: var(--text-primary);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--gold);
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.item-card {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
}

.item-card:hover {
  border-color: var(--gold);
  box-shadow: var(--shadow-md);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.item-icon-large {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-secondary);
}

.item-header h3 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
}

.item-stats {
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(15, 52, 96, 0.3);
}

.stat-row.main-stat {
  font-size: 18px;
  font-weight: 700;
  padding: 15px 0;
  border-bottom: 2px solid #0f3460;
}

.label {
  color: var(--text-tertiary);
  font-weight: 500;
  font-size: 0.8125rem;
}

.value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
}

.gold {
  color: var(--gold);
  font-family: 'Monaco', 'Courier New', monospace;
}

.stat-breakdown {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  border: 1px solid var(--border-primary);
}

.stat-breakdown h4 {
  color: var(--gold);
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  gap: 10px;
}

.stat-name {
  color: #fff;
  flex: 1;
}

.stat-amount {
  color: #60a5fa;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.stat-value {
  min-width: 70px;
  text-align: right;
}

.item-description {
  background: rgba(233, 69, 96, 0.1);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #e94560;
}

.item-description h4 {
  color: #e94560;
  margin-bottom: 10px;
  font-size: 16px;
}

.item-description div {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.7;
  white-space: pre-wrap;
  font-family: inherit;
}

.comparison-summary {
  background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
  padding: 25px;
  border-radius: 12px;
  border: 2px solid #e94560;
}

.comparison-summary h3 {
  color: #e94560;
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: rgba(26, 26, 46, 0.5);
  border-radius: 8px;
}

.summary-item.recommendation {
  grid-column: 1 / -1;
  background: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.3);
}

.eff-excellent { color: var(--success); font-weight: 700; }
.eff-good { color: var(--info); font-weight: 600; }
.eff-fair { color: var(--warning); font-weight: 600; }
.eff-poor { color: var(--error); font-weight: 600; }

.rating-excellent { color: var(--success); font-weight: 700; }
.rating-good { color: var(--info); font-weight: 600; }
.rating-fair { color: var(--warning); font-weight: 600; }
.rating-poor { color: var(--error); font-weight: 600; }

.empty-state {
  padding: 4rem 1.5rem;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-secondary);
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}
</style>

