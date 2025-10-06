<template>
  <div id="app">
    <!-- Navigation Component -->
    <Navigation 
      :item-count="items.length"
      :compare-count="compareItems.length"
      :build-count="currentBuild.length"
    />

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
        <!-- Quick Insights -->
        <QuickInsights
          v-if="$route.path === '/' && randomComparisons.length > 0"
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

        <!-- Router View for Pages -->
        <router-view 
          :items="items"
          :compare-items="compareItems"
          :current-build="currentBuild"
          :all-items="items"
          :gold-icon-url="goldIconUrl"
          @compare="handleCompare"
          @add-to-build="handleAddToBuild"
          @clear="clearComparison"
          @view-detailed="viewDetailed"
          @remove-item="removeFromComparison"
          @add-more="goToItems"
          @browse-items="goToItems"
          v-model:current-build="currentBuild"
        />
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
      <p>BuildValue | Advanced League of Legends item analytics</p>
      <p class="disclaimer">Data from Riot Games Data Dragon API - Not endorsed by Riot Games</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navigation from './components/Navigation.vue'
import ItemTable from './components/ItemTable.vue'
import ItemCompare from './components/ItemCompare.vue'
import ItemBreakdown from './components/ItemBreakdown.vue'
import QuickInsights from './components/QuickInsights.vue'
import BuildOptimizer from './components/BuildOptimizer.vue'
import AboutSection from './components/AboutSection.vue'
import { itemsApi } from './api/items'
import { isItemDeprecated, filterDeprecatedItems } from './utils/deprecatedItems'

import { useRouter } from 'vue-router'

const router = useRouter()
const items = ref([])
const loading = ref(false)
const error = ref(null)
const compareItems = ref([])
const headerBg = ref('')
const detailedItem = ref(null)
const showBreakdown = ref(false)
const randomComparisons = ref([])
const currentBuild = ref([])
const goldIconUrl = '/20px-Gold_colored_icon.png' // Local SVG icon in public folder
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

// Tabs removed - now using Vue Router

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
  router.push('/compare')
}

function handleAddToBuild(selectedItems) {
  selectedItems.forEach(item => {
    if (currentBuild.value.length < 6 && !currentBuild.value.some(i => i.id === item.id)) {
      currentBuild.value.push(item)
    }
  })
  router.push('/builds')
}

function clearComparison() {
  compareItems.value = []
  router.push('/')
}

function removeFromComparison(item) {
  const index = compareItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    compareItems.value.splice(index, 1)
  }
  if (compareItems.value.length === 0) {
    router.push('/')
  }
}

function goToItems() {
  router.push('/')
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

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.app-header {
  position: relative;
  background: var(--bg-secondary);
  background-size: cover;
  background-position: center 30%;
  background-repeat: no-repeat;
  padding: 2rem 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(12, 12, 14, 0.92) 0%,
    rgba(18, 18, 20, 0.88) 50%,
    rgba(12, 12, 14, 0.92) 100%
  );
  backdrop-filter: blur(2px);
  z-index: 1;
}

.header-content {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  z-index: 2;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  filter: brightness(1.2) drop-shadow(0 0 8px rgba(240, 168, 41, 0.6));
}

.logo-text {
  color: var(--gold);
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8),
               0 4px 24px rgba(0, 0, 0, 0.6);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.header-actions {
  position: relative;
  max-width: 1400px;
  margin: 1.25rem auto 0;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  z-index: 2;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--border-secondary);
}

.btn-refresh {
  background: var(--gold);
  color: var(--bg-primary);
  border-color: var(--gold);
}

.btn-refresh:hover:not(:disabled) {
  background: rgb(220, 148, 21);
  border-color: rgb(220, 148, 21);
  box-shadow: var(--shadow-md);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-small {
  padding: 0.375rem 0.875rem;
  font-size: 0.8125rem;
  background: var(--rust);
  color: var(--text-primary);
  border: 1px solid var(--rust);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background: rgb(155, 84, 75);
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.25rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tab-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--bg-tertiary);
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
}

.modal-content {
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 0;
}

.app-footer {
  background: var(--bg-secondary);
  padding: 1.5rem;
  text-align: center;
  color: var(--text-tertiary);
  border-top: 1px solid var(--border-primary);
  font-size: 0.875rem;
}

.app-footer p {
  margin: 0.375rem 0;
}

.disclaimer {
  font-size: 0.75rem;
  font-style: italic;
  color: var(--text-tertiary);
}

/* Scroll to Top Button */
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 999999;
  backdrop-filter: blur(10px);
}

.scroll-to-top:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(240, 168, 41, 0.4);
}

.scroll-to-top:active {
  transform: translateY(-2px);
}

.scroll-to-top svg {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.scroll-to-top:hover svg {
  transform: translateY(-2px);
}

/* Fade-slide transition for scroll button */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.8);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (max-width: 768px) {
  .scroll-to-top {
    bottom: 1rem;
    right: 1rem;
    width: 44px;
    height: 44px;
  }
  
  .scroll-to-top svg {
    width: 20px;
    height: 20px;
  }

  .logo-text {
    font-size: 1.875rem;
  }
  
  .app-header {
    background-position: center center;
  }
}
</style>

