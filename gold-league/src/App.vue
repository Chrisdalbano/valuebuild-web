<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1>⚔️ League Item Efficiency Tracker</h1>
        <p class="subtitle">Calculate and compare gold efficiency for League of Legends items</p>
      </div>
      <div class="header-actions">
        <button @click="refreshItems" :disabled="loading" class="btn btn-refresh">
          {{ loading ? 'Loading...' : '🔄 Refresh Data' }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <div v-if="error" class="error-banner">
        <span>⚠️ {{ error }}</span>
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
            {{ tab.icon }} {{ tab.label }}
          </button>
        </nav>

        <div class="tab-content">
          <ItemTable 
            v-show="activeTab === 'table'" 
            :items="items"
            @compare="handleCompare"
          />
          
          <ItemCompare 
            v-show="activeTab === 'compare'" 
            :items="compareItems"
            @clear="clearComparison"
          />
          
          <ItemChart 
            v-show="activeTab === 'charts'" 
            :items="items"
          />
          
          <div v-show="activeTab === 'about'" class="about-section">
            <h2>About Gold Efficiency</h2>
            <div class="info-card">
              <h3>What is Gold Efficiency?</h3>
              <p>
                Gold efficiency is a derivative heuristic to compare item efficiency based on their 
                stats versus price (gold cost). It's calculated as:
              </p>
              <div class="formula">
                Gold Efficiency = (Gold Value / Item Price) × 100%
              </div>
              <p>
                Where <strong>Gold Value</strong> is the sum of the item's stats multiplied by their 
                reference gold values from base items.
              </p>
            </div>

            <div class="info-card">
              <h3>Rating System</h3>
              <ul class="rating-list">
                <li><span class="badge eff-excellent">Excellent</span> ≥120% - Exceptional value</li>
                <li><span class="badge eff-good">Good</span> ≥100% - Cost efficient</li>
                <li><span class="badge eff-fair">Fair</span> ≥80% - Moderate value</li>
                <li><span class="badge eff-poor">Poor</span> &lt;80% - Low stat value (usually has powerful passives)</li>
              </ul>
            </div>

            <div class="info-card">
              <h3>Important Notes</h3>
              <ul>
                <li>Gold efficiency only measures <strong>stat value</strong>, not the power of passive or active effects</li>
                <li>Items with low efficiency often have powerful unique effects that aren't reflected in raw stats</li>
                <li>Use this tool as a <strong>starting point</strong> for theorycrafting, not as absolute truth</li>
                <li>Champion synergies, team composition, and game state are more important than raw efficiency</li>
              </ul>
            </div>

            <div class="info-card">
              <h3>Reference Stat Values</h3>
              <div class="stat-values-grid">
                <div class="stat-value-item">
                  <span class="stat-name">Attack Damage</span>
                  <span class="stat-gold">35g per point</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Ability Power</span>
                  <span class="stat-gold">20g per point</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Armor</span>
                  <span class="stat-gold">20g per point</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Magic Resist</span>
                  <span class="stat-gold">20g per point</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Health</span>
                  <span class="stat-gold">2.67g per HP</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Mana</span>
                  <span class="stat-gold">1g per mana</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Attack Speed</span>
                  <span class="stat-gold">25g per 10%</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Crit Chance</span>
                  <span class="stat-gold">40g per 1%</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Life Steal</span>
                  <span class="stat-gold">53.55g per 1%</span>
                </div>
                <div class="stat-value-item">
                  <span class="stat-name">Movement Speed</span>
                  <span class="stat-gold">12g per point</span>
                </div>
              </div>
            </div>

            <div class="info-card tech-stack">
              <h3>Tech Stack</h3>
              <p>Built with Vue 3, FastAPI, Chart.js, and Riot's Data Dragon API</p>
              <p class="source-link">Data sourced from <a href="https://leagueoflegends.fandom.com/wiki/Gold_efficiency" target="_blank">League of Legends Wiki</a></p>
            </div>
          </div>
        </div>
      </template>
    </main>

    <footer class="app-footer">
      <p>League Item Efficiency Tracker | Data from Riot Games API</p>
      <p class="disclaimer">Not endorsed by Riot Games</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ItemTable from './components/ItemTable.vue'
import ItemCompare from './components/ItemCompare.vue'
import ItemChart from './components/ItemChart.vue'
import { itemsApi } from './api/items'

const items = ref([])
const loading = ref(false)
const error = ref(null)
const activeTab = ref('table')
const compareItems = ref([])

const tabs = [
  { value: 'table', label: 'Item Table', icon: '📋' },
  { value: 'compare', label: 'Compare', icon: '⚖️' },
  { value: 'charts', label: 'Analytics', icon: '📊' },
  { value: 'about', label: 'About', icon: 'ℹ️' }
]

onMounted(() => {
  loadItems()
})

async function loadItems() {
  loading.value = true
  error.value = null
  
  try {
    const data = await itemsApi.getItems()
    items.value = data.items || []
    
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

function clearComparison() {
  compareItems.value = []
  activeTab.value = 'table'
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px 20px;
  border-bottom: 3px solid #e94560;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.header-content h1 {
  color: #e94560;
  font-size: 42px;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.subtitle {
  color: #a0a0a0;
  font-size: 18px;
  margin: 0;
}

.header-actions {
  max-width: 1400px;
  margin: 20px auto 0;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.btn-refresh {
  background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
  color: #fff;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 6px 12px;
  font-size: 14px;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 20px;
}

.error-banner {
  background: rgba(248, 113, 113, 0.2);
  border: 2px solid #f87171;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #fff;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(233, 69, 96, 0.2);
  border-top-color: #e94560;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tab-nav {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 24px;
  border: 2px solid #0f3460;
  border-radius: 8px 8px 0 0;
  background: #16213e;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.tab-btn:hover {
  background: #1a1a2e;
  border-color: #e94560;
}

.tab-btn.active {
  background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
  border-color: #e94560;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.about-section {
  padding: 20px;
  color: #fff;
}

.about-section h2 {
  color: #e94560;
  font-size: 32px;
  margin-bottom: 30px;
  text-align: center;
}

.info-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  border: 2px solid #0f3460;
}

.info-card h3 {
  color: #e94560;
  margin-bottom: 15px;
  font-size: 22px;
}

.info-card p {
  line-height: 1.8;
  color: #ddd;
  margin-bottom: 15px;
}

.info-card ul {
  line-height: 2;
  color: #ddd;
  padding-left: 20px;
}

.formula {
  background: #16213e;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #e94560;
  margin: 20px 0;
  border: 2px solid #0f3460;
}

.rating-list {
  list-style: none;
  padding: 0;
}

.rating-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: rgba(15, 52, 96, 0.3);
  margin-bottom: 10px;
  border-radius: 6px;
}

.badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  min-width: 100px;
  text-align: center;
}

.eff-excellent { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
.eff-good { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.eff-fair { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.eff-poor { background: rgba(248, 113, 113, 0.2); color: #f87171; }

.stat-values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-value-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: rgba(15, 52, 96, 0.3);
  border-radius: 6px;
}

.stat-name {
  color: #fff;
  font-weight: 500;
}

.stat-gold {
  color: #ffd700;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.tech-stack {
  text-align: center;
}

.source-link {
  margin-top: 10px;
  font-size: 14px;
}

.source-link a {
  color: #e94560;
  text-decoration: none;
  font-weight: 600;
}

.source-link a:hover {
  text-decoration: underline;
}

.app-footer {
  background: #16213e;
  padding: 20px;
  text-align: center;
  color: #a0a0a0;
  border-top: 2px solid #0f3460;
}

.app-footer p {
  margin: 5px 0;
}

.disclaimer {
  font-size: 12px;
  font-style: italic;
}
</style>
