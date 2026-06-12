<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/organisms/NavBar.vue'
import ExplorerHero from './components/organisms/ExplorerHero.vue'
import QuickInsights from './components/organisms/QuickInsights.vue'
import ItemBreakdownModal from './components/organisms/ItemBreakdownModal.vue'
import AppFooter from './components/organisms/AppFooter.vue'
import ScrollTopButton from './components/molecules/ScrollTopButton.vue'
import AppHeroSplash from './components/molecules/AppHeroSplash.vue'
import { useItems } from './composables/useItems'
import { useRandomComparisons } from './composables/useRandomComparisons'
import { useChampionSplash } from './composables/useChampionSplash'

const router = useRouter()
const { splash } = useChampionSplash()
const { items, loading, error, loadItems } = useItems()
const { randomComparisons, generateRandomComparisons } = useRandomComparisons(items)

const compareItems = ref([])
const currentBuild = ref([])
const detailedItem = ref(null)
const goldIconUrl = '/20px-Gold_colored_icon.png' // Local SVG icon in public folder

onMounted(async () => {
  await loadItems()
  generateRandomComparisons()
})

function retryLoad() {
  loadItems().then(generateRandomComparisons)
}

// Comparison state (shared across explorer / compare routes)
function handleCompare(selectedItems) {
  compareItems.value = selectedItems
  router.push('/compare')
}

function clearComparison() {
  compareItems.value = []
  router.push('/')
}

function removeFromComparison(item) {
  const index = compareItems.value.findIndex(i => i.id === item.id)
  if (index > -1) compareItems.value.splice(index, 1)
  if (compareItems.value.length === 0) router.push('/')
}

function swapComparisonItem(oldItem, newItem) {
  const index = compareItems.value.findIndex(i => i.id === oldItem.id)
  if (index > -1) compareItems.value[index] = newItem
}

function addToComparison(newItem) {
  if (compareItems.value.length < 6 && !compareItems.value.some(i => i.id === newItem.id)) {
    compareItems.value.push(newItem)
  }
}

function loadRandomComparison(comparisonSet) {
  compareItems.value = comparisonSet
  router.push('/compare')
}

// Build state
function handleAddToBuild(selectedItems) {
  selectedItems.forEach(item => {
    if (currentBuild.value.length < 6 && !currentBuild.value.some(i => i.id === item.id)) {
      currentBuild.value.push(item)
    }
  })
  router.push('/builds')
}

function goToItems() {
  router.push('/')
}
</script>

<template>
  <div id="app">
    <NavBar
      :item-count="items.length"
      :compare-count="compareItems.length"
      :build-count="currentBuild.length"
    />

    <!-- Champion Splash Background Banner (hidden on About page) -->
    <AppHeroSplash v-if="$route.path !== '/about'" :splash="splash" />

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
        <ExplorerHero v-if="$route.path === '/'" :item-count="items.length" />

        <QuickInsights
          v-if="$route.path === '/' && randomComparisons.length > 0"
          :comparisons="randomComparisons"
          :gold-icon-url="goldIconUrl"
          @shuffle="generateRandomComparisons"
          @load-comparison="loadRandomComparison"
        />

        <ItemBreakdownModal
          :item="detailedItem"
          :all-items="items"
          @close="detailedItem = null"
          @select="detailedItem = $event"
        />

        <router-view v-slot="{ Component }">
          <component
            :is="Component"
            :items="$route.name === 'Compare' ? compareItems : items"
            :compare-items="compareItems"
            :all-items="items"
            :gold-icon-url="goldIconUrl"
            v-model:current-build="currentBuild"
            @compare="handleCompare"
            @add-to-build="handleAddToBuild"
            @clear="clearComparison"
            @remove-item="removeFromComparison"
            @swap-item="swapComparisonItem"
            @add-item="addToComparison"
            @browse-items="goToItems"
            @view-detailed="detailedItem = $event"
          />
        </router-view>
      </template>
    </main>

    <ScrollTopButton />

    <AppFooter />
  </div>
</template>

<style scoped>
#app { min-height: 100vh; position: relative; display: flex; flex-direction: column; }


.app-main {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  background: var(--bg-canvas);
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  padding-top: calc(64px + 2rem); /* Navbar height + spacing */
}

@media (max-width: 768px) {
  .app-main {
    padding-top: calc(56px + 1.5rem); /* Mobile navbar height + spacing */
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

.error-banner { background: color-mix(in srgb, var(--fb-error) 10%, transparent); border: 1px solid var(--fb-error); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; color: var(--fg-primary); }

.btn-small { padding: 0.375rem 0.875rem; font-size: 0.8125rem; background: var(--accent-warm); color: var(--fg-primary); border: 1px solid var(--accent-warm); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }

.btn-small:hover { background: var(--accent-warm-hover); }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1.5rem; color: var(--fg-secondary); }

.spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent-lead); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1.25rem; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
