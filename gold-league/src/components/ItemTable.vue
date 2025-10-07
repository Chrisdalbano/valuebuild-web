<template>
  <div class="item-browser">
    <!-- Floating Comparison Tray -->
    <transition name="slide-up">
      <div v-if="selectedItems.length > 0" class="comparison-tray">
        <div class="tray-content">
          <div class="tray-header">
            <h3>
              <svg class="compare-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
              Selected for Comparison
              <span class="count-badge">{{ selectedItems.length }}/6</span>
            </h3>
            <button @click="clearSelection" class="btn-clear-inline" title="Clear all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="tray-items">
            <div v-for="item in selectedItems" :key="item.id" class="tray-item">
              <img :src="getImageUrl(item.id)" :alt="item.name" class="tray-item-img" />
              <div class="tray-item-info">
                <div class="tray-item-name">{{ item.name }}</div>
                <div class="tray-item-eff" :class="getEfficiencyClass(item.goldEfficiency)">
                  {{ item.goldEfficiency }}%
                </div>
              </div>
              <button @click.stop="toggleSelect(item)" class="btn-remove-item" title="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="tray-actions">
            <button 
              @click="emit('addToBuild', selectedItems)" 
              class="btn-add-to-build"
              :disabled="selectedItems.length === 0"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add to Build
            </button>
            <button 
              @click="emit('compare', selectedItems)" 
              class="btn-compare-now"
              :disabled="selectedItems.length < 2"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Compare
            </button>
          </div>
          <div v-if="selectedItems.length < 2" class="help-text">
            Select items to add to build or compare
          </div>
          <div v-else-if="selectedItems.length < 6" class="help-text">
            You can select up to {{ 6 - selectedItems.length }} more items
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Controls -->
    <div class="browser-controls">
      <div class="controls-row">
        <div class="search-box-container">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              v-model="search" 
              placeholder="Search items by name or stats (e.g., 'AD', 'crit', 'armor')..." 
              class="search-input"
              @focus="showSearchSuggestions = true"
              @blur="() => setTimeout(() => showSearchSuggestions = false, 200)"
            />
            <button v-if="search" @click="search = ''" class="btn-clear-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Smart Search Suggestions -->
          <div v-if="showSearchSuggestions && search.length > 0 && searchSuggestions.length > 0" class="search-suggestions">
            <div class="suggestions-header">Smart Suggestions</div>
            <button 
              v-for="suggestion in searchSuggestions.slice(0, 5)" 
              :key="suggestion.id"
              @click="applySearchSuggestion(suggestion)"
              class="suggestion-item"
            >
              <img :src="getImageUrl(suggestion.id)" :alt="suggestion.name" class="suggestion-img" />
              <div class="suggestion-info">
                <div class="suggestion-name">{{ suggestion.name }}</div>
                <div class="suggestion-meta">
                  <span class="suggestion-eff" :class="getEfficiencyClass(suggestion.goldEfficiency)">
                    {{ suggestion.goldEfficiency }}%
                  </span>
                  <span class="suggestion-stats">{{ getSuggestionStats(suggestion) }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div class="view-toggle">
          <button 
            @click="viewMode = 'grid'" 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            title="Grid view"
          >
            <svg class="view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button 
            @click="viewMode = 'table'" 
            :class="['view-btn', { active: viewMode === 'table' }]"
            title="Table view"
          >
            <svg class="view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="filters-row">
        <div class="filter-chip-group">
          <button 
            v-for="tier in tierOptions" 
            :key="tier.value"
            @click="tierFilter = tierFilter === tier.value ? 'all' : tier.value"
            :class="['filter-chip', { active: tierFilter === tier.value }]"
          >
            {{ tier.label }}
          </button>
        </div>

        <select v-model="sortKey" class="sort-select">
          <option value="goldEfficiency">Sort: Efficiency</option>
          <option value="cost">Sort: Cost</option>
          <option value="name">Sort: Name</option>
          <option value="totalGoldValue">Sort: Gold Value</option>
        </select>

        <button @click="sortDir *= -1" class="btn-sort-dir" title="Toggle sort direction">
          {{ sortDir === 1 ? '↑' : '↓' }}
        </button>
      </div>
      
      <!-- Role Filters -->
      <div class="role-filters-row">
        <div class="role-filter-label">Filter by Role:</div>
        <div class="role-filter-buttons">
          <button 
            v-for="role in roleOptions" 
            :key="role.value"
            @click="roleFilter = role.value"
            :class="['role-filter-btn', { active: roleFilter === role.value }]"
            :title="role.label"
          >
            <img :src="role.icon" :alt="role.label" class="role-filter-icon" @error="(e) => e.target.style.display = 'none'" />
            <span class="role-filter-label-text">{{ role.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="items-grid">
      <div 
        v-for="item in paginatedItems" 
        :key="item.id"
        @click="toggleSelect(item)"
        :class="['item-card', { 
          selected: isSelected(item),
          'selecting': selectingItemId === item.id 
        }]"
      >
        <div class="card-header">
          <img :src="getImageUrl(item.id)" :alt="item.name" class="card-img" @error="handleImageError" />
          <div class="card-checkbox">
            <input 
              type="checkbox" 
              :checked="isSelected(item)"
              @click.stop="toggleSelect(item)"
              class="checkbox-input"
            />
          </div>
          <div class="card-badge" :class="getItemBadgeType(item)">
            {{ getItemTierLabel(item) }}
          </div>
        </div>

        <div class="card-body">
          <h4 class="card-title">{{ item.name }}</h4>
          
          <div class="card-stats">
            <div class="stat-main">
              <span class="stat-label">Efficiency</span>
              <span class="stat-value" :class="getEfficiencyClass(item.goldEfficiency)">
                {{ item.goldEfficiency }}%
              </span>
            </div>
            
            <div class="stat-row">
              <span class="stat-label">Cost</span>
              <span class="stat-value gold">{{ item.cost }}g</span>
            </div>
            
            <div class="stat-row">
              <span class="stat-label">Value</span>
              <span class="stat-value gold">{{ item.totalGoldValue }}g</span>
            </div>
          </div>

          <div class="card-rating" :class="getRatingClass(item.goldEfficiency)">
            {{ getEfficiencyRating(item.goldEfficiency) }}
          </div>
        </div>

        <!-- Enhanced Hover Tooltip -->
        <div class="item-hover-tooltip">
          <div class="tooltip-header">
            <img :src="getImageUrl(item.id)" :alt="item.name" class="tooltip-icon" @error="handleImageError" />
            <div class="tooltip-title">
              <h4>{{ item.name }}</h4>
            </div>
          </div>

          <div v-if="item.statBreakdown && Object.keys(item.statBreakdown).length > 0" class="tooltip-breakdown">
            <div class="tooltip-section-title">Stats</div>
            <div class="tooltip-stats-list">
              <div v-for="(stat, key) in item.statBreakdown" :key="key" class="tooltip-stat-item">
                <span class="stat-name">{{ formatStatName(key) }}</span>
                <span class="stat-amount">{{ formatStatValue(key, stat.amount) }}</span>
              </div>
            </div>
          </div>

          <div v-if="item.description" class="tooltip-description">
            <div class="tooltip-section-title">Effects</div>
            <div class="tooltip-desc-text">{{ sanitizeDescription(item.description) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="items-table-wrapper">
      <table class="items-table">
        <thead>
          <tr>
            <th class="th-checkbox"></th>
            <th class="th-item">Item</th>
            <th @click="sort('goldEfficiency')" class="sortable th-efficiency">
              Efficiency {{ getSortIcon('goldEfficiency') }}
            </th>
            <th @click="sort('cost')" class="sortable th-cost">
              Cost {{ getSortIcon('cost') }}
            </th>
            <th class="th-value">Value</th>
            <th class="th-rating">Rating</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in paginatedItems" 
            :key="item.id"
            @click="toggleSelect(item)"
            :class="{ 
              selected: isSelected(item),
              selecting: selectingItemId === item.id 
            }"
            class="table-row-with-tooltip"
          >
            <td class="td-checkbox">
              <input 
                type="checkbox" 
                :checked="isSelected(item)"
                @click.stop="toggleSelect(item)"
                class="checkbox-input"
              />
            </td>
            <td class="td-item">
              <div class="item-info">
                <img :src="getImageUrl(item.id)" :alt="item.id" class="item-icon" @error="handleImageError" />
                <div class="item-details">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-tier-label">{{ getItemTierLabel(item) }}</span>
                </div>
              </div>
            </td>
            <td class="td-efficiency" :class="getEfficiencyClass(item.goldEfficiency)">
              {{ item.goldEfficiency }}%
            </td>
            <td class="td-cost gold">{{ item.cost }}g</td>
            <td class="td-value gold">{{ item.totalGoldValue }}g</td>
            <td class="td-rating" :class="getRatingClass(item.goldEfficiency)">
              {{ getEfficiencyRating(item.goldEfficiency) }}
              
              <!-- Table Row Tooltip -->
              <div class="table-row-tooltip">
                <div class="tooltip-header">
                  <img :src="getImageUrl(item.id)" :alt="item.name" class="tooltip-icon" @error="handleImageError" />
                  <div class="tooltip-title">
                    <h4>{{ item.name }}</h4>
                  </div>
                </div>

                <div v-if="item.statBreakdown && Object.keys(item.statBreakdown).length > 0" class="tooltip-breakdown">
                  <div class="tooltip-section-title">Stats</div>
                  <div class="tooltip-stats-list">
                    <div v-for="(stat, key) in item.statBreakdown" :key="key" class="tooltip-stat-item">
                      <span class="stat-name">{{ formatStatName(key) }}</span>
                      <span class="stat-amount">{{ formatStatValue(key, stat.amount) }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="item.description" class="tooltip-description">
                  <div class="tooltip-section-title">Effects</div>
                  <div class="tooltip-desc-text">{{ sanitizeDescription(item.description) }}</div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Simple Pagination -->
    <div class="pagination-simple">
      <div class="pagination-info">
        <span class="showing-count">
          Showing <strong>{{ Math.min(itemsPerPage, filtered.length) }}</strong> of <strong>{{ filtered.length }}</strong> items
        </span>
        <select v-model.number="itemsPerPage" class="show-select">
          <option :value="24">Show 24</option>
          <option :value="48">Show 48</option>
          <option :value="96">Show 96</option>
          <option :value="filtered.length">Show All</option>
        </select>
      </div>
      
      <button 
        v-if="hasMoreItems && itemsPerPage < filtered.length"
        @click="itemsPerPage += 24" 
        class="btn-load-more"
      >
        <svg class="load-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
        Load {{ Math.min(24, remainingItems) }} More
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { getItemImageUrl, getValidatedItemImageUrl, formatStatName, formatStatValue } from '../api/items'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['compare', 'addToBuild'])

// State
const failedImages = ref(new Set())
const search = ref('')
const sortKey = ref('goldEfficiency')
const sortDir = ref(-1)
const tierFilter = ref('all')
const roleFilter = ref('all')
const selectedItems = ref([])
const itemsPerPage = ref(24)
const selectingItemId = ref(null)
const viewMode = ref('grid')
const showSearchSuggestions = ref(false)
const isLoadingMore = ref(false)

const tierOptions = [
  { value: 'legendary', label: 'Legendary' },
  { value: 'epic', label: 'Epic' },
  { value: 'component', label: 'Components' },
  { value: 'basic', label: 'Basic' }
]

const roleOptions = [
  { value: 'all', label: 'All', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/star-outline-resting.png' },
  { value: 'marksman', label: 'Marksman', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-marksman.png' },
  { value: 'mage', label: 'Mage', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-mage.png' },
  { value: 'tank', label: 'Tank', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-tank.png' },
  { value: 'fighter', label: 'Fighter', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-fighter.png' },
  { value: 'assassin', label: 'Assassin', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-assassin.png' },
  { value: 'support', label: 'Support', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-support.png' }
]

// Computed
const filtered = computed(() => {
  let result = props.items.filter(item => {
    // CRITICAL: Filter out items with failed images immediately
    if (failedImages.value.has(item.id)) return false
    
    // Filter out items without valid IDs or images upfront
    if (!item.id || typeof item.id !== 'string') return false
    
    const matchesSearch = item.name.toLowerCase().includes(search.value.toLowerCase())
    
    let matchesTier = true
    if (tierFilter.value !== 'all') {
      if (tierFilter.value === 'legendary') {
        matchesTier = item.cost >= 2500 && (!item.into || item.into.length === 0)
      } else if (tierFilter.value === 'epic') {
        matchesTier = item.cost >= 1200 && item.cost < 2500
      } else if (tierFilter.value === 'component') {
        matchesTier = item.into && item.into.length > 0 && item.cost < 1200
      } else if (tierFilter.value === 'basic') {
        matchesTier = item.cost < 500
      }
    }
    
    // Role filtering based on stats
    let matchesRole = true
    if (roleFilter.value !== 'all' && item.statBreakdown) {
      const stats = item.statBreakdown
      switch (roleFilter.value) {
        case 'marksman':
          matchesRole = stats.FlatPhysicalDamageMod || stats.FlatCritChanceMod || stats.PercentAttackSpeedMod
          break
        case 'mage':
          matchesRole = stats.FlatMagicDamageMod || stats.FlatMPPoolMod
          break
        case 'tank':
          matchesRole = stats.FlatHPPoolMod || stats.FlatArmorMod || stats.FlatSpellBlockMod
          break
        case 'fighter':
          matchesRole = (stats.FlatPhysicalDamageMod || stats.PercentAttackSpeedMod) && (stats.FlatHPPoolMod || stats.FlatArmorMod)
          break
        case 'assassin':
          matchesRole = stats.FlatPhysicalDamageMod || stats.FlatMagicDamageMod
          break
        case 'support':
          matchesRole = stats.FlatHPPoolMod || stats.FlatMPPoolMod || stats.AbilityHaste
          break
        default:
          matchesRole = true
      }
    }
    
    return matchesSearch && matchesTier && matchesRole
  })

  return result.sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]
    
    if (typeof aVal === 'string') {
      return sortDir.value * aVal.localeCompare(bVal)
    }
    return sortDir.value * (aVal - bVal)
  })
})

const displayedItems = computed(() => {
  // Simple: just show first N items
  return filtered.value.slice(0, itemsPerPage.value)
})

const paginatedItems = computed(() => {
  return displayedItems.value
})

const hasMoreItems = computed(() => {
  return filtered.value.length > itemsPerPage.value
})

const remainingItems = computed(() => {
  return filtered.value.length - itemsPerPage.value
})

// Smart search suggestions
const searchSuggestions = computed(() => {
  if (!search.value || search.value.length < 2) return []
  
  const query = search.value.toLowerCase()
  const statKeywords = {
    'ad': 'FlatPhysicalDamageMod',
    'attack damage': 'FlatPhysicalDamageMod',
    'damage': 'FlatPhysicalDamageMod',
    'ap': 'FlatMagicDamageMod',
    'ability power': 'FlatMagicDamageMod',
    'magic damage': 'FlatMagicDamageMod',
    'armor': 'FlatArmorMod',
    'mr': 'FlatSpellBlockMod',
    'magic resist': 'FlatSpellBlockMod',
    'health': 'FlatHPPoolMod',
    'hp': 'FlatHPPoolMod',
    'mana': 'FlatMPPoolMod',
    'crit': 'FlatCritChanceMod',
    'critical': 'FlatCritChanceMod',
    'attack speed': 'PercentAttackSpeedMod',
    'as': 'PercentAttackSpeedMod',
    'movement speed': 'FlatMovementSpeedMod',
    'ms': 'FlatMovementSpeedMod',
    'speed': 'FlatMovementSpeedMod',
    'lifesteal': 'PercentLifeStealMod',
    'life steal': 'PercentLifeStealMod'
  }
  
  // Check if query matches a stat keyword
  let matchingStat = null
  for (const [keyword, stat] of Object.entries(statKeywords)) {
    if (query.includes(keyword)) {
      matchingStat = stat
      break
    }
  }
  
  // If searching by stat, find items with that stat
  if (matchingStat) {
    return props.items
      .filter(item => {
        if (failedImages.value.has(item.id)) return false
        if (!item.statBreakdown) return false
        return item.statBreakdown[matchingStat] && item.statBreakdown[matchingStat].amount > 0
      })
      .sort((a, b) => {
        const aAmount = a.statBreakdown[matchingStat]?.amount || 0
        const bAmount = b.statBreakdown[matchingStat]?.amount || 0
        return bAmount - aAmount
      })
      .slice(0, 10)
  }
  
  // Otherwise, search by name
  return props.items
    .filter(item => {
      if (failedImages.value.has(item.id)) return false
      return item.name.toLowerCase().includes(query)
    })
    .sort((a, b) => b.goldEfficiency - a.goldEfficiency)
    .slice(0, 10)
})

function getSuggestionStats(item) {
  if (!item.statBreakdown) return ''
  const stats = Object.keys(item.statBreakdown).slice(0, 2)
  return stats.map(key => formatStatName(key)).join(', ')
}

function applySearchSuggestion(item) {
  search.value = item.name
  showSearchSuggestions.value = false
}

// Methods
function sort(key) {
  if (sortKey.value === key) {
    sortDir.value *= -1
  } else {
    sortKey.value = key
    sortDir.value = -1
  }
  // Reset display to initial items when sorting
  itemsPerPage.value = 24
}

function getSortIcon(key) {
  if (sortKey.value !== key) return '⇅'
  return sortDir.value === 1 ? '↑' : '↓'
}

function getEfficiencyClass(eff) {
  if (eff >= 120) return 'eff-excellent'
  if (eff >= 100) return 'eff-good'
  if (eff >= 80) return 'eff-fair'
  return 'eff-poor'
}

function getRatingClass(eff) {
  if (eff >= 120) return 'rating-excellent'
  if (eff >= 100) return 'rating-good'
  if (eff >= 80) return 'rating-fair'
  return 'rating-poor'
}

function getEfficiencyRating(eff) {
  if (eff >= 120) return 'Excellent'
  if (eff >= 100) return 'Good'
  if (eff >= 80) return 'Fair'
  return 'Poor'
}

function getItemBadgeType(item) {
  if (item.cost >= 2500) return 'legendary'
  if (item.cost >= 1200) return 'epic'
  if (item.into && item.into.length > 0) return 'component'
  return 'basic'
}

function getItemTierLabel(item) {
  if (item.cost >= 2500) return 'Legendary'
  if (item.cost >= 1200) return 'Epic'
  if (item.into && item.into.length > 0) return 'Component'
  return 'Basic'
}

function getImageUrl(itemId) {
  return getItemImageUrl(itemId)
}

function handleImageError(e) {
  const img = e.target
  const itemId = img.alt
  
  // Immediately hide the parent card to prevent flash of broken image
  const card = img.closest('.item-card') || img.closest('tr')
  if (card) {
    card.style.display = 'none'
  }
  
  // Try Community Dragon as fallback
  if (!img.dataset.fallbackTried) {
    img.dataset.fallbackTried = 'true'
    if (itemId) {
      img.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/${itemId.toLowerCase()}.png`
      
      // If fallback succeeds, show the card again
      img.onload = () => {
        if (card) card.style.display = ''
      }
      return
    }
  }
  
  // If both sources failed, permanently mark this item as deprecated
  if (img.dataset.fallbackTried && itemId) {
    if (!failedImages.value.has(itemId)) {
      failedImages.value.add(itemId)
      // Force reactivity update to trigger re-filter
      failedImages.value = new Set(failedImages.value)
      console.log(`[Filtered] Item ${itemId} - deprecated/not found`)
    }
  }
}

function toggleSelect(item) {
  selectingItemId.value = item.id
  setTimeout(() => selectingItemId.value = null, 400)
  
  const index = selectedItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else if (selectedItems.value.length < 6) {
    selectedItems.value.push(item)
  }
}

function isSelected(item) {
  return selectedItems.value.some(i => i.id === item.id)
}

function clearSelection() {
  selectedItems.value = []
}

// Infinite scroll handler
function handleScroll() {
  if (isLoadingMore.value) return
  
  const scrollPosition = window.scrollY + window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const threshold = 300 // pixels from bottom to trigger load
  
  if (scrollPosition >= documentHeight - threshold && hasMoreItems.value) {
    isLoadingMore.value = true
    // Load 24 more items
    setTimeout(() => {
      itemsPerPage.value += 24
      isLoadingMore.value = false
    }, 100)
  }
}

// Set up infinite scroll
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Reset pagination when filters change
watch([search, tierFilter, roleFilter, sortKey], () => {
  itemsPerPage.value = 24
})

function sanitizeDescription(desc) {
  return desc
    .replace(/<br>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

// Watchers
watch([search, tierFilter], () => {
  // Reset to show initial items when filters change
  itemsPerPage.value = 24
})

watch(itemsPerPage, () => {
  // Ensure we don't show more than available
  if (itemsPerPage.value > filtered.value.length) {
    itemsPerPage.value = filtered.value.length
  }
})
</script>

<style scoped>
.item-browser {
  width: 100%;
  position: relative;
  padding-bottom: 90px; /* Space for floating tray */
}

/* Floating Comparison Tray */
.comparison-tray {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary), 0.99;
  backdrop-filter: blur(10px);
  border-top: 2px solid var(--gold);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3), 0 -1px 0 rgba(240, 168, 41, 0.2);
  z-index: 100;
  padding: 1rem 1.5rem;
  
}

.tray-content {
  max-width: 1400px;
  margin: 0 auto;
}

.tray-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
}

.tray-header h3 {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.compare-icon {
  width: 18px;
  height: 18px;
  color: var(--gold);
  flex-shrink: 0;
}

.count-badge {
  background: var(--bg-primary);
  color: var(--gold);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.btn-clear-inline {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.btn-clear-inline svg {
  width: 14px;
  height: 14px;
}

.btn-clear-inline:hover {
  background: var(--error);
  border-color: var(--error);
  color: white;
  transform: rotate(90deg);
}

.tray-items {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
  margin-bottom: 0.5rem;
  scrollbar-width: thin;
}

.tray-items::-webkit-scrollbar {
  height: 6px;
}

.tray-items::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.tray-items::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 3px;
}

.tray-items::-webkit-scrollbar-thumb:hover {
  background: var(--gold);
}

.tray-item {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 180px;
  position: relative;
  border: 1px solid var(--border-primary);
  transition: all 0.2s;
}

.tray-item:hover {
  border-color: var(--gold);
  background: var(--bg-hover);
}

.tray-item-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
  object-fit: contain;
  background: var(--bg-secondary);
}

.tray-item-info {
  flex: 1;
  min-width: 0;
}

.tray-item-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tray-item-eff {
  font-weight: 700;
  font-size: 0.75rem;
}

.btn-remove-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  color: var(--text-tertiary);
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-remove-item svg {
  width: 12px;
  height: 12px;
}

.btn-remove-item:hover {
  background: var(--error);
  border-color: var(--error);
  color: white;
  transform: scale(1.1);
}

.tray-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-compare-now {
  background: var(--gold);
  color: var(--bg-primary);
  border: 1px solid var(--gold);
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-compare-now:not(:disabled):hover {
  background: rgb(220, 148, 21);
  border-color: rgb(220, 148, 21);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(240, 168, 41, 0.3);
}

.btn-compare-now:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add-to-build {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add-to-build:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--gold);
  color: var(--gold);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(240, 168, 41, 0.2);
}

.btn-add-to-build:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.help-text {
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 500;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Main Controls */
.browser-controls {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-primary);
}

.controls-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 0 1rem;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(240, 168, 41, 0.1);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.875rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.btn-clear-search {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear-search svg {
  width: 16px;
  height: 16px;
}

.btn-clear-search:hover {
  color: var(--text-primary);
}

.btn-clear-search:hover svg {
  transform: rotate(90deg);
}

.search-box-container {
  flex: 1;
  position: relative;
}

/* Search Suggestions Dropdown */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg-secondary);
  border: 2px solid var(--gold);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.suggestions-header {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gold);
  border-bottom: 1px solid var(--border-primary);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid var(--border-primary);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--bg-tertiary);
}

.suggestion-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 2px solid var(--gold);
  object-fit: contain;
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.suggestion-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.suggestion-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.suggestion-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8125rem;
}

.suggestion-eff {
  font-weight: 600;
}

.suggestion-stats {
  color: var(--text-tertiary);
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  padding: 0.375rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.view-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-icon {
  width: 18px;
  height: 18px;
}

.view-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.view-btn.active {
  background: var(--gold);
  color: var(--bg-primary);
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-chip-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.filter-chip {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: var(--gold);
  color: var(--text-primary);
}

.filter-chip.active {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
  font-weight: 600;
}

.sort-select {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.sort-select:focus {
  outline: none;
  border-color: var(--gold);
}

.btn-sort-dir {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sort-dir:hover {
  border-color: var(--gold);
  background: var(--gold);
  color: var(--bg-primary);
  transform: rotate(180deg);
}

/* Role Filters */
.role-filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

.role-filter-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.role-filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.role-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  color: var(--text-secondary);
  padding: 0.625rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.role-filter-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.7;
}

.role-filter-btn:hover {
  border-color: var(--gold);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.role-filter-btn:hover .role-filter-icon {
  opacity: 1;
}

.role-filter-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
  font-weight: 600;
}

.role-filter-btn.active .role-filter-icon {
  filter: brightness(0) invert(0);
  opacity: 1;
}

.role-filter-label-text {
  white-space: nowrap;
}

/* Grid View */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
}

.item-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: visible;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  border-color: var(--gold);
}

.item-card.selected {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.1), rgba(135, 64, 55, 0.1));
  box-shadow: 0 0 20px rgba(240, 168, 41, 0.3), inset 0 0 20px rgba(240, 168, 41, 0.1);
}

.item-card.selecting {
  animation: selectPulse 0.4s ease;
}

@keyframes selectPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.card-header {
  position: relative;
  aspect-ratio: 1;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid var(--border-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.card-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  transition: transform 0.3s;
}

.item-card:hover .card-img {
  transform: scale(1.1);
}

.card-checkbox {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
}

.checkbox-input {
  width: 24px;
  height: 24px;
  cursor: pointer;
  appearance: none;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.checkbox-input:checked {
  background: var(--gold);
  border-color: var(--gold);
}

.checkbox-input:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--bg-primary);
  font-weight: bold;
  font-size: 16px;
}

.card-badge {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-badge.legendary {
  background: rgba(240, 168, 41, 0.9);
  color: var(--bg-primary);
}

.card-badge.epic {
  background: rgba(168, 85, 247, 0.9);
  color: white;
}

.card-badge.component {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

.card-badge.basic {
  background: rgba(100, 100, 108, 0.9);
  color: white;
}

.card-body {
  padding: 1rem;
}

.card-title {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  min-height: 2.6em;
}

.card-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stat-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.stat-label {
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-value {
  font-weight: 700;
  font-size: 0.875rem;
}

.stat-main .stat-value {
  font-size: 1.125rem;
}

.card-rating {
  text-align: center;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.item-hover-tooltip {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(10px, 0);
  background: var(--bg-primary);
  border: 2px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: 1rem;
  width: 320px;
  max-width: 90vw;
  z-index: 99999 !important;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0s linear 0.15s;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(240, 168, 41, 0.3);
  display: block !important;
}

.item-card {
  position: relative;
}

.item-card:hover .item-hover-tooltip {
  opacity: 1 !important;
  visibility: visible !important;
  transition: opacity 0.15s ease;
  display: block !important;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
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
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.tooltip-tier {
  color: var(--gold);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
}

.tooltip-label {
  color: var(--text-tertiary);
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tooltip-value {
  color: var(--text-primary);
  font-size: 0.9375rem;
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
  margin-bottom: 0.625rem;
}

.tooltip-stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  background: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.tooltip-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.tooltip-stat-item .stat-name {
  color: var(--text-secondary);
  font-weight: 500;
}

.tooltip-stat-item .stat-amount {
  color: var(--gold);
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.tooltip-description {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-primary);
}

.tooltip-desc-text {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.6;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.tooltip-desc-text::-webkit-scrollbar {
  width: 4px;
}

.tooltip-desc-text::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 2px;
}

.tooltip-desc-text::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 2px;
}

.tooltip-desc-text::-webkit-scrollbar-thumb:hover {
  background: var(--gold);
}

/* Table View */
.items-table-wrapper {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  margin-bottom: 2rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table thead {
  background: var(--bg-tertiary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.items-table th {
  padding: 1rem;
  text-align: left;
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--border-primary);
}

.items-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.items-table th.sortable:hover {
  color: var(--gold);
}

.items-table tbody tr {
  border-bottom: 1px solid var(--border-primary);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.items-table tbody tr:hover {
  background: var(--bg-tertiary);
}

.items-table tbody tr.selected {
  background: rgba(240, 168, 41, 0.1);
  border-left: 4px solid var(--gold);
}

/* Table Row Tooltip */
.table-row-tooltip {
  position: absolute;
  top: -1rem;
  right: 100%;
  margin-right: 1rem;
  transform: translateX(0);
  background: var(--bg-primary);
  border: 2px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: 1rem;
  width: 320px;
  max-width: 90vw;
  z-index: 99999 !important;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0s linear 0.15s;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(240, 168, 41, 0.3);
  display: block !important;
}

.td-rating {
  position: relative;
}

.table-row-with-tooltip:hover .table-row-tooltip {
  opacity: 1 !important;
  visibility: visible !important;
  transition: opacity 0.15s ease;
  display: block !important;
}

.items-table td {
  padding: 1rem;
  color: var(--text-primary);
}

.td-checkbox {
  width: 50px;
  text-align: center;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 600;
}

.item-tier-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.td-efficiency, .td-cost, .td-value, .td-rating {
  font-weight: 600;
}

.th-efficiency, .td-efficiency { text-align: center; width: 150px; }
.th-cost, .td-cost { text-align: right; width: 120px; }
.th-value, .td-value { text-align: right; width: 120px; }
.th-rating, .td-rating { text-align: center; width: 120px; }

/* Efficiency Colors */
.eff-excellent { color: #10b981; }
.eff-good { color: #3b82f6; }
.eff-fair { color: #f59e0b; }
.eff-poor { color: #ef4444; }

.rating-excellent { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
.rating-good { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
.rating-fair { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
.rating-poor { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

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

/* Simple Pagination */
.pagination-simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.showing-count {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.showing-count strong {
  color: var(--text-primary);
  font-weight: 600;
}

.show-select {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.show-select:hover {
  border-color: var(--gold);
}

.show-select:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(240, 168, 41, 0.1);
}

.btn-load-more {
  background: var(--gold);
  color: var(--bg-primary);
  border: 1px solid var(--gold);
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-load-more:hover {
  background: rgb(220, 148, 21);
  border-color: rgb(220, 148, 21);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(240, 168, 41, 0.3);
}

.load-icon {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  .comparison-tray {
    padding: 1rem;
  }
  
  .tray-items {
    flex-direction: column;
  }
  
  .tray-item {
    min-width: 100%;
  }
  
  .browser-controls {
    padding: 1rem;
  }
  
  .controls-row {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
  }
  
  .pagination-simple {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-load-more {
    width: 100%;
    justify-content: center;
  }
}
</style>
