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
          <!-- Quick Insights Section -->
          <div v-if="activeTab === 'table' && randomComparisons.length > 0" class="quick-insights">
            <div class="insights-header">
              <div>
                <h2>⚡ Quick Comparisons</h2>
                <p class="insights-subtitle">Popular item matchups analyzed instantly</p>
              </div>
              <button @click="generateRandomComparisons" class="btn-shuffle" title="Shuffle comparisons">
                🔄 Shuffle
              </button>
            </div>
            
            <div class="insights-grid">
              <div v-for="(comp, index) in randomComparisons" :key="index" class="insight-card" @click="loadRandomComparison(comp)">
                <div class="insight-header">
                  <div class="insight-badge">Quick Compare</div>
                  <div class="insight-avg" :class="getEfficiencyClass((comp.reduce((sum, i) => sum + i.goldEfficiency, 0) / comp.length))">
                    {{ (comp.reduce((sum, i) => sum + i.goldEfficiency, 0) / comp.length).toFixed(1) }}%
                  </div>
                </div>
                
                <div class="insight-items">
                  <div v-for="(item, idx) in comp" :key="item.id" class="insight-item">
                    <img :src="`https://ddragon.leagueoflegends.com/cdn/14.20.1/img/item/${item.id}.png`" :alt="item.name" class="insight-item-img" />
                    <div class="insight-item-details">
                      <div class="insight-item-name">{{ item.name }}</div>
                      <div class="insight-item-stats">
                        <span class="insight-eff" :class="getEfficiencyClass(item.goldEfficiency)">{{ item.goldEfficiency }}%</span>
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
            @addToBuild="handleAddToBuild"
          />
          
          <ItemCompare 
            v-show="activeTab === 'compare'" 
            :items="compareItems"
            :allItems="items"
            @clear="clearComparison"
            @viewDetailed="viewDetailed"
            @removeItem="removeFromComparison"
            @addMore="addMoreItems"
          />

          <div v-show="activeTab === 'builds'" class="builds-section">
            <div class="builds-header">
              <div>
                <h2>⚔️ Build Optimizer</h2>
                <p class="builds-subtitle">Create and analyze optimal item builds for maximum gold efficiency</p>
              </div>
              <button v-if="currentBuild.length > 0" @click="clearBuild" class="btn-clear-build">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
                Clear Build
              </button>
            </div>

            <!-- Role Filter -->
            <div class="role-selector">
              <div class="role-label">Build Type:</div>
              <button 
                v-for="role in roles" 
                :key="role.value"
                @click="selectedRole = role.value"
                :class="['role-btn', { active: selectedRole === role.value }]"
              >
                <img :src="role.icon" :alt="role.label" class="role-icon" @error="(e) => e.target.style.display = 'none'" />
                {{ role.label }}
              </button>
            </div>

            <!-- Item Slots -->
            <div class="build-slots-container">
              <h3>Your Build</h3>
              <div class="build-slots">
                <div 
                  v-for="index in 6" 
                  :key="index" 
                  :class="['build-slot', { filled: currentBuild[index - 1] }]"
                  @click="openItemPicker(index - 1)"
                >
                  <template v-if="currentBuild[index - 1]">
                    <button @click.stop="removeFromBuild(index - 1)" class="slot-remove">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                    <img 
                      :src="`https://ddragon.leagueoflegends.com/cdn/14.20.1/img/item/${currentBuild[index - 1].id}.png`" 
                      :alt="currentBuild[index - 1].name"
                      class="slot-icon"
                    />
                    <div class="slot-name">{{ currentBuild[index - 1].name }}</div>
                    <div class="slot-cost gold">
                      <img :src="goldIconUrl" alt="gold" class="gold-icon" /> {{ currentBuild[index - 1].cost }}
                    </div>
                    <div class="slot-eff" :class="getEfficiencyClass(currentBuild[index - 1].goldEfficiency)">
                      {{ currentBuild[index - 1].goldEfficiency.toFixed(0) }}%
                    </div>
                    
                    <!-- Hover Tooltip -->
                    <div class="build-item-tooltip">
                      <div class="tooltip-header">
                        <img :src="`https://ddragon.leagueoflegends.com/cdn/14.20.1/img/item/${currentBuild[index - 1].id}.png`" :alt="currentBuild[index - 1].name" class="tooltip-icon" />
                        <div class="tooltip-title">
                          <h4>{{ currentBuild[index - 1].name }}</h4>
                          <span class="tooltip-cost gold">{{ currentBuild[index - 1].cost }}g</span>
                        </div>
                      </div>
                      
                      <div class="tooltip-stats-grid">
                        <div class="tooltip-stat">
                          <span class="tooltip-label">Gold Efficiency</span>
                          <span class="tooltip-value" :class="getEfficiencyClass(currentBuild[index - 1].goldEfficiency)">
                            {{ currentBuild[index - 1].goldEfficiency.toFixed(1) }}%
                          </span>
                        </div>
                        <div class="tooltip-stat">
                          <span class="tooltip-label">Stat Value</span>
                          <span class="tooltip-value gold">{{ currentBuild[index - 1].totalGoldValue }}g</span>
                        </div>
                      </div>

                      <div v-if="currentBuild[index - 1].statBreakdown && Object.keys(currentBuild[index - 1].statBreakdown).length > 0" class="tooltip-breakdown">
                        <div class="tooltip-section-title">Stats Provided</div>
                        <div class="tooltip-stats-list">
                          <div v-for="(stat, key) in currentBuild[index - 1].statBreakdown" :key="key" class="tooltip-stat-item">
                            <span class="stat-name">{{ formatStatName(key) }}</span>
                            <span class="stat-amount">{{ formatStatValue(key, stat.amount) }}</span>
                          </div>
                        </div>
                      </div>

                      <div v-if="currentBuild[index - 1].description" class="tooltip-description">
                        <div class="tooltip-section-title">Effects</div>
                        <div class="tooltip-desc-text">{{ sanitizeDescription(currentBuild[index - 1].description) }}</div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="slot-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      <span>Slot {{ index }}</span>
                    </div>
                  </template>
                </div>
              </div>
              <div class="quick-actions">
                <button @click="addToBuild" class="btn-quick-action" :disabled="compareItems.length === 0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Compared Items
                  <span v-if="compareItems.length > 0" class="badge">{{ compareItems.length }}</span>
                </button>
                <button @click="activeTab = 'table'" class="btn-quick-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Browse Items
                </button>
              </div>
            </div>

            <!-- Build Analysis (shown when items are added) -->
            <div v-if="currentBuild.length > 0" class="build-analysis-panel">
              <div class="analysis-row">
                <div class="analysis-card">
                  <div class="analysis-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <h4>Build Statistics</h4>
                  </div>
                  <div class="build-stats-grid">
                    <div class="build-stat">
                      <span class="stat-label">Total Cost</span>
                      <span class="stat-value gold">
                        <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> {{ buildTotalCost }}
                      </span>
                    </div>
                    <div class="build-stat">
                      <span class="stat-label">Gold Value</span>
                      <span class="stat-value gold">
                        <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> {{ buildTotalValue }}
                      </span>
                    </div>
                    <div class="build-stat">
                      <span class="stat-label">Net Gain</span>
                      <span class="stat-value" :class="(buildTotalValue - buildTotalCost) >= 0 ? 'positive' : 'negative'">
                        {{ (buildTotalValue - buildTotalCost) >= 0 ? '+' : '' }}{{ (buildTotalValue - buildTotalCost) }}
                        <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" />
                      </span>
                    </div>
                    <div class="build-stat">
                      <span class="stat-label">Avg Efficiency</span>
                      <span class="stat-value" :class="getEfficiencyClass(buildAvgEfficiency)">
                        {{ buildAvgEfficiency.toFixed(1) }}%
                      </span>
                    </div>
                  </div>
                </div>

                <div class="analysis-card">
                  <div class="analysis-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <h4>Combined Stats</h4>
                  </div>
                  <div class="combined-stats-list">
                    <div v-for="(value, stat) in buildCombinedStats" :key="stat" class="combined-stat-row">
                      <span class="stat-icon">▸</span>
                      <span class="stat-name">{{ formatStatName(stat) }}</span>
                      <span class="stat-value">{{ formatStatValue(stat, value) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="build-recommendations">
                <div class="analysis-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <h4>Build Insights</h4>
                </div>
                <div class="recommendation-content">
                  <p>{{ buildRecommendation }}</p>
                  <div v-if="buildSynergies.length > 0" class="synergies">
                    <strong>Synergies:</strong>
                    <ul>
                      <li v-for="(synergy, idx) in buildSynergies" :key="idx">{{ synergy }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Smart Suggestions -->
            <div class="smart-suggestions">
              <div class="suggestions-header">
                <div>
                  <h3>💡 Smart Suggestions</h3>
                  <p class="suggestions-subtitle">{{ getSuggestionsSubtitle() }}</p>
                </div>
              </div>
              
              <div class="suggestions-grid">
                <div v-for="suggestion in smartSuggestions" :key="suggestion.id" class="suggestion-card">
                  <div class="suggestion-header">
                    <img 
                      :src="`https://ddragon.leagueoflegends.com/cdn/14.20.1/img/item/${suggestion.id}.png`" 
                      :alt="suggestion.name"
                      class="suggestion-icon"
                    />
                    <div class="suggestion-info">
                      <div class="suggestion-name">{{ suggestion.name }}</div>
                      <div class="suggestion-reason">{{ suggestion.reason }}</div>
                    </div>
                  </div>
                  <div class="suggestion-stats">
                    <span class="suggestion-cost gold">
                      <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> {{ suggestion.cost }}
                    </span>
                    <span class="suggestion-eff" :class="getEfficiencyClass(suggestion.goldEfficiency)">
                      {{ suggestion.goldEfficiency.toFixed(0) }}% efficient
                    </span>
                  </div>
                  <button @click="addSuggestionToBuild(suggestion)" class="btn-add-suggestion" :disabled="currentBuild.length >= 6 || currentBuild.some(i => i.id === suggestion.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add to Build
                  </button>
                </div>
              </div>
            </div>

            <!-- Meta Builds -->
            <div class="meta-builds">
              <h3>🏆 Popular Meta Builds</h3>
              <div class="meta-builds-grid">
                <div v-for="build in metaBuilds" :key="build.name" class="meta-build-card">
                  <div class="meta-build-header">
                    <h4>{{ build.name }}</h4>
                    <span class="meta-build-role">{{ build.role }}</span>
                  </div>
                  <div class="meta-build-items">
                    <img 
                      v-for="item in build.items" 
                      :key="item.id"
                      :src="`https://ddragon.leagueoflegends.com/cdn/14.20.1/img/item/${item.id}.png`" 
                      :alt="item.name"
                      :title="item.name"
                      class="meta-item-icon"
                    />
                  </div>
                  <div class="meta-build-stats">
                    <span><img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> {{ build.totalCost }}</span>
                    <span class="meta-eff">{{ build.avgEfficiency }}% avg</span>
                  </div>
                  <button @click="loadMetaBuild(build)" class="btn-load-build">Load Build</button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="currentBuild.length === 0" class="builds-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <h3>Start Building Your Perfect Loadout</h3>
              <p>Click on the item slots above to add items, or browse smart suggestions below</p>
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
      <p>valuebuild.gg | Advanced League of Legends item analytics</p>
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
const currentBuild = ref([])
const selectedRole = ref('all')
const goldIconUrl = 'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/ui/gold.png'

// Build Analyzer data
const roles = [
  { value: 'all', label: 'All', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-all.png' },
  { value: 'marksman', label: 'Marksman', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-marksman.png' },
  { value: 'mage', label: 'Mage', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-mage.png' },
  { value: 'tank', label: 'Tank', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-tank.png' },
  { value: 'fighter', label: 'Fighter', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-fighter.png' },
  { value: 'assassin', label: 'Assassin', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-assassin.png' },
  { value: 'support', label: 'Support', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-support.png' }
]

// Meta builds will be computed based on actual available items
const metaBuildsTemplate = [
  {
    name: 'Crit ADC',
    role: 'Marksman',
    statPriority: ['FlatPhysicalDamageMod', 'FlatCritChanceMod', 'PercentAttackSpeedMod']
  },
  {
    name: 'Burst Mage',
    role: 'Mage',
    statPriority: ['FlatMagicDamageMod', 'PercentCooldownMod']
  },
  {
    name: 'Tank Vanguard',
    role: 'Tank',
    statPriority: ['FlatHPPoolMod', 'FlatArmorMod', 'FlatSpellBlockMod']
  },
  {
    name: 'Bruiser Fighter',
    role: 'Fighter',
    statPriority: ['FlatPhysicalDamageMod', 'FlatHPPoolMod', 'PercentLifeStealMod']
  },
  {
    name: 'Lethality Assassin',
    role: 'Assassin',
    statPriority: ['FlatPhysicalDamageMod', 'FlatArmorPenetrationMod']
  },
  {
    name: 'Enchanter Support',
    role: 'Support',
    statPriority: ['FlatMPRegenMod', 'FlatHPRegenMod', 'PercentCooldownMod']
  }
]

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

function handleAddToBuild(selectedItems) {
  // Add items to build, avoiding duplicates and respecting the 6-item limit
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
  // If no items left, go back to table
  if (compareItems.value.length === 0) {
    activeTab.value = 'table'
  }
}

function addMoreItems() {
  // Switch to table view while keeping current comparison
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
  
  // Get high-efficiency legendary items, excluding deprecated/legacy items
  const legendaryItems = items.value.filter(item => {
    // Basic filters
    if (item.cost < 2000 || item.goldEfficiency < 90) return false
    
    // Exclude items with invalid IDs (non-numeric or special characters)
    if (!item.id || !/^\d+$/.test(item.id.toString())) return false
    
    // Exclude known deprecated/removed items by checking their properties
    // Deprecated items often have "removed" in their description or are from old patches
    if (item.description && item.description.toLowerCase().includes('removed')) return false
    
    // Exclude mythic items (they were removed in Season 2024)
    if (item.description && item.description.toLowerCase().includes('mythic')) return false
    
    // Include items with stats OR effects/description (like Sheen, which has effects but minimal stats)
    const hasStats = item.statBreakdown && Object.keys(item.statBreakdown).length > 0
    const hasEffects = item.description && item.description.length > 20
    if (!hasStats && !hasEffects) return false
    
    return true
  })
  
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

// Build Analyzer functions
function addToBuild() {
  compareItems.value.forEach(item => {
    if (!currentBuild.value.find(i => i.id === item.id) && currentBuild.value.length < 6) {
      currentBuild.value.push(item)
    }
  })
}

function removeFromBuild(index) {
  currentBuild.value.splice(index, 1)
}

function clearBuild() {
  currentBuild.value = []
}

function openItemPicker(index) {
  // For now, just go to the table
  activeTab.value = 'table'
}

function addSuggestionToBuild(item) {
  if (currentBuild.value.length < 6 && !currentBuild.value.some(i => i.id === item.id)) {
    currentBuild.value.push(item)
  }
}

function loadMetaBuild(build) {
  currentBuild.value = []
  if (build.items) {
    build.items.forEach(item => {
      if (item && currentBuild.value.length < 6) {
        currentBuild.value.push(item)
      }
    })
  }
}

function sanitizeDescription(desc) {
  if (!desc) return ''
  return desc
    .replace(/<br>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function getSuggestionsSubtitle() {
  if (selectedRole.value === 'all') {
    return 'Top rated items across all categories'
  }
  const roleLabel = roles.find(r => r.value === selectedRole.value)?.label || 'this role'
  return `Optimized items for ${roleLabel} builds`
}

const buildTotalCost = computed(() => {
  return currentBuild.value.reduce((sum, item) => sum + (item.cost || 0), 0)
})

const buildTotalValue = computed(() => {
  return currentBuild.value.reduce((sum, item) => sum + (item.totalGoldValue || 0), 0)
})

const buildAvgEfficiency = computed(() => {
  if (currentBuild.value.length === 0) return 0
  const total = currentBuild.value.reduce((sum, item) => sum + (item.goldEfficiency || 0), 0)
  return total / currentBuild.value.length
})

const buildCombinedStats = computed(() => {
  const stats = {}
  currentBuild.value.forEach(item => {
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, value]) => {
        stats[key] = (stats[key] || 0) + value
      })
    }
  })
  return stats
})

const buildRecommendation = computed(() => {
  if (currentBuild.value.length === 0) return ''
  
  const avgEff = parseFloat(buildAvgEfficiency.value)
  const totalCost = buildTotalCost.value
  
  let recommendation = ''
  
  if (avgEff >= 110) {
    recommendation = 'Excellent build! High gold efficiency across all items. '
  } else if (avgEff >= 100) {
    recommendation = 'Solid build with good stat value for the cost. '
  } else if (avgEff >= 90) {
    recommendation = 'Decent build, but consider swapping lower efficiency items. '
  } else {
    recommendation = 'This build has low gold efficiency. Look for more cost-effective alternatives. '
  }
  
  if (totalCost > 15000) {
    recommendation += 'This is a very expensive full build.'
  } else if (totalCost > 10000) {
    recommendation += 'Mid-late game build path.'
  } else {
    recommendation += 'Early-mid game build path.'
  }
  
  return recommendation
})

const smartSuggestions = computed(() => {
  if (items.value.length === 0) return []
  
  // Filter items based on selected role
  let filtered = items.value.filter(item => {
    // Only legendary items
    if (item.cost < 2000 || item.goldEfficiency < 85) return false
    
    // Exclude items already in build
    if (currentBuild.value.some(i => i.id === item.id)) return false
    
    // Exclude invalid items
    if (!item.id || !/^\d+$/.test(item.id.toString())) return false
    
    // Include items with stats OR effects (like Sheen)
    const hasStats = item.statBreakdown && Object.keys(item.statBreakdown).length > 0
    const hasEffects = item.description && item.description.length > 20
    if (!hasStats && !hasEffects) return false
    
    return true
  })
  
  // Role-specific filtering
  if (selectedRole.value !== 'all') {
    filtered = filtered.filter(item => {
      const stats = item.statBreakdown || {}
      
      switch (selectedRole.value) {
        case 'marksman':
          return stats.FlatPhysicalDamageMod || stats.FlatCritChanceMod || stats.PercentAttackSpeedMod
        case 'mage':
          return stats.FlatMagicDamageMod || stats.FlatMPRegenMod
        case 'tank':
          return stats.FlatHPPoolMod || stats.FlatArmorMod || stats.FlatSpellBlockMod
        case 'fighter':
          return (stats.FlatPhysicalDamageMod && stats.FlatHPPoolMod) || stats.PercentLifeStealMod
        case 'assassin':
          return stats.FlatPhysicalDamageMod && !stats.FlatCritChanceMod
        case 'support':
          return stats.FlatMPRegenMod || stats.FlatHPRegenMod
        default:
          return true
      }
    })
  }
  
  // Sort by efficiency and take top 6
  const suggestions = filtered
    .sort((a, b) => b.goldEfficiency - a.goldEfficiency)
    .slice(0, 6)
  
  // Add reasons
  return suggestions.map(item => ({
    ...item,
    reason: getItemReason(item)
  }))
})

function getItemReason(item) {
  const stats = item.statBreakdown || {}
  
  if (stats.FlatPhysicalDamageMod && stats.FlatCritChanceMod) {
    return 'High AD & Crit - Great for sustained DPS'
  } else if (stats.FlatMagicDamageMod && Object.keys(stats).length >= 3) {
    return 'Strong AP with utility stats'
  } else if (stats.FlatHPPoolMod && (stats.FlatArmorMod || stats.FlatSpellBlockMod)) {
    return 'Excellent defensive stats'
  } else if (item.goldEfficiency >= 110) {
    return 'Outstanding gold efficiency'
  } else if (item.goldEfficiency >= 100) {
    return 'Cost-effective core item'
  } else {
    return 'Solid stats for the price'
  }
}

const buildSynergies = computed(() => {
  if (currentBuild.value.length < 2) return []
  
  const synergies = []
  const allStats = buildCombinedStats.value
  
  // Check for stat combinations
  if (allStats.FlatPhysicalDamageMod && allStats.FlatCritChanceMod) {
    synergies.push('Critical Strike synergy - AD and Crit work together for multiplicative damage')
  }
  
  if (allStats.FlatMagicDamageMod && allStats.PercentCooldownMod) {
    synergies.push('AP + CDR synergy - More spell casts with higher damage')
  }
  
  if (allStats.FlatHPPoolMod && (allStats.FlatArmorMod || allStats.FlatSpellBlockMod)) {
    synergies.push('Tank synergy - Health and resistances provide effective HP')
  }
  
  if (allStats.PercentLifeStealMod && allStats.FlatPhysicalDamageMod) {
    synergies.push('Sustain synergy - Higher AD increases healing from lifesteal')
  }
  
  if (allStats.PercentMovementSpeedMod) {
    synergies.push('Mobility advantage - Enhanced roaming and kiting potential')
  }
  
  return synergies
})

// Generate meta builds from actual items
const metaBuilds = computed(() => {
  if (items.value.length === 0) return []
  
  return metaBuildsTemplate.map(template => {
    // Filter items based on role
    const roleItems = items.value.filter(item => {
      if (item.cost < 2000 || item.goldEfficiency < 85) return false
      if (!item.id || !/^\d+$/.test(item.id.toString())) return false
      
      // For meta builds, we need items with the specific stats
      if (!item.statBreakdown || Object.keys(item.statBreakdown).length === 0) return false
      
      const stats = item.statBreakdown
      // Check if item has any of the priority stats
      return template.statPriority.some(stat => stats[stat])
    })
    
    // Sort by efficiency and take top 6
    const topItems = roleItems
      .sort((a, b) => b.goldEfficiency - a.goldEfficiency)
      .slice(0, 6)
    
    const totalCost = topItems.reduce((sum, item) => sum + item.cost, 0)
    const avgEfficiency = topItems.length > 0 
      ? topItems.reduce((sum, item) => sum + item.goldEfficiency, 0) / topItems.length
      : 0
    
    return {
      name: template.name,
      role: template.role,
      items: topItems,
      totalCost: Math.round(totalCost),
      avgEfficiency: avgEfficiency.toFixed(1)
    }
  }).filter(build => build.items.length >= 4) // Only show builds with at least 4 items
})

function getEfficiencyClass(efficiency) {
  if (efficiency >= 110) return 'excellent'
  if (efficiency >= 100) return 'good'
  if (efficiency >= 90) return 'fair'
  return 'poor'
}

function formatStatName(statKey) {
  const names = {
    FlatPhysicalDamageMod: 'Attack Damage',
    FlatMagicDamageMod: 'Ability Power',
    FlatArmorMod: 'Armor',
    FlatSpellBlockMod: 'Magic Resist',
    FlatHPPoolMod: 'Health',
    FlatMPPoolMod: 'Mana',
    PercentCritChanceMod: 'Crit Chance',
    PercentAttackSpeedMod: 'Attack Speed',
    FlatMovementSpeedMod: 'Movement Speed',
    PercentLifeStealMod: 'Life Steal',
    AbilityHaste: 'Ability Haste'
  }
  return names[statKey] || statKey
}

function formatStatValue(statKey, value) {
  const percentageStats = ['PercentCritChanceMod', 'PercentAttackSpeedMod', 'PercentLifeStealMod']
  if (percentageStats.includes(statKey)) {
    return `${(value * 100).toFixed(1)}%`
  }
  return value.toFixed(1)
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
  transform: rotate(180deg);
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

.builds-section {
  padding: 2rem;
}

.builds-section h2 {
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.build-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: var(--gold);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover:not(:disabled) {
  background: var(--rust);
  transform: translateY(-1px);
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--gold);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--rust);
}

.build-analysis {
  display: grid;
  gap: 2rem;
}

.build-items, .build-stats {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

.build-items h3, .build-stats h3 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.build-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.build-item-card {
  position: relative;
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  text-align: center;
  transition: all 0.2s;
}

.build-item-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.build-item-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
}

.build-item-name {
  font-size: 0.75rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.build-item-cost, .build-item-eff {
  font-size: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.combined-stats {
  margin-bottom: 2rem;
}

.combined-stats h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.stats-list {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.build-recommendation {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.build-recommendation h4 {
  color: var(--gold);
  margin-bottom: 0.75rem;
}

.build-recommendation p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.empty-build-state {
  background: var(--bg-secondary);
  padding: 3rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  text-align: center;
}

.empty-build-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* New Build Analyzer Styles */
.builds-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-primary);
}

.builds-subtitle {
  color: var(--text-tertiary);
  font-size: 0.9375rem;
  margin-top: 0.5rem;
}

.btn-clear-build {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-build svg {
  width: 18px;
  height: 18px;
}

.btn-clear-build:hover {
  background: var(--error);
  border-color: var(--error);
  color: white;
  transform: translateY(-2px);
}

/* Role Selector */
.role-selector {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  background: var(--bg-tertiary);
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 1px solid var(--border-primary);
}

.role-label {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.role-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.role-btn.active .role-icon {
  filter: brightness(0) invert(0);
}

.role-btn:hover {
  background: var(--bg-primary);
  border-color: var(--gold);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.role-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
  font-weight: 700;
}

/* Build Slots */
.build-slots-container {
  background: var(--bg-tertiary);
  padding: 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 2px solid var(--border-primary);
}

.build-slots-container h3 {
  color: var(--gold);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.build-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.build-slot {
  position: relative;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.build-slot:hover {
  border-color: var(--gold);
  background: var(--bg-primary);
  transform: translateY(-2px);
}

.build-slot.filled {
  border-style: solid;
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.05), rgba(135, 64, 55, 0.05));
  position: relative;
}

.build-slot.filled:hover .build-item-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.slot-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.slot-placeholder svg {
  width: 32px;
  height: 32px;
  opacity: 0.5;
}

.slot-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  border: 2px solid var(--gold);
  object-fit: contain;
  margin-bottom: 0.75rem;
}

.slot-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.8125rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.slot-cost {
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
  margin-bottom: 0.25rem;
}

.slot-eff {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
}

.slot-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: var(--error);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.slot-remove svg {
  width: 14px;
  height: 14px;
}

.slot-remove:hover {
  transform: scale(1.1);
  background: rgb(200, 40, 40);
}

/* Build Item Tooltip */
.build-item-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  width: 320px;
  background: var(--bg-primary);
  border: 2px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  margin-top: 0.5rem;
}

.tooltip-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.tooltip-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--gold);
  object-fit: contain;
  background: var(--bg-secondary);
}

.tooltip-title {
  flex: 1;
}

.tooltip-title h4 {
  color: var(--text-primary);
  font-size: 1rem;
  margin: 0 0 0.375rem 0;
  font-weight: 700;
}

.tooltip-cost {
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.tooltip-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.tooltip-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.tooltip-label {
  color: var(--text-tertiary);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tooltip-value {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
}

.tooltip-breakdown {
  margin-bottom: 1rem;
}

.tooltip-section-title {
  color: var(--gold);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.tooltip-stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tooltip-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.tooltip-stat-item .stat-name {
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.tooltip-stat-item .stat-amount {
  color: var(--gold);
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.tooltip-description {
  margin-bottom: 0;
}

.tooltip-desc-text {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-quick-action {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.btn-quick-action svg {
  width: 16px;
  height: 16px;
}

.btn-quick-action:not(:disabled):hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
  transform: translateY(-2px);
}

.btn-quick-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--gold);
  color: var(--bg-primary);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Build Analysis Panel */
.build-analysis-panel {
  background: var(--bg-tertiary);
  padding: 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 2px solid var(--border-primary);
}

.analysis-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.analysis-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--gold);
  font-weight: 700;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-primary);
}

.analysis-header svg {
  width: 20px;
  height: 20px;
}

.analysis-header h4 {
  margin: 0;
  font-size: 1rem;
}

.build-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.build-stat {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.875rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.stat-label {
  color: var(--text-tertiary);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.combined-stats-list {
  max-height: 200px;
  overflow-y: auto;
}

.combined-stat-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
}

.stat-icon {
  color: var(--gold);
  font-weight: bold;
}

.combined-stat-row .stat-name {
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.combined-stat-row .stat-value {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  text-align: right;
}

.build-recommendations {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.recommendation-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.synergies {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--gold);
}

.synergies strong {
  color: var(--gold);
  display: block;
  margin-bottom: 0.75rem;
}

.synergies ul {
  margin: 0;
  padding-left: 1.25rem;
}

.synergies li {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* Smart Suggestions */
.smart-suggestions {
  background: var(--bg-tertiary);
  padding: 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 2px solid var(--border-primary);
}

.suggestions-header {
  margin-bottom: 1.5rem;
}

.smart-suggestions h3 {
  color: var(--gold);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.suggestions-subtitle {
  color: var(--text-tertiary);
  font-size: 0.9375rem;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.suggestion-card {
  background: var(--bg-secondary);
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.suggestion-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.suggestion-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.suggestion-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-secondary);
  object-fit: contain;
  background: var(--bg-primary);
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.375rem;
}

.suggestion-reason {
  color: var(--text-tertiary);
  font-size: 0.75rem;
  line-height: 1.4;
}

.suggestion-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
}

.suggestion-cost {
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.suggestion-eff {
  font-weight: 600;
  font-size: 0.8125rem;
}

.btn-add-suggestion {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--gold);
  border: none;
  border-radius: var(--radius-md);
  color: var(--bg-primary);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-suggestion svg {
  width: 14px;
  height: 14px;
}

.btn-add-suggestion:not(:disabled):hover {
  background: rgb(220, 148, 21);
  transform: translateY(-1px);
}

.btn-add-suggestion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Meta Builds */
.meta-builds {
  background: var(--bg-tertiary);
  padding: 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 2px solid var(--border-primary);
}

.meta-builds h3 {
  color: var(--gold);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.meta-builds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.meta-build-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  transition: all 0.2s;
}

.meta-build-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.meta-build-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.meta-build-header h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.125rem;
}

.meta-build-role {
  background: var(--bg-tertiary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--gold);
  font-size: 0.75rem;
  font-weight: 600;
}

.meta-build-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-item-icon {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
  object-fit: contain;
  background: var(--bg-tertiary);
}

.meta-build-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.meta-eff {
  color: var(--gold);
}

.btn-load-build {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-load-build:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
}

/* Empty State */
.builds-empty-state {
  background: var(--bg-tertiary);
  padding: 4rem 2rem;
  border-radius: var(--radius-lg);
  text-align: center;
  border: 2px dashed var(--border-primary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--text-tertiary);
  opacity: 0.5;
  margin: 0 auto 1.5rem;
}

.builds-empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.builds-empty-state p {
  color: var(--text-tertiary);
  max-width: 500px;
  margin: 0 auto 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .builds-header {
    flex-direction: column;
    gap: 1rem;
  }

  .role-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .role-btn {
    justify-content: center;
  }

  .build-slots {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    flex-direction: column;
  }

  .analysis-row {
    grid-template-columns: 1fr;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .meta-builds-grid {
    grid-template-columns: 1fr;
  }
}

.gold {
  color: var(--gold);
  font-family: 'Monaco', 'Courier New', monospace;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.gold-icon,
.gold-icon-inline {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
  margin-right: 2px;
}
</style>
