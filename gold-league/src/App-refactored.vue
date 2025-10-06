<template>
  <div id="app">
    <header class="app-header" :style="{ backgroundImage: `url(${headerBg})` }">
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="logo-section">
          <img 
            src="https://raw.communitydragon.org/15.8/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/kleptomancy/kleptomancy.png"
            alt="Gold"
            class="logo-icon"
            @error="handleLogoError"
          />
          <h1 class="logo-text">VALUEBUILD</h1>
        </div>
        <p class="subtitle">Get efficient gold value analytics for your builds and items</p>
      </div>
      <div class="header-actions">
        <button @click="refreshItems" :disabled="loading" class="btn btn-refresh">
          {{ loading ? 'Loading...' : 'Refresh Data' }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <div v-if="error" class="error-banner">
        <span>{{ error }}</span>
        <button @click="retryLoad" class="btn-small">Retry</button>
      </div>

      <div v-if="loading && items.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>Loading items from Riot API...</p>
      </div>

      <template v-else-if="items.length > 0">
        <nav class="tab-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="['tab-btn', { active: activeTab === tab.value }]"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="tab-content">
          <!-- Quick Insights -->
          <QuickInsights
            v-if="activeTab === 'table' && randomComparisons.length > 0"
            :comparisons="randomComparisons"
            :gold-icon-url="goldIconUrl"
            @shuffle="generateRandomComparisons"
            @load-comparison="loadRandomComparison"
          />

          <!-- Item Breakdown Modal -->
          <div v-if="showBreakdown" class="modal-overlay" @click="closeBreakdown">
            <div class="modal-content" @click.stop>
              <ItemBreakdown 
                :item="detailedItem"
                :allItems="items"
                @close="closeBreakdown"
                @select="viewDetailed"
              />
            </div>
          </div>

          <!-- Item Table -->
          <ItemTable 
            v-show="activeTab === 'table'" 
            :items="items"
            @compare="handleCompare"
            @addToBuild="handleAddToBuild"
          />
          
          <!-- Item Comparison -->
          <ItemCompare 
            v-show="activeTab === 'compare'" 
            :items="compareItems"
            :allItems="items"
            @clear="clearComparison"
            @viewDetailed="viewDetailed"
            @removeItem="removeFromComparison"
            @addMore="addMoreItems"
          />

          <!-- Build Optimizer -->
          <BuildOptimizer
            v-show="activeTab === 'builds'"
            v-model:current-build="currentBuild"
            :items="items"
            :compare-items="compareItems"
            :gold-icon-url="goldIconUrl"
            @browse-items="activeTab = 'table'"
          />

          <!-- About Section -->
          <AboutSection v-show="activeTab === 'about'" />
        </div>
      </template>
    </main>
    
    <!-- Scroll to Top Button -->
    <transition name="fade-slide">
      <button 
        v-if="showScrollTop"
        @click="scrollToTop"
        class="scroll-to-top"
        title="Scroll to top"
        aria-label="Scroll to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
    </transition>

    <footer class="app-footer">
      <p>ValueBuild | Advanced League of Legends item analytics</p>
      <p class="disclaimer">Data from Riot Games Data Dragon API - Not endorsed by Riot Games</p>
    </footer>
  </div>
</template>

<script setup>
import './app-styles.css'
import { ref, onMounted, onUnmounted } from 'vue'
import ItemTable from './components/ItemTable.vue'
import ItemCompare from './components/ItemCompare.vue'
import ItemBreakdown from './components/ItemBreakdown.vue'
import QuickInsights from './components/QuickInsights.vue'
import BuildOptimizer from './components/BuildOptimizer.vue'
import AboutSection from './components/AboutSection.vue'
import { itemsApi } from './api/items'
import { isItemDeprecated, filterDeprecatedItems } from './utils/deprecatedItems'

const items = ref([])
const loading = ref(false)
const error = ref(null)
const activeTab = ref('table')
const compareItems = ref([])
const headerBg = ref('')
const detailedItem = ref(null)
const showBreakdown = ref(false)
const randomComparisons = ref([])
const currentBuild = ref([])
const goldIconUrl = 'https://ddragon.leagueoflegends.com/cdn/15.19.1/img/ui/gold.png'
const showScrollTop = ref(false)

// Popular champions for random splash art
const champions = [
  'Jinx', 'Lux', 'Ezreal', 'Yasuo', 'Ahri', 'Akali', 'KaiSa', 'Zed', 
  'LeeSin', 'Thresh', 'Jhin', 'Ashe', 'MissFortune', 'Katarina', 'Vayne',
  'Riven', 'Ekko', 'Vi', 'Caitlyn', 'Garen', 'Darius', 'Pyke', 'Senna',
  'Aphelios', 'Seraphine', 'Yone', 'Viego', 'Gwen', 'Akshan', 'Vex'
]

const getRandomSplash = () => {
  const champion = champions[Math.floor(Math.random() * champions.length)]
  const skinNumber = Math.floor(Math.random() * 3)
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion}_${skinNumber}.jpg`
}

const tabs = [
  { value: 'table', label: 'Items Database' },
  { value: 'compare', label: 'Item Comparison' },
  { value: 'builds', label: 'Build Analyzer' },
  { value: 'about', label: 'Documentation' }
]

onMounted(() => {
  loadItems()
  headerBg.value = getRandomSplash()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

async function loadItems() {
  loading.value = true
  error.value = null
  
  try {
    const data = await itemsApi.getItems()
    const rawItems = data.items || []
    items.value = filterDeprecatedItems(rawItems)
    console.log(`Loaded ${items.value.length} items (filtered ${rawItems.length - items.value.length} deprecated)`)
    
    generateRandomComparisons()
    
    if (items.value.length === 0) {
      error.value = 'No items found. Please refresh the data.'
    }
  } catch (err) {
    error.value = 'Failed to load items. Make sure the backend is running on http://localhost:8000'
    console.error('Load error:', err)
  } finally {
    loading.value = false
  }
}

async function refreshItems() {
  loading.value = true
  error.value = null
  
  try {
    await itemsApi.refreshItems()
    await loadItems()
  } catch (err) {
    error.value = 'Failed to refresh items. Please try again.'
    console.error('Refresh error:', err)
  } finally {
    loading.value = false
  }
}

function retryLoad() {
  loadItems()
}

function handleCompare(selectedItems) {
  compareItems.value = selectedItems
  activeTab.value = 'compare'
}

function handleAddToBuild(selectedItems) {
  selectedItems.forEach(item => {
    if (currentBuild.value.length < 6 && !currentBuild.value.some(i => i.id === item.id)) {
      currentBuild.value.push(item)
    }
  })
  activeTab.value = 'builds'
}

function clearComparison() {
  compareItems.value = []
  activeTab.value = 'table'
}

function removeFromComparison(item) {
  const index = compareItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    compareItems.value.splice(index, 1)
  }
  if (compareItems.value.length === 0) {
    activeTab.value = 'table'
  }
}

function addMoreItems() {
  activeTab.value = 'table'
}

function viewDetailed(item) {
  detailedItem.value = item
  showBreakdown.value = true
}

function closeBreakdown() {
  showBreakdown.value = false
  detailedItem.value = null
}

function generateRandomComparisons() {
  if (items.value.length < 4) return
  
  const legendaryItems = items.value.filter(item => {
    if (isItemDeprecated(item)) return false
    if (item.cost < 2000 || item.goldEfficiency < 90) return false
    if (!item.id || !/^\d+$/.test(item.id.toString())) return false
    
    const hasStats = item.statBreakdown && Object.keys(item.statBreakdown).length > 0
    const hasEffects = item.description && item.description.length > 20
    if (!hasStats && !hasEffects) return false
    
    return true
  })
  
  if (legendaryItems.length < 3) return
  
  randomComparisons.value = []
  for (let i = 0; i < 3; i++) {
    const shuffled = [...legendaryItems].sort(() => 0.5 - Math.random())
    randomComparisons.value.push(shuffled.slice(0, 3))
  }
}

function loadRandomComparison(comparisonSet) {
  compareItems.value = comparisonSet
  activeTab.value = 'compare'
}

function handleLogoError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23F0A829"/%3E%3C/svg%3E'
}

function handleScroll() {
  showScrollTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

