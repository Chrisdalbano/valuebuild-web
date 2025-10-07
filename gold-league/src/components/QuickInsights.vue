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
    
    <div class="insights-grid" ref="carouselContainer">
      <!-- Mobile Carousel Navigation -->
      <button 
        v-if="isMobile && comparisons.length > 1" 
        @click="scrollCarousel('left')" 
        class="carousel-nav carousel-nav-left"
        :disabled="currentIndex === 0"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <button 
        v-if="isMobile && comparisons.length > 1" 
        @click="scrollCarousel('right')" 
        class="carousel-nav carousel-nav-right"
        :disabled="currentIndex === comparisons.length - 1"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      <div 
        v-for="(comp, index) in comparisons" 
        :key="index" 
        class="insight-card" 
        @click="$emit('load-comparison', comp)"
      >
        <div class="insight-header">
          <div class="insight-badge">Quick Compare</div>
          <div class="insight-avg" :class="getEfficiencyClass(getAvgEfficiency(comp))">
            Avg {{ getAvgEfficiency(comp).toFixed(0) }}%
          </div>
        </div>
        
        <!-- Winner/Loser Indicator -->
        <div class="comparison-verdict">
          <div class="verdict-winner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="verdict-icon">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
            <span>{{ getWinner(comp).name }}</span>
            <span class="verdict-badge winner">+{{ getEfficiencyDiff(comp) }}%</span>
          </div>
        </div>
        
        <div class="insight-items">
          <div v-for="(item, idx) in comp" :key="item.id" class="insight-item" :class="{ 'is-winner': isWinner(comp, item) }">
            <div class="item-rank" :class="{ 'rank-winner': isWinner(comp, item) }">
              {{ isWinner(comp, item) ? '👑' : '💠' }}
            </div>
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
              <div class="insight-item-value">
                <span class="value-label">Value:</span>
                <span class="value-amount">{{ item.totalGoldValue }}g</span>
              </div>
            </div>
            <div v-if="idx < comp.length - 1" class="insight-vs">VS</div>
          </div>
        </div>
        
        <!-- Quick Recommendation -->
        <div class="quick-recommendation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rec-icon">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>{{ getRecommendation(comp) }}</span>
        </div>
        
        <button class="insight-btn" @click="router.push('/compare')">
          View Full Analysis
          <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

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

// Mobile carousel state
const isMobile = ref(false)
const currentIndex = ref(0)
const carouselContainer = ref(null)

// Mobile detection
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})

// Carousel functions
function scrollCarousel(direction) {
  if (!carouselContainer.value) return
  
  const cardWidth = carouselContainer.value.querySelector('.insight-card')?.offsetWidth || 0
  const gap = 24 // 1.5rem gap
  const scrollAmount = cardWidth + gap
  
  if (direction === 'left' && currentIndex.value > 0) {
    currentIndex.value--
    carouselContainer.value.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    })
  } else if (direction === 'right' && currentIndex.value < props.comparisons.length - 1) {
    currentIndex.value++
    carouselContainer.value.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    })
  }
}

// Utility functions
function getAvgEfficiency(comp) {
  return comp.reduce((sum, i) => sum + i.goldEfficiency, 0) / comp.length
}

function getEfficiencyClass(efficiency) {
  if (efficiency >= 110) return 'excellent'
  if (efficiency >= 100) return 'good'
  if (efficiency >= 90) return 'fair'
  return 'poor'
}

function getWinner(comp) {
  return comp.reduce((best, item) => 
    item.goldEfficiency > best.goldEfficiency ? item : best
  , comp[0])
}

function isWinner(comp, item) {
  const winner = getWinner(comp)
  return item.id === winner.id
}

function getEfficiencyDiff(comp) {
  if (comp.length < 2) return 0
  const sorted = [...comp].sort((a, b) => b.goldEfficiency - a.goldEfficiency)
  return (sorted[0].goldEfficiency - sorted[1].goldEfficiency).toFixed(1)
}

function getRecommendation(comp) {
  const winner = getWinner(comp)
  const diff = getEfficiencyDiff(comp)
  
  if (diff > 20) {
    return `${winner.name} dominates with ${diff}% better efficiency!`
  } else if (diff > 10) {
    return `${winner.name} edges ahead by ${diff}% - solid choice`
  } else if (diff > 5) {
    return `Close matchup! ${winner.name} leads by ${diff}%`
  } else {
    return `Nearly identical value - choose based on your build`
  }
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

.comparison-verdict {
  margin-bottom: 1.25rem;
  padding: 0.875rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
  border-radius: var(--radius-md);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.verdict-winner {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9375rem;
}

.verdict-icon {
  width: 20px;
  height: 20px;
  color: #22c55e;
  flex-shrink: 0;
}

.verdict-badge {
  margin-left: auto;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
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

.insight-item.is-winner {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), transparent);
}

.insight-item:hover {
  border-color: var(--border-secondary);
  background: var(--bg-hover);
}

.item-rank {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 50%;
  font-size: 0.875rem;
  z-index: 1;
}

.item-rank.rank-winner {
  background: linear-gradient(135deg, #245536, #10b981);
  border-color: #22c55e;
  animation: pulse-winner 2s ease-in-out infinite;
}

@keyframes pulse-winner {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
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

.insight-item-value {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
}

.value-label {
  color: var(--text-tertiary);
  font-weight: 500;
}

.value-amount {
  color: var(--gold);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 700;
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

.quick-recommendation {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
  margin-bottom: 1.25rem;
}

.rec-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 2px;
}

.quick-recommendation span {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.5;
  font-style: italic;
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

/* Carousel Navigation */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: var(--bg-primary);
  border: 2px solid var(--gold);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.carousel-nav:hover:not(:disabled) {
  background: var(--gold);
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: var(--border-secondary);
}

.carousel-nav svg {
  width: 24px;
  height: 24px;
  color: var(--gold);
}

.carousel-nav:hover:not(:disabled) svg {
  color: var(--bg-primary);
}

.carousel-nav-left {
  left: -22px;
}

.carousel-nav-right {
  right: -22px;
}

@media (max-width: 768px) {
  .quick-insights {
    padding: 1.5rem 1rem;
  }

  /* Mobile carousel */
  .insights-grid {
    position: relative;
    display: flex !important;
    flex-direction: row !important;
    grid-template-columns: unset !important;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    gap: 1rem !important;
    padding: 0 0.5rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .insights-grid::-webkit-scrollbar {
    display: none;
  }
  
  .insight-card {
    flex: 0 0 calc(100vw - 3rem) !important;
    min-width: calc(100vw - 3rem) !important;
    max-width: calc(100vw - 3rem) !important;
    scroll-snap-align: center;
    scroll-snap-stop: always;
    padding: 1.25rem;
  }
  
  .carousel-nav {
    display: flex;
    width: 40px;
    height: 40px;
  }
  
  .carousel-nav-left {
    left: 8px;
  }
  
  .carousel-nav-right {
    right: 8px;
  }
  
  .carousel-nav svg {
    width: 20px;
    height: 20px;
  }

  .insights-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .quick-insights h2 {
    font-size: 1.5rem;
  }

  .btn-shuffle {
    width: 100%;
    justify-content: center;
  }
  
  .insight-item-img {
    width: 48px;
    height: 48px;
  }
  
  .insight-item-name {
    font-size: 0.875rem;
  }
  
  .item-rank {
    width: 26px;
    height: 26px;
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .insight-card {
    flex: 0 0 calc(100vw - 2rem) !important;
    min-width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
    padding: 1rem;
  }
  
  .carousel-nav {
    width: 36px;
    height: 36px;
  }
  
  .carousel-nav svg {
    width: 18px;
    height: 18px;
  }
  
  .verdict-winner {
    font-size: 0.875rem;
    flex-wrap: wrap;
  }
  
  .quick-recommendation span {
    font-size: 0.75rem;
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

