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
  background: var(--bg-primary);
}

.app-header {
  background: var(--bg-secondary);
  padding: 2rem 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.header-content h1 {
  color: var(--gold);
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  max-width: 1400px;
  margin: 1.25rem auto 0;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
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

.about-section {
  padding: 1.5rem;
  color: var(--text-primary);
}

.about-section h2 {
  color: var(--gold);
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
}

.info-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  margin-bottom: 1.75rem;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.info-card h3 {
  color: var(--gold);
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-card p {
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.info-card ul {
  line-height: 1.8;
  color: var(--text-secondary);
  padding-left: 1.5rem;
}

.info-card strong {
  color: var(--text-primary);
  font-weight: 600;
}

.formula {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gold);
  margin: 1.5rem 0;
  border: 1px solid var(--border-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
}

.rating-list {
  list-style: none;
  padding: 0;
}

.rating-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem;
  background: var(--bg-tertiary);
  margin-bottom: 0.625rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  min-width: 100px;
  text-align: center;
  font-size: 0.8125rem;
}

.eff-excellent { background: rgba(34, 197, 94, 0.15); color: var(--success); border: 1px solid rgba(34, 197, 94, 0.3); }
.eff-good { background: rgba(59, 130, 246, 0.15); color: var(--info); border: 1px solid rgba(59, 130, 246, 0.3); }
.eff-fair { background: rgba(234, 179, 8, 0.15); color: var(--warning); border: 1px solid rgba(234, 179, 8, 0.3); }
.eff-poor { background: rgba(239, 68, 68, 0.15); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.3); }

.stat-values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-value-item {
  display: flex;
  justify-content: space-between;
  padding: 0.875rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.stat-name {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
}

.stat-gold {
  color: var(--gold);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.875rem;
}

.tech-stack {
  text-align: center;
}

.source-link {
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.source-link a {
  color: var(--gold);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.source-link a:hover {
  color: rgb(220, 148, 21);
  text-decoration: underline;
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

@media (max-width: 768px) {
  .header-content h1 {
    font-size: 1.875rem;
  }
  
  .stat-values-grid {
    grid-template-columns: 1fr;
  }
}
</style>
