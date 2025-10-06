<template>
  <div class="quick-insights">
    <div class="insights-header">
      <div>
        <h2><span class="icon-flash"></span> Flash Comparisons</h2>
        <p class="insights-subtitle">Popular item matchups analyzed instantly</p>
      </div>
      <button @click="$emit('shuffle')" class="btn-shuffle" title="Shuffle comparisons">
        🔄 Shuffle
      </button>
    </div>
    
    <div class="insights-grid">
      <div 
        v-for="(comp, index) in comparisons" 
        :key="index" 
        class="insight-card" 
        @click="$emit('load-comparison', comp)"
      >
        <div class="insight-header">
          <div class="insight-badge">Quick Compare</div>
          <div class="insight-avg" :class="getEfficiencyClass(getAvgEfficiency(comp))">
            {{ getAvgEfficiency(comp).toFixed(1) }}%
          </div>
        </div>
        
        <div class="insight-items">
          <div v-for="(item, idx) in comp" :key="item.id" class="insight-item">
            <img 
              :src="`https://ddragon.leagueoflegends.com/cdn/14.20.1/img/item/${item.id}.png`" 
              :alt="item.name" 
              class="insight-item-img" 
            />
            <div class="insight-item-details">
              <div class="insight-item-name">{{ item.name }}</div>
              <div class="insight-item-stats">
                <span class="insight-eff" :class="getEfficiencyClass(item.goldEfficiency)">
                  {{ item.goldEfficiency }}%
                </span>
                <span class="insight-cost">
                  <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> {{ item.cost }}
                </span>
              </div>
            </div>
            <div v-if="idx < comp.length - 1" class="insight-vs">VS</div>
          </div>
        </div>
        
        <button class="insight-btn">
          Compare Items
          <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  comparisons: {
    type: Array,
    required: true
  },
  goldIconUrl: {
    type: String,
    required: true
  }
})

defineEmits(['shuffle', 'load-comparison'])

function getAvgEfficiency(comp) {
  return comp.reduce((sum, i) => sum + i.goldEfficiency, 0) / comp.length
}

function getEfficiencyClass(efficiency) {
  if (efficiency >= 110) return 'excellent'
  if (efficiency >= 100) return 'good'
  if (efficiency >= 90) return 'fair'
  return 'poor'
}
</script>

<style scoped>
.quick-insights {
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.05), rgba(135, 64, 55, 0.05));
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid var(--border-primary);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.quick-insights h2 {
  color: var(--gold);
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.insights-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.btn-shuffle {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-shuffle:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.insight-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.insight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(240, 168, 41, 0.1), transparent);
  transition: left 0.5s;
}

.insight-card:hover::before {
  left: 100%;
}

.insight-card:hover {
  border-color: var(--gold);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(240, 168, 41, 0.2);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.insight-badge {
  background: rgba(240, 168, 41, 0.15);
  color: var(--gold);
  padding: 0.375rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(240, 168, 41, 0.3);
}

.insight-avg {
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
}

.insight-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: var(--bg-tertiary);
  padding: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  position: relative;
  transition: all 0.2s;
}

.insight-item:hover {
  border-color: var(--border-secondary);
  background: var(--bg-hover);
}

.insight-item-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border-secondary);
  flex-shrink: 0;
}

.insight-item-details {
  flex: 1;
}

.insight-item-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.375rem;
}

.insight-item-stats {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.insight-eff {
  font-weight: 700;
  font-size: 0.875rem;
}

.insight-cost {
  color: var(--gold);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.875rem;
}

.insight-vs {
  position: absolute;
  bottom: -0.875rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gold);
  color: var(--bg-primary);
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.insight-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--gold), var(--rust));
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  box-shadow: 0 4px 12px rgba(240, 168, 41, 0.3);
}

.btn-arrow {
  font-size: 1.25rem;
  font-weight: bold;
  transition: transform 0.3s;
}

.insight-card:hover .btn-arrow {
  transform: translateX(4px);
}

.gold-icon-inline {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
  margin-right: 2px;
}

.excellent { color: var(--success); }
.good { color: var(--info); }
.fair { color: var(--warning); }
.poor { color: var(--error); }

@media (max-width: 768px) {
  .insights-grid {
    grid-template-columns: 1fr;
  }

  .insights-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-shuffle {
    width: 100%;
    justify-content: center;
  }
}

.icon-flash {
  width: 2rem;
  height: 2rem;
  background-image: url('https://ddragon.leagueoflegends.com/cdn/15.19.1/img/spell/SummonerFlash.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>

