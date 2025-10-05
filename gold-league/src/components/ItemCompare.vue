<template>
  <div v-if="items.length === 2" class="compare-container">
    <div class="compare-header">
      <h2>Item Comparison</h2>
      <button @click="emit('clear')" class="btn-clear">✕ Clear Comparison</button>
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
      <h3>Summary</h3>
      <div class="summary-stats">
        <div class="summary-item">
          <span class="label">Efficiency Difference:</span>
          <span :class="getDifferenceClass(efficiencyDiff)">
            {{ Math.abs(efficiencyDiff).toFixed(2) }}%
            {{ efficiencyDiff > 0 ? '(Item 1 higher)' : '(Item 2 higher)' }}
          </span>
        </div>
        
        <div class="summary-item">
          <span class="label">Cost Difference:</span>
          <span class="value gold">{{ Math.abs(costDiff) }}g</span>
        </div>
        
        <div class="summary-item">
          <span class="label">Value Difference:</span>
          <span class="value gold">{{ Math.abs(valueDiff).toFixed(2) }}g</span>
        </div>
        
        <div class="summary-item recommendation">
          <span class="label">Recommendation:</span>
          <span class="value">{{ recommendation }}</span>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="empty-state">
    <p>Select exactly 2 items from the table to compare</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getItemImageUrl, formatStatName, formatStatValue } from '../api/items'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['clear'])

const efficiencyDiff = computed(() => {
  if (props.items.length !== 2) return 0
  return props.items[0].goldEfficiency - props.items[1].goldEfficiency
})

const costDiff = computed(() => {
  if (props.items.length !== 2) return 0
  return props.items[0].cost - props.items[1].cost
})

const valueDiff = computed(() => {
  if (props.items.length !== 2) return 0
  return props.items[0].totalGoldValue - props.items[1].totalGoldValue
})

const recommendation = computed(() => {
  if (props.items.length !== 2) return ''
  
  const [item1, item2] = props.items
  
  if (Math.abs(efficiencyDiff.value) < 5) {
    return 'Both items have similar gold efficiency. Choose based on your champion needs.'
  }
  
  const betterItem = efficiencyDiff.value > 0 ? item1 : item2
  return `${betterItem.name} offers better gold efficiency for pure stat value.`
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

function getDifferenceClass(diff) {
  return diff > 0 ? 'eff-good' : 'eff-poor'
}

function sanitizeHtml(html) {
  // Basic sanitization - in production use DOMPurify
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}
</script>

<style scoped>
.compare-container {
  padding: 20px;
  background: #1a1a2e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.compare-container h2 {
  color: #e94560;
  font-size: 28px;
  margin: 0;
}

.btn-clear {
  padding: 10px 20px;
  background: rgba(248, 113, 113, 0.2);
  border: 2px solid #f87171;
  border-radius: 8px;
  color: #f87171;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-clear:hover {
  background: #f87171;
  color: #fff;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.item-card {
  background: #16213e;
  border-radius: 12px;
  padding: 25px;
  border: 2px solid #0f3460;
  transition: all 0.3s;
}

.item-card:hover {
  border-color: #e94560;
  box-shadow: 0 4px 20px rgba(233, 69, 96, 0.2);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #0f3460;
}

.item-icon-large {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: 3px solid #0f3460;
}

.item-header h3 {
  color: #fff;
  font-size: 22px;
  margin: 0;
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
  color: #a0a0a0;
  font-weight: 500;
}

.value {
  color: #fff;
  font-weight: 600;
}

.gold {
  color: #ffd700;
  font-family: 'Courier New', monospace;
}

.stat-breakdown {
  background: #0f3460;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.stat-breakdown h4 {
  color: #e94560;
  margin-bottom: 10px;
  font-size: 16px;
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
  color: #ddd;
  font-size: 14px;
  line-height: 1.6;
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

.eff-excellent { color: #4ade80; font-weight: 700; }
.eff-good { color: #60a5fa; font-weight: 600; }
.eff-fair { color: #fbbf24; font-weight: 500; }
.eff-poor { color: #f87171; font-weight: 500; }

.rating-excellent { color: #4ade80; font-weight: 700; }
.rating-good { color: #60a5fa; font-weight: 600; }
.rating-fair { color: #fbbf24; font-weight: 600; }
.rating-poor { color: #f87171; font-weight: 600; }

.empty-state {
  padding: 60px 20px;
  text-align: center;
  background: #1a1a2e;
  border-radius: 12px;
  border: 2px dashed #0f3460;
}

.empty-state p {
  color: #a0a0a0;
  font-size: 18px;
  margin: 0;
}
</style>

