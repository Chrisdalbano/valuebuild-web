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
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-bar {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(240, 168, 41, 0.1);
}

.filter-group {
  display: flex;
  gap: 0.625rem;
  align-items: center;
  color: var(--text-primary);
}

.filter-group label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.filter-select, .cost-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.8125rem;
  transition: all 0.2s ease;
}

.filter-select:focus, .cost-input:focus {
  outline: none;
  border-color: var(--gold);
}

.cost-input {
  width: 90px;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.8125rem;
}

.btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--border-secondary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--gold);
  color: var(--bg-primary);
  border-color: var(--gold);
}

.btn-primary:hover:not(:disabled) {
  background: rgb(220, 148, 21);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--rust);
  color: var(--text-primary);
  border-color: var(--rust);
}

.btn-secondary:hover {
  background: rgb(155, 84, 75);
}

.compare-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-tertiary);
}

.items-table thead {
  background: var(--bg-secondary);
  position: sticky;
  top: 0;
  border-bottom: 1px solid var(--border-primary);
}

.items-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.items-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
}

.items-table th.sortable:hover {
  color: var(--gold);
}

.items-table tbody tr {
  border-bottom: 1px solid var(--border-primary);
  transition: background 0.2s ease;
}

.items-table tbody tr:hover {
  background: var(--bg-hover);
  cursor: pointer;
}

.items-table tbody tr:last-child {
  border-bottom: none;
}

.items-table td {
  padding: 0.875rem 1rem;
  color: var(--text-primary);
  font-size: 0.875rem;
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
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
}

.item-tooltip {
  display: none;
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
  min-width: 300px;
  max-width: 400px;
  z-index: 1000;
  box-shadow: var(--shadow-xl);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.5;
  font-weight: normal;
  pointer-events: none;
}

.item-tooltip::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid var(--border-secondary);
}

.cost, .gold-value {
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 600;
  color: var(--gold);
  font-size: 0.875rem;
}

.eff-excellent { color: var(--success); font-weight: 700; }
.eff-good { color: var(--info); font-weight: 600; }
.eff-fair { color: var(--warning); font-weight: 600; }
.eff-poor { color: var(--error); font-weight: 600; }

.rating-excellent { color: var(--success); }
.rating-good { color: var(--info); }
.rating-fair { color: var(--warning); }
.rating-poor { color: var(--error); }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.page-info {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
}

.per-page-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    width: 100%;
  }
}
</style>

