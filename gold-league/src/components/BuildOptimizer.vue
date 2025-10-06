<template>
  <div class="builds-section">
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
        <button @click="$emit('browse-items')" class="btn-quick-action">
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { isItemDeprecated } from '../utils/deprecatedItems'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  compareItems: {
    type: Array,
    required: true
  },
  goldIconUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['browse-items'])

const currentBuild = defineModel('currentBuild', { type: Array, required: true })
const selectedRole = ref('all')

const roles = [
  { value: 'all', label: 'All', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-all.png' },
  { value: 'marksman', label: 'Marksman', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-marksman.png' },
  { value: 'mage', label: 'Mage', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-mage.png' },
  { value: 'tank', label: 'Tank', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-tank.png' },
  { value: 'fighter', label: 'Fighter', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-fighter.png' },
  { value: 'assassin', label: 'Assassin', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-assassin.png' },
  { value: 'support', label: 'Support', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-support.png' }
]

const metaBuildsTemplate = [
  { name: 'Crit ADC', role: 'Marksman', statPriority: ['FlatPhysicalDamageMod', 'FlatCritChanceMod', 'PercentAttackSpeedMod'] },
  { name: 'Burst Mage', role: 'Mage', statPriority: ['FlatMagicDamageMod', 'PercentCooldownMod'] },
  { name: 'Tank Vanguard', role: 'Tank', statPriority: ['FlatHPPoolMod', 'FlatArmorMod', 'FlatSpellBlockMod'] },
  { name: 'Bruiser Fighter', role: 'Fighter', statPriority: ['FlatPhysicalDamageMod', 'FlatHPPoolMod', 'PercentLifeStealMod'] },
  { name: 'Lethality Assassin', role: 'Assassin', statPriority: ['FlatPhysicalDamageMod', 'FlatArmorPenetrationMod'] },
  { name: 'Enchanter Support', role: 'Support', statPriority: ['FlatMPRegenMod', 'FlatHPRegenMod', 'PercentCooldownMod'] }
]

function addToBuild() {
  props.compareItems.forEach(item => {
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
  emit('browse-items')
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
  if (props.items.length === 0) return []
  
  let filtered = props.items.filter(item => {
    if (isItemDeprecated(item)) return false
    if (item.cost < 2000 || item.goldEfficiency < 85) return false
    if (currentBuild.value.some(i => i.id === item.id)) return false
    if (!item.id || !/^\d+$/.test(item.id.toString())) return false
    
    const hasStats = item.statBreakdown && Object.keys(item.statBreakdown).length > 0
    const hasEffects = item.description && item.description.length > 20
    if (!hasStats && !hasEffects) return false
    
    return true
  })
  
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
  
  const suggestions = filtered
    .sort((a, b) => b.goldEfficiency - a.goldEfficiency)
    .slice(0, 6)
  
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

const metaBuilds = computed(() => {
  if (props.items.length === 0) return []
  
  return metaBuildsTemplate.map(template => {
    const roleItems = props.items.filter(item => {
      if (isItemDeprecated(item)) return false
      if (item.cost < 2000 || item.goldEfficiency < 85) return false
      if (!item.id || !/^\d+$/.test(item.id.toString())) return false
      if (!item.statBreakdown || Object.keys(item.statBreakdown).length === 0) return false
      
      const stats = item.statBreakdown
      return template.statPriority.some(stat => stats[stat])
    })
    
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
  }).filter(build => build.items.length >= 4)
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
.builds-section {
  padding: 2rem;
}

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

.excellent { color: var(--success); }
.good { color: var(--info); }
.fair { color: var(--warning); }
.poor { color: var(--error); }
.positive { color: var(--success); }
.negative { color: var(--error); }

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
</style>

