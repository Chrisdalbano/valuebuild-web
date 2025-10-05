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

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
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

