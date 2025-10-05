<template>
  <div class="item-table-container">
    <div class="controls">
      <div class="search-bar">
        <input 
          v-model="search" 
          placeholder="🔍 Search items..." 
          class="search-input"
        />
      </div>
      
      <div class="filter-group">
        <label>Filter by efficiency:</label>
        <select v-model="efficiencyFilter" class="filter-select">
          <option value="all">All Items</option>
          <option value="excellent">Excellent (≥120%)</option>
          <option value="good">Good (≥100%)</option>
          <option value="fair">Fair (≥80%)</option>
          <option value="poor">Poor (&lt;80%)</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Min Cost:</label>
        <input 
          v-model.number="minCost" 
          type="number" 
          placeholder="0"
          class="cost-input"
        />
        <label>Max Cost:</label>
        <input 
          v-model.number="maxCost" 
          type="number" 
          placeholder="10000"
          class="cost-input"
        />
      </div>

      <div class="compare-controls">
        <button @click="emit('compare', selectedItems)" class="btn btn-primary" :disabled="selectedItems.length !== 2">
          Compare Selected ({{ selectedItems.length }}/2)
        </button>
        <button v-if="selectedItems.length > 0" @click="clearSelection" class="btn btn-secondary">
          Clear Selection
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="items-table">
        <thead>
          <tr>
            <th><input type="checkbox" @change="selectAll" /></th>
            <th @click="sort('name')" class="sortable">
              Item {{ getSortIcon('name') }}
            </th>
            <th @click="sort('goldEfficiency')" class="sortable">
              Gold Efficiency {{ getSortIcon('goldEfficiency') }}
            </th>
            <th @click="sort('cost')" class="sortable">
              Cost {{ getSortIcon('cost') }}
            </th>
            <th>Gold Value</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedItems" :key="item.id" @click="toggleSelect(item)">
            <td>
              <input 
                type="checkbox" 
                :checked="isSelected(item)"
                @click.stop="toggleSelect(item)"
              />
            </td>
            <td class="item-name">
              <div class="item-info">
                <img 
                  :src="getImageUrl(item.id)" 
                  :alt="item.name"
                  class="item-icon"
                  @error="handleImageError"
                />
                <span>{{ item.name }}</span>
                <div v-if="item.description" class="item-tooltip" v-html="sanitizeDescription(item.description)"></div>
              </div>
            </td>
            <td :class="getEfficiencyClass(item.goldEfficiency)">
              {{ item.goldEfficiency }}%
            </td>
            <td class="cost">{{ item.cost }}g</td>
            <td class="gold-value">{{ item.totalGoldValue }}g</td>
            <td :class="getRatingClass(item.goldEfficiency)">
              {{ getEfficiencyRating(item.goldEfficiency) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn">Previous</button>
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn">Next</button>
      <select v-model.number="itemsPerPage" class="per-page-select">
        <option :value="10">10 per page</option>
        <option :value="25">25 per page</option>
        <option :value="50">50 per page</option>
        <option :value="100">100 per page</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getItemImageUrl } from '../api/items'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['compare'])

const search = ref('')
const sortKey = ref('goldEfficiency')
const sortDir = ref(-1)
const efficiencyFilter = ref('all')
const minCost = ref(0)
const maxCost = ref(10000)
const selectedItems = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(25)

const filtered = computed(() => {
  let result = props.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.value.toLowerCase())
    const matchesCost = item.cost >= minCost.value && item.cost <= maxCost.value
    
    let matchesEfficiency = true
    if (efficiencyFilter.value !== 'all') {
      const eff = item.goldEfficiency
      switch(efficiencyFilter.value) {
        case 'excellent': matchesEfficiency = eff >= 120; break
        case 'good': matchesEfficiency = eff >= 100 && eff < 120; break
        case 'fair': matchesEfficiency = eff >= 80 && eff < 100; break
        case 'poor': matchesEfficiency = eff < 80; break
      }
    }
    
    return matchesSearch && matchesCost && matchesEfficiency
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

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.value.slice(start, end)
})

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

function getImageUrl(itemId) {
  return getItemImageUrl(itemId)
}

function handleImageError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23ddd" width="40" height="40"/%3E%3C/svg%3E'
}

function toggleSelect(item) {
  const index = selectedItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else if (selectedItems.value.length < 2) {
    selectedItems.value.push(item)
  }
}

function isSelected(item) {
  return selectedItems.value.some(i => i.id === item.id)
}

function selectAll(e) {
  if (e.target.checked) {
    selectedItems.value = paginatedItems.value.slice(0, 2)
  } else {
    selectedItems.value = []
  }
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function clearSelection() {
  selectedItems.value = []
}

function sanitizeDescription(desc) {
  // Remove HTML tags and clean up the description
  return desc
    .replace(/<br>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}
</script>

<style scoped>
.item-table-container {
  width: 100%;
  padding: 20px;
  background: #1a1a2e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-bar {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #0f3460;
  border-radius: 8px;
  background: #16213e;
  color: #e94560;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.1);
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #fff;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
}

.filter-select, .cost-input {
  padding: 10px;
  border: 2px solid #0f3460;
  border-radius: 6px;
  background: #16213e;
  color: #e94560;
  font-size: 14px;
}

.cost-input {
  width: 100px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: #0f3460;
  color: #fff;
}

.btn:hover:not(:disabled) {
  background: #16213e;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
}

.btn-secondary {
  background: #0f3460;
  color: #fff;
}

.btn-secondary:hover {
  background: #e94560;
}

.compare-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  background: #16213e;
}

.items-table thead {
  background: #0f3460;
  position: sticky;
  top: 0;
}

.items-table th {
  padding: 15px;
  text-align: left;
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
}

.items-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.items-table th.sortable:hover {
  background: #1a4d7a;
}

.items-table tbody tr {
  border-bottom: 1px solid #0f3460;
  transition: all 0.2s;
}

.items-table tbody tr:hover {
  background: #1a1a2e;
  cursor: pointer;
}

.items-table td {
  padding: 12px 15px;
  color: #fff;
}

.item-name {
  font-weight: 500;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.item-info:hover .item-tooltip {
  display: block;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid #0f3460;
}

.item-tooltip {
  display: none;
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #e94560;
  border-radius: 8px;
  padding: 15px;
  min-width: 300px;
  max-width: 400px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  color: #ddd;
  font-size: 13px;
  line-height: 1.6;
  font-weight: normal;
  pointer-events: none;
}

.item-tooltip::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid #e94560;
}

.cost, .gold-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #ffd700;
}

.eff-excellent { color: #4ade80; font-weight: 700; }
.eff-good { color: #60a5fa; font-weight: 600; }
.eff-fair { color: #fbbf24; font-weight: 500; }
.eff-poor { color: #f87171; font-weight: 500; }

.rating-excellent { color: #4ade80; }
.rating-good { color: #60a5fa; }
.rating-fair { color: #fbbf24; }
.rating-poor { color: #f87171; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.page-info {
  color: #fff;
  font-weight: 500;
}

.per-page-select {
  padding: 8px 12px;
  border: 2px solid #0f3460;
  border-radius: 6px;
  background: #16213e;
  color: #e94560;
}
</style>

