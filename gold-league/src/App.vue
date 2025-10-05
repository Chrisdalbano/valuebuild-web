<template>
  <div id="app">
    <header class="app-header" :style="{ backgroundImage: `url(${headerBg})` }">
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="logo-section">
          <img 
            src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/magicalfootwear/magicalfootwear.png"
            alt="Gold"
            class="logo-icon"
            @error="handleLogoError"
          />
          <h1 class="logo-text">ITEMDSIFF.GG</h1>
        </div>
        <p class="subtitle">Gold efficiency analytics for items</p>
      </div>
      <!-- <div class="header-actions">
        <button @click="refreshItems" :disabled="loading" class="btn btn-refresh">
          {{ loading ? 'Loading...' : 'Refresh Data' }}
        </button>
      </div> -->
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
          <!-- Random Comparisons Section -->
          <div v-if="activeTab === 'table' && randomComparisons.length > 0" class="random-comparisons">
            <h2>Random Item Comparisons</h2>
            <p class="subtitle-text">Quick analysis of popular legendary items</p>
            <div class="comparison-cards">
              <div v-for="(comp, index) in randomComparisons" :key="index" class="comparison-card" @click="loadRandomComparison(comp)">
                <div class="card-items">
                  <img v-for="item in comp" :key="item.id" :src="`https://ddragon.leagueoflegends.com/cdn/14.20.1/img/item/${item.id}.png`" :alt="item.name" class="card-item-icon" />
                </div>
                <div class="card-info">
                  <div class="card-title">{{ comp.map(i => i.name).join(' vs ') }}</div>
                  <div class="card-stats">
                    <span>Avg Efficiency: {{ (comp.reduce((sum, i) => sum + i.goldEfficiency, 0) / comp.length).toFixed(1) }}%</span>
                  </div>
                </div>
                <button class="card-btn">Compare →</button>
              </div>
            </div>
          </div>

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

          <ItemTable 
            v-show="activeTab === 'table'" 
            :items="items"
            @compare="handleCompare"
          />
          
          <ItemCompare 
            v-show="activeTab === 'compare'" 
            :items="compareItems"
            :allItems="items"
            @clear="clearComparison"
            @viewDetailed="viewDetailed"
          />

          <div v-show="activeTab === 'builds'" class="builds-section">
            <h2>Build Optimizer</h2>
            <div class="info-card">
              <h3>Coming Soon</h3>
              <p>
                This feature will analyze optimal item builds by considering:
              </p>
              <ul>
                <li>Item synergies and passive combinations</li>
                <li>Champion-specific stat priorities</li>
                <li>Build path efficiency at different gold thresholds</li>
                <li>Power spikes and scaling curves</li>
                <li>Situational item recommendations based on game state</li>
              </ul>
              <p class="feature-note">
                Select items from the database to manually build and analyze custom builds in the meantime.
              </p>
            </div>
          </div>
          
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
      <p>itemsdiff.gg | Advanced League of Legends item analytics</p>
      <p class="disclaimer">Data from Riot Games Data Dragon API - Not endorsed by Riot Games</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ItemTable from './components/ItemTable.vue'
import ItemCompare from './components/ItemCompare.vue'
import ItemBreakdown from './components/ItemBreakdown.vue'
import { itemsApi } from './api/items'

const items = ref([])
const loading = ref(false)
const error = ref(null)
const activeTab = ref('table')
const compareItems = ref([])
const headerBg = ref('')
const detailedItem = ref(null)
const showBreakdown = ref(false)
const randomComparisons = ref([])

// Popular champions for random splash art
const champions = [
  'Jinx', 'Lux', 'Ezreal', 'Yasuo', 'Ahri', 'Akali', 'KaiSa', 'Zed', 
  'LeeSin', 'Thresh', 'Jhin', 'Ashe', 'MissFortune', 'Katarina', 'Vayne',
  'Riven', 'Ekko', 'Vi', 'Caitlyn', 'Garen', 'Darius', 'Pyke', 'Senna',
  'Aphelios', 'Seraphine', 'Yone', 'Viego', 'Gwen', 'Akshan', 'Vex'
]

// Get random splash art
const getRandomSplash = () => {
  const champion = champions[Math.floor(Math.random() * champions.length)]
  const skinNumber = Math.floor(Math.random() * 3) // 0-2 for base and first couple skins
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
})

async function loadItems() {
  loading.value = true
  error.value = null
  
  try {
    const data = await itemsApi.getItems()
    items.value = data.items || []
    // Generate random comparisons after items load
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

function clearComparison() {
  compareItems.value = []
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
  
  // Get high-efficiency legendary items
  const legendaryItems = items.value.filter(item => 
    item.cost >= 2000 && item.goldEfficiency >= 90
  )
  
  if (legendaryItems.length < 3) return
  
  // Create 3 random comparison sets
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
  // Fallback to a gold coin emoji as SVG if image fails
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23F0A829"/%3E%3C/svg%3E'
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

.about-section,
.builds-section {
  padding: 1.5rem;
  color: var(--text-primary);
}

.feature-note {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius-md);
  font-style: italic;
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

.random-comparisons {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-primary);
}

.random-comparisons h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.subtitle-text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.comparison-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.comparison-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.comparison-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-items {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.card-item-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
}

.card-info {
  margin-bottom: 1rem;
}

.card-title {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.card-stats {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.card-btn {
  width: 100%;
  padding: 0.5rem;
  background: var(--gold);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.card-btn:hover {
  background: var(--rust);
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

@media (max-width: 768px) {
  .logo-text {
    font-size: 1.875rem;
  }
  
  .app-header {
    background-position: center center;
  }
  
  .stat-values-grid {
    grid-template-columns: 1fr;
  }
}
</style>
