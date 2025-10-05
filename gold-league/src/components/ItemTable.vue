<template>
  <div class="item-browser">
    <!-- Floating Comparison Tray -->
    <transition name="slide-up">
      <div v-if="selectedItems.length > 0" class="comparison-tray">
        <div class="tray-content">
          <div class="tray-header">
            <h3>
              <span class="compare-icon">⚔️</span>
              Selected for Comparison
              <span class="count-badge">{{ selectedItems.length }}/6</span>
            </h3>
            <button @click="clearSelection" class="btn-clear-inline" title="Clear all">
              <span>✕</span>
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
              <button @click.stop="toggleSelect(item)" class="btn-remove-item">✕</button>
            </div>
          </div>
          
          <div class="tray-actions">
            <button 
              @click="emit('compare', selectedItems)" 
              class="btn-compare-now"
              :disabled="selectedItems.length < 2"
            >
              <span class="btn-icon">📊</span>
              Compare {{ selectedItems.length }} Items
            </button>
            <div v-if="selectedItems.length < 2" class="help-text">
              Select at least 2 items to compare
            </div>
            <div v-else-if="selectedItems.length < 6" class="help-text">
              You can select up to {{ 6 - selectedItems.length }} more items
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Controls -->
    <div class="browser-controls">
      <div class="controls-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="search" 
            placeholder="Search items by name..." 
            class="search-input"
          />
          <button v-if="search" @click="search = ''" class="btn-clear-search">✕</button>
        </div>
        
        <div class="view-toggle">
          <button 
            @click="viewMode = 'grid'" 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            title="Grid view"
          >
            <span class="view-icon">▦</span>
          </button>
          <button 
            @click="viewMode = 'table'" 
            :class="['view-btn', { active: viewMode === 'table' }]"
            title="Table view"
          >
            <span class="view-icon">☰</span>
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

        <!-- Hover Tooltip -->
        <div class="card-tooltip" v-if="item.description">
          <div class="tooltip-content" v-html="sanitizeDescription(item.description)"></div>
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="page-info">
        <span class="results-count">{{ filtered.length }} items</span>
        <span class="page-current">Page {{ currentPage }} of {{ totalPages }}</span>
      </div>

      <div class="page-controls">
        <button @click="currentPage = 1" :disabled="currentPage === 1" class="page-btn">⟪</button>
        <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">‹</button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="page !== '...' && (currentPage = page)"
            :class="['page-number', { active: currentPage === page, ellipsis: page === '...' }]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">›</button>
        <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="page-btn">⟫</button>
      </div>

      <select v-model.number="itemsPerPage" class="per-page-select">
        <option :value="12">12 per page</option>
        <option :value="24">24 per page</option>
        <option :value="48">48 per page</option>
        <option :value="96">96 per page</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getItemImageUrl } from '../api/items'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['compare'])

// State
const failedImages = ref(new Set())
const search = ref('')
const sortKey = ref('goldEfficiency')
const sortDir = ref(-1)
const tierFilter = ref('all')
const selectedItems = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(24)
const selectingItemId = ref(null)
const viewMode = ref('grid')

const tierOptions = [
  { value: 'legendary', label: 'Legendary' },
  { value: 'epic', label: 'Epic' },
  { value: 'component', label: 'Components' },
  { value: 'basic', label: 'Basic' }
]

// Computed
const filtered = computed(() => {
  let result = props.items.filter(item => {
    if (failedImages.value.has(item.id)) return false
    
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
    
    return matchesSearch && matchesTier
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

const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage.value))

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  
  return pages
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filtered.value.slice(start, start + itemsPerPage.value)
})

// Methods
function sort(key) {
  if (sortKey.value === key) {
    sortDir.value *= -1
  } else {
    sortKey.value = key
    sortDir.value = -1
  }
  currentPage.value = 1
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
  
  if (!img.dataset.fallbackTried) {
    img.dataset.fallbackTried = 'true'
    if (itemId) {
      img.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/${itemId.toLowerCase()}.png`
      return
    }
  }
  
  if (img.dataset.fallbackTried && itemId) {
    failedImages.value.add(itemId)
    failedImages.value = new Set(failedImages.value)
  }
  
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%2327272a" width="64" height="64"/%3E%3C/svg%3E'
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

function sanitizeDescription(desc) {
  return desc
    .replace(/<br>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

// Watchers
watch([search, tierFilter], () => {
  currentPage.value = 1
})

watch(itemsPerPage, () => {
  const maxPage = Math.ceil(filtered.value.length / itemsPerPage.value)
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage || 1
  }
})
</script>

<style scoped>
.item-browser {
  width: 100%;
  position: relative;
  padding-bottom: 120px; /* Space for floating tray */
}

/* Floating Comparison Tray */
.comparison-tray {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.95) 0%, rgba(135, 64, 55, 0.95) 100%);
  backdrop-filter: blur(10px);
  border-top: 3px solid var(--gold);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  z-index: 100;
  padding: 1.5rem;
}

.tray-content {
  max-width: 1400px;
  margin: 0 auto;
}

.tray-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tray-header h3 {
  color: var(--bg-primary);
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.compare-icon {
  font-size: 1.5rem;
}

.count-badge {
  background: var(--bg-primary);
  color: var(--gold);
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-clear-inline {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-clear-inline:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: rotate(90deg);
}

.tray-items {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.tray-item {
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.tray-item-img {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.tray-item-info {
  flex: 1;
}

.tray-item-name {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.tray-item-eff {
  font-weight: 700;
  font-size: 0.875rem;
}

.btn-remove-item {
  background: rgba(239, 68, 68, 0.8);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-remove-item:hover {
  background: rgb(239, 68, 68);
  transform: scale(1.1);
}

.tray-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-compare-now {
  background: var(--bg-primary);
  color: var(--gold);
  border: 2px solid var(--bg-primary);
  padding: 0.75rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-compare-now:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.btn-compare-now:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.25rem;
}

.help-text {
  color: rgba(0, 0, 0, 0.7);
  font-size: 0.875rem;
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
  font-size: 1.25rem;
  margin-right: 0.75rem;
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
  font-size: 1.25rem;
  padding: 0.25rem;
  transition: all 0.2s;
}

.btn-clear-search:hover {
  color: var(--text-primary);
  transform: rotate(90deg);
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
  font-size: 1.125rem;
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

/* Grid View */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.item-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
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
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.card-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-primary);
  border: 2px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: 1rem;
  width: 300px;
  max-width: 90vw;
  z-index: 50;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  margin-top: 0.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.item-card:hover .card-tooltip {
  opacity: 1;
}

.tooltip-content {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.5;
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
}

.items-table tbody tr:hover {
  background: var(--bg-tertiary);
}

.items-table tbody tr.selected {
  background: rgba(240, 168, 41, 0.1);
  border-left: 4px solid var(--gold);
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
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  flex-wrap: wrap;
}

.page-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.results-count {
  color: var(--text-primary);
  font-weight: 600;
}

.page-current {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.page-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page-btn, .page-number {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled),
.page-number:hover:not(.ellipsis):not(:disabled) {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-number.active {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
}

.page-number.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
  pointer-events: none;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.per-page-select {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.per-page-select:focus {
  outline: none;
  border-color: var(--gold);
}

/* Responsive */
@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
}
</style>
