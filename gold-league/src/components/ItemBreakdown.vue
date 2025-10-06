<template>
  <div v-if="item" class="item-breakdown">
    <div class="breakdown-header">
      <div class="item-main">
        <img 
          :src="getImageUrl(item.id)" 
          :alt="item.name"
          class="item-icon-xl"
          @error="handleImageError"
        />
        <div>
          <h2>{{ item.name }}</h2>
          <span class="item-tier">{{ getItemTier(item) }}</span>
        </div>
      </div>
      <button @click="emit('close')" class="btn-close">×</button>
    </div>

    <!-- Main Stats -->
    <div class="stats-overview">
      <div class="stat-card primary">
        <div class="stat-label">Gold Efficiency</div>
        <div class="stat-value" :class="getEfficiencyClass(item.goldEfficiency)">
          {{ item.goldEfficiency }}%
        </div>
        <div class="stat-rating">{{ getEfficiencyRating(item.goldEfficiency) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Cost</div>
        <div class="stat-value gold">{{ item.cost }}g</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Gold Value</div>
        <div class="stat-value gold">{{ item.totalGoldValue }}g</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Combine Cost</div>
        <div class="stat-value">{{ getCombineCost(item) }}g</div>
      </div>
    </div>

    <!-- Recipe Breakdown -->
    <div v-if="components && components.length > 0" class="recipe-section">
      <h3>Recipe & Cost Analysis</h3>
      <div class="recipe-tree">
        <div class="components-list">
          <div v-for="comp in components" :key="comp.id" class="component-card" @click="selectComponent(comp)">
            <img 
              :src="getImageUrl(comp.id)" 
              :alt="comp.name"
              class="component-icon"
              @error="handleImageError"
            />
            <div class="component-info">
              <div class="component-name">{{ comp.name }}</div>
              <div class="component-cost gold">{{ comp.cost }}g</div>
              <div class="component-efficiency" :class="getEfficiencyClass(comp.goldEfficiency)">
                {{ comp.goldEfficiency }}%
              </div>
            </div>
          </div>
        </div>
        <div class="recipe-arrow">→</div>
        <div class="final-item">
          <img 
            :src="getImageUrl(item.id)" 
            :alt="item.name"
            class="component-icon"
            @error="handleImageError"
          />
          <div class="component-info">
            <div class="component-name">{{ item.name }}</div>
            <div class="component-cost gold">{{ item.cost }}g</div>
          </div>
        </div>
      </div>

      <div class="cost-breakdown">
        <div class="cost-row">
          <span>Components Total:</span>
          <span class="gold">{{ componentsCost }}g</span>
        </div>
        <div class="cost-row">
          <span>Combine Cost:</span>
          <span class="gold">{{ getCombineCost(item) }}g</span>
        </div>
        <div class="cost-row total">
          <span>Final Cost:</span>
          <span class="gold">{{ item.cost }}g</span>
        </div>
      </div>
    </div>

    <!-- Stat Breakdown with Chart -->
    <div v-if="item.statBreakdown" class="stat-analysis">
      <h3>Stat Value Analysis</h3>
      <div class="chart-container">
        <canvas ref="statsChart"></canvas>
      </div>
      <div class="stat-list">
        <div v-for="(stat, key) in item.statBreakdown" :key="key" class="stat-item">
          <div class="stat-name">{{ formatStatName(key) }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill" :style="{ width: getStatPercent(stat.goldValue) + '%' }"></div>
          </div>
          <div class="stat-details">
            <span class="stat-amount">{{ formatStatValue(key, stat.amount) }}</span>
            <span class="stat-value gold">{{ stat.goldValue }}g</span>
            <span class="stat-percent">({{ getStatPercent(stat.goldValue) }}%)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div v-if="item.description" class="description-section">
      <h3>Item Effects</h3>
      <div class="description-content" v-html="sanitizeHtml(item.description)"></div>
    </div>

    <!-- Builds Into -->
    <div v-if="buildsInto && buildsInto.length > 0" class="builds-into">
      <h3>Builds Into</h3>
      <div class="upgrade-list">
        <div v-for="upgrade in buildsInto" :key="upgrade.id" class="upgrade-card" @click="selectComponent(upgrade)">
          <img 
            :src="getImageUrl(upgrade.id)" 
            :alt="upgrade.name"
            class="upgrade-icon"
            @error="handleImageError"
          />
          <div class="upgrade-name">{{ upgrade.name }}</div>
          <div class="upgrade-cost gold">{{ upgrade.cost }}g</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getItemImageUrl, getValidatedItemImageUrl, formatStatName, formatStatValue } from '../api/items'

Chart.register(...registerables)

const props = defineProps({
  item: Object,
  allItems: Array
})

const emit = defineEmits(['close', 'select'])

const statsChart = ref(null)
let chartInstance = null

const components = computed(() => {
  if (!props.item?.from || !props.allItems) return []
  return props.item.from
    .map(id => props.allItems.find(i => i.id === id))
    .filter(Boolean)
})

const buildsInto = computed(() => {
  if (!props.item?.into || !props.allItems) return []
  return props.item.into
    .map(id => props.allItems.find(i => i.id === id))
    .filter(Boolean)
})

const componentsCost = computed(() => {
  return components.value.reduce((sum, comp) => sum + (comp.cost || 0), 0)
})

function getCombineCost(item) {
  if (!item.gold) return 0
  return item.gold.base || 0
}

function getItemTier(item) {
  if (item.cost < 500) return 'Basic Item'
  if (components.value.length > 0 && item.cost < 1200) return 'Component'
  if (item.cost >= 2000) return 'Legendary Item'
  return 'Epic Item'
}

function getImageUrl(itemId) {
  return getItemImageUrl(itemId)
}

function handleImageError(e) {
  const img = e.target
  if (!img.dataset.fallbackTried) {
    img.dataset.fallbackTried = 'true'
    const itemId = img.alt || img.src.match(/\/(\d+)\.png/)?.[1]
    if (itemId) {
      img.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/${itemId.toLowerCase()}.png`
      return
    }
  }
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%2327272a" width="64" height="64"/%3E%3C/svg%3E'
}

function getEfficiencyClass(efficiency) {
  if (efficiency >= 110) return 'excellent'
  if (efficiency >= 100) return 'good'
  if (efficiency >= 90) return 'fair'
  return 'poor'
}

function getEfficiencyRating(efficiency) {
  if (efficiency >= 120) return 'Outstanding'
  if (efficiency >= 110) return 'Excellent'
  if (efficiency >= 100) return 'Good'
  if (efficiency >= 90) return 'Fair'
  if (efficiency >= 80) return 'Below Average'
  return 'Poor'
}

function getStatPercent(goldValue) {
  if (!props.item?.totalGoldValue) return 0
  return Math.round((goldValue / props.item.totalGoldValue) * 100)
}

function sanitizeHtml(html) {
  return html
    .replace(/<br>/gi, '<br/>')
    .replace(/<passive>/gi, '<strong class="passive-tag">PASSIVE:</strong>')
    .replace(/<active>/gi, '<strong class="active-tag">ACTIVE:</strong>')
    .replace(/<unique>/gi, '<strong class="unique-tag">UNIQUE:</strong>')
    .replace(/<stats>/gi, '<div class="stats-tag">')
    .replace(/<\/stats>/gi, '</div>')
}

function selectComponent(item) {
  emit('select', item)
}

function createStatsChart() {
  if (!statsChart.value || !props.item?.statBreakdown) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = statsChart.value.getContext('2d')
  const stats = props.item.statBreakdown
  const labels = Object.keys(stats).map(key => formatStatName(key))
  const data = Object.values(stats).map(stat => stat.goldValue)
  const colors = [
    'rgba(240, 168, 41, 0.8)',
    'rgba(135, 64, 55, 0.8)',
    'rgba(100, 100, 108, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
  ]

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: '#18181b',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#e4e4e7',
            font: { size: 12 },
            padding: 12
          }
        },
        tooltip: {
          backgroundColor: '#18181b',
          titleColor: '#e4e4e7',
          bodyColor: '#a1a1aa',
          borderColor: '#3f3f46',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${context.label}: ${value}g (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

watch(() => props.item, () => {
  nextTick(() => {
    createStatsChart()
  })
}, { immediate: true })

onMounted(() => {
  createStatsChart()
})
</script>

<style scoped>
.item-breakdown {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid var(--border-primary);
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.item-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.item-icon-xl {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-secondary);
  box-shadow: var(--shadow-lg);
}

.item-main h2 {
  font-size: 1.75rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.item-tier {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(240, 168, 41, 0.15);
  color: var(--gold);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(240, 168, 41, 0.3);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  text-align: center;
}

.stat-card.primary {
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.1), rgba(135, 64, 55, 0.1));
  border-color: rgba(240, 168, 41, 0.3);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-rating {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.recipe-section, .stat-analysis, .description-section, .builds-into {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.recipe-section h3, .stat-analysis h3, .description-section h3, .builds-into h3 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.recipe-tree {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.components-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.component-card, .upgrade-card {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.component-card:hover, .upgrade-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.component-icon, .upgrade-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
}

.component-info {
  text-align: center;
  width: 100%;
}

.component-name, .upgrade-name {
  font-size: 0.75rem;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.component-cost, .upgrade-cost {
  font-size: 0.875rem;
  font-weight: 600;
}

.component-efficiency {
  font-size: 0.75rem;
  font-weight: 600;
}

.recipe-arrow {
  font-size: 2rem;
  color: var(--gold);
  font-weight: bold;
}

.final-item {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--gold);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
}

.cost-breakdown {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.cost-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-primary);
  font-size: 0.875rem;
}

.cost-row:last-child {
  border-bottom: none;
}

.cost-row.total {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid var(--border-secondary);
}

.chart-container {
  max-width: 400px;
  margin: 0 auto 2rem;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.stat-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.stat-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold), var(--rust));
  transition: width 0.3s ease;
}

.stat-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stat-amount {
  font-weight: 600;
  color: var(--text-primary);
}

.stat-percent {
  color: var(--text-secondary);
}

.description-content {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.875rem;
}

.description-content :deep(.passive-tag),
.description-content :deep(.active-tag),
.description-content :deep(.unique-tag) {
  color: var(--gold);
  font-weight: 700;
  margin-right: 0.5rem;
}

.upgrade-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.gold {
  color: var(--gold);
}

.excellent { color: #10b981; }
.good { color: #3b82f6; }
.fair { color: #f59e0b; }
.poor { color: #ef4444; }
</style>

