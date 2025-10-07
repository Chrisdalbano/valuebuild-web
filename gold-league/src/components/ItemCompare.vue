<template>
  <div v-if="items.length >= 1" class="compare-container">
    <!-- Header -->
    <div class="compare-header">
      <div class="header-left">
        <h2>
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Item Comparison
        </h2>
        <span class="item-count">{{ items.length }} items selected</span>
      </div>
      <div class="header-actions">
        <button @click="emit('clear')" class="btn-clear">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          Clear All
        </button>
      </div>
    </div>

    <!-- Single Item View -->
    <div v-if="items.length === 1" class="single-item-view">
      <div class="single-item-message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="message-icon">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
        <h3>Add More Items to Compare</h3>
        <p>You need at least 2 items to see detailed comparisons, charts, and insights</p>
        <button @click="openSwapModal()" class="btn-add-first">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Another Item
        </button>
      </div>
    </div>

    <!-- Enhanced Quick Insights -->
    <div v-else class="insights-section">
      <div class="insights-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        Quick Insights
      </div>
      
      <div class="insights-grid">
        <!-- Winner Card -->
        <div class="insight-card winner">
          <div class="insight-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
            <span>Most Efficient</span>
          </div>
          <div class="insight-winner">
            <img :src="getImageUrl(bestEfficiency?.id)" :alt="bestEfficiency?.name" class="winner-icon" @error="handleImageError" />
            <div class="winner-info">
              <div class="winner-name">{{ bestEfficiency?.name }}</div>
              <div class="winner-eff" :class="getEfficiencyClass(bestEfficiency?.goldEfficiency)">
                {{ bestEfficiency?.goldEfficiency.toFixed(1) }}% Efficient
              </div>
              <div class="winner-stats">
                <span class="winner-stat">{{ bestEfficiency?.cost }}g cost</span>
                <span class="winner-stat">{{ bestEfficiency?.totalGoldValue }}g value</span>
              </div>
            </div>
          </div>
          <div class="insight-comparison">
            <span class="comparison-label">Beats next best by:</span>
            <span class="comparison-value" :class="getEfficiencyClass(efficiencyGap)">
              +{{ efficiencyGap.toFixed(1) }}%
            </span>
          </div>
        </div>

        <!-- Component Efficiency Card -->
        <div class="insight-card">
          <div class="insight-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Component Efficiency</span>
          </div>
          <div class="component-comparison">
            <div v-for="item in items" :key="item.id" class="component-item">
              <div class="component-name">{{ item.name.substring(0, 15) }}{{ item.name.length > 15 ? '...' : '' }}</div>
              <div class="component-bar">
                <div class="component-fill" :style="{ width: getComponentEfficiency(item) + '%' }"></div>
                <span class="component-value">{{ item.goldEfficiency.toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gold Analysis Card -->
        <div class="insight-card">
          <div class="insight-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>Gold Analysis</span>
          </div>
          <div class="gold-analysis">
            <div class="analysis-row">
              <span class="analysis-label">Total Investment</span>
              <span class="analysis-value gold">{{ totalCost }}g</span>
            </div>
            <div class="analysis-row">
              <span class="analysis-label">Total Stat Value</span>
              <span class="analysis-value gold">{{ totalValue }}g</span>
            </div>
            <div class="analysis-row highlight">
              <span class="analysis-label">Net Value Gain</span>
              <span class="analysis-value" :class="netGain >= 0 ? 'positive' : 'negative'">
                {{ netGain >= 0 ? '+' : '' }}{{ netGain }}g
              </span>
            </div>
            <div class="analysis-row">
              <span class="analysis-label">Average Cost/Item</span>
              <span class="analysis-value gold">{{ avgCost }}g</span>
            </div>
          </div>
        </div>

        <!-- Build Path Summary -->
        <div class="insight-card">
          <div class="insight-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>Build Complexity</span>
          </div>
          <div class="complexity-stats">
            <div class="complexity-item">
              <div class="complexity-number">{{ itemsWithComponents.length }}</div>
              <div class="complexity-label">Items with Components</div>
            </div>
            <div class="complexity-item">
              <div class="complexity-number">{{ totalComponents }}</div>
              <div class="complexity-label">Total Components</div>
            </div>
            <div class="complexity-item">
              <div class="complexity-number">{{ avgBuildCost }}g</div>
              <div class="complexity-label">Avg Build Cost</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Gold Efficiency Comparison</h3>
          <span class="chart-subtitle">Higher percentage = better value</span>
        </div>
        <canvas ref="efficiencyChart"></canvas>
      </div>
      
      <div class="chart-card">
        <div class="chart-header">
          <h3>Cost vs Value Analysis</h3>
          <span class="chart-subtitle"></span>
        </div>
        <canvas ref="costValueChart"></canvas>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>Component Cost Breakdown</h3>
          <span class="chart-subtitle">How items build up in cost</span>
        </div>
        <canvas ref="componentChart"></canvas>
      </div>
    </div>

    <!-- Detailed Item Cards with Recipe -->
    <div class="items-grid" ref="itemsCarousel">
      <!-- Mobile Carousel Navigation -->
      <button 
        v-if="isMobile && items.length > 1" 
        @click="scrollCarousel('left')" 
        class="carousel-nav carousel-nav-left"
        :disabled="currentCarouselIndex === 0"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <button 
        v-if="isMobile && items.length > 1" 
        @click="scrollCarousel('right')" 
        class="carousel-nav carousel-nav-right"
        :disabled="currentCarouselIndex === items.length - 1"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      
      <div v-for="item in items" :key="item.id" class="detail-card">
        <!-- Swap Item Button - Top Left Corner -->
        <button @click="openSwapModal(item)" class="btn-swap-item" title="Swap this item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
          </svg>
        </button>
        
        <!-- Remove Button - Top Right Corner -->
        <button @click="removeItem(item)" class="btn-remove-item" title="Remove from comparison">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <!-- Recipe/Build Path -->
        <div v-if="getComponents(item).length > 0" class="recipe-section">
          <div class="recipe-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
            Recipe
          </div>
          <div class="recipe-components">
            <div 
              v-for="comp in getComponents(item)" 
              :key="comp.id" 
              class="recipe-component"
              @mouseenter="showNestedRecipe(comp)"
              @mouseleave="hideNestedRecipe"
            >
              <img :src="getImageUrl(comp.id)" :alt="comp.name" class="recipe-comp-icon" @error="handleImageError" />
              <div class="recipe-comp-info">
                <div class="recipe-comp-name">{{ comp.name }}</div>
                <div class="recipe-comp-cost gold">{{ comp.cost }}g</div>
              </div>
              
              <!-- Nested Recipe Tooltip (Desktop Only) -->
              <div 
                v-if="!isMobile && hoveredComponent?.id === comp.id && getComponents(comp).length > 0"
                class="nested-recipe-tooltip"
              >
                <div class="nested-recipe-header">
                  <img :src="getImageUrl(comp.id)" :alt="comp.name" class="nested-icon" @error="handleImageError" />
                  <div>
                    <div class="nested-name">{{ comp.name }}</div>
                    <div class="nested-cost gold">{{ comp.cost }}g</div>
                  </div>
                </div>
                <div class="nested-recipe-components">
                  <div v-for="subComp in getComponents(comp)" :key="subComp.id" class="nested-comp-item">
                    <img :src="getImageUrl(subComp.id)" :alt="subComp.name" class="nested-comp-icon" @error="handleImageError" />
                    <div class="nested-comp-info">
                      <div class="nested-comp-name">{{ subComp.name }}</div>
                      <div class="nested-comp-cost gold">{{ subComp.cost }}g</div>
                    </div>
                  </div>
                </div>
                <div class="nested-recipe-summary">
                  <span>Components:</span>
                  <span class="gold">{{ getComponentsCost(comp) }}g</span>
                  <span>+</span>
                  <span>Combine:</span>
                  <span class="gold">{{ getCombineCost(comp) }}g</span>
                </div>
              </div>
            </div>
            <div class="recipe-arrow">→</div>
            <div class="recipe-final">
              <img :src="getImageUrl(item.id)" :alt="item.name" class="recipe-final-icon" @error="handleImageError" />
              <div class="recipe-final-info">
                <div class="recipe-final-name">{{ item.name }}</div>
                <div class="recipe-final-cost gold">{{ item.cost }}g</div>
              </div>
            </div>
          </div>
          <div class="recipe-cost-summary">
            <div class="cost-line">
              <span>Components Total:</span>
              <span class="gold">{{ getComponentsCost(item) }}g</span>
            </div>
            <div class="cost-line">
              <span>Combine Cost:</span>
              <span class="gold">{{ getCombineCost(item) }}g</span>
            </div>
            <div class="cost-line total">
              <span>Final Cost:</span>
              <span class="gold">{{ item.cost }}g</span>
            </div>
          </div>
        </div>

        <div class="detail-header">
          <img 
            :src="getImageUrl(item.id)" 
            :alt="item.name"
            class="detail-icon"
            @error="handleImageError"
          />
          <div class="detail-title">
            <h4>{{ item.name }}</h4>
            <span class="detail-tier">{{ getItemTier(item) }}</span>
          </div>
          <div class="detail-efficiency" :class="getEfficiencyClass(item.goldEfficiency)">
            {{ item.goldEfficiency }}%
          </div>
        </div>

        <div class="detail-stats-grid">
          <div class="detail-stat">
            <span class="stat-label">Cost</span>
            <span class="stat-value gold">{{ item.cost }}g</span>
          </div>
          <div class="detail-stat">
            <span class="stat-label">Value</span>
            <span class="stat-value gold">{{ item.totalGoldValue }}g</span>
          </div>
          <div class="detail-stat">
            <span class="stat-label">Rating</span>
            <span class="stat-value" :class="getRatingClass(item.goldEfficiency)">
              {{ getEfficiencyRating(item.goldEfficiency) }}
            </span>
          </div>
          <div class="detail-stat">
            <span class="stat-label">Gain</span>
            <span class="stat-value" :class="item.totalGoldValue > item.cost ? 'positive' : 'negative'">
              {{ item.totalGoldValue > item.cost ? '+' : '' }}{{ (item.totalGoldValue - item.cost).toFixed(0) }}g
            </span>
          </div>
        </div>

        <div v-if="item.statBreakdown && Object.keys(item.statBreakdown).length > 0" class="stat-breakdown-visual">
          <div class="breakdown-header">
            <span class="breakdown-title">Stat Breakdown</span>
            <span class="breakdown-total">{{ item.totalGoldValue }}g total</span>
          </div>
          <div class="breakdown-bars">
            <div 
              v-for="(stat, key) in item.statBreakdown" 
              :key="key" 
              class="breakdown-bar-item"
            >
              <div class="bar-label">
                <div class="bar-stat-name">
                  <img v-if="getStatIcon(key)" :src="getStatIcon(key)" :alt="formatStatName(key)" class="stat-icon" />
                  <span>{{ formatStatName(key) }}</span>
                </div>
                <span class="bar-stat-value">{{ formatStatValue(key, stat.amount) }}</span>
              </div>
              <div class="bar-wrapper">
                <div 
                  class="bar-fill" 
                  :style="{ 
                    width: getStatPercent(stat.goldValue, item.totalGoldValue) + '%',
                    backgroundColor: getStatColor(key)
                  }"
                ></div>
              </div>
              <span class="bar-gold">{{ stat.goldValue }}g</span>
            </div>
          </div>
        </div>

        <div v-if="item.description" class="detail-description">
          <div class="desc-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Item Effects & Passives
          </div>
          <div class="desc-text" v-html="formatDescription(item.description)"></div>
        </div>
      </div>
      
      <!-- Add Item Card (shows when < 6 items and >= 2 items) -->
      <div 
        v-if="!isMobile && items.length >= 2 && items.length < 6" 
        @click="openSwapModal()"
        class="detail-card add-item-card"
      >
        <div class="add-item-content">
          <div class="add-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <h3>Add Another Item</h3>
          <p>Compare up to 6 items</p>
          <div class="add-item-count">{{ items.length }} / 6</div>
        </div>
      </div>
    </div>

    <!-- Analysis Section -->
    <div class="analysis-panel">
      <div class="analysis-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
        Comparison Analysis
      </div>
      <div class="analysis-content">
        <p class="analysis-text">{{ recommendation }}</p>
        
        <div class="analysis-stats">
          <div class="analysis-stat">
            <span class="analysis-label">Efficiency Range</span>
            <span class="analysis-value">
              {{ minEfficiency.toFixed(1) }}% - {{ maxEfficiency.toFixed(1) }}%
              <span class="analysis-diff">({{ (maxEfficiency - minEfficiency).toFixed(1) }}% difference)</span>
            </span>
          </div>
          <div class="analysis-stat">
            <span class="analysis-label">Cost Range</span>
            <span class="analysis-value gold">
              {{ minCost }}g - {{ maxCost }}g
              <span class="analysis-diff">({{ maxCost - minCost }}g difference)</span>
            </span>
          </div>
          <div class="analysis-stat">
            <span class="analysis-label">Average Cost Per Item</span>
            <span class="analysis-value gold">{{ (totalCost / items.length).toFixed(0) }}g</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="empty-state">
    <div class="empty-state-content">
      <div class="empty-icon-wrapper">
    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  </div>
      <h2>Start Comparing Items</h2>
      <p>Select 2-6 items from the database to analyze their gold efficiency, stats, and build paths side by side</p>
      <button @click="goToItems" class="btn-browse-items">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Browse Items Database
      </button>
      <div class="empty-state-features">
        <div class="feature-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span>Quick Insights</span>
        </div>
        <div class="feature-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/>
            <path d="M18 17V9"/>
            <path d="M13 17V5"/>
            <path d="M8 17v-3"/>
          </svg>
          <span>Visual Charts</span>
        </div>
        <div class="feature-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
          <span>Build Paths</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Item Swap/Add Modal -->
  <teleport to="body">
    <transition name="modal">
      <div v-if="showSwapModal" class="modal-overlay" @click.self="closeSwapModal">
        <div class="swap-modal">
          <div class="swap-modal-header">
            <h3>{{ swapTargetItem ? 'Swap Item' : (items.length === 0 ? 'Select First Item' : 'Add Item to Comparison') }}</h3>
            <button @click="closeSwapModal" class="btn-modal-close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="swap-modal-body">
            <div class="swap-search-box">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                v-model="swapSearchQuery"
                ref="swapSearchInput"
                placeholder="Search for an item..."
                class="swap-search-input"
                @input="filterSwapItems"
              />
            </div>
            
            <div class="swap-items-list">
              <div 
                v-for="swapItem in filteredSwapItems.slice(0, 50)" 
                :key="swapItem.id"
                @click="selectSwapItem(swapItem)"
                class="swap-item"
                :class="{ 'already-selected': isItemAlreadySelected(swapItem) }"
              >
                <img :src="getImageUrl(swapItem.id)" :alt="swapItem.name" class="swap-item-img" @error="handleImageError" />
                <div class="swap-item-info">
                  <div class="swap-item-name">{{ swapItem.name }}</div>
                  <div class="swap-item-stats">
                    <span class="swap-item-eff" :class="getEfficiencyClass(swapItem.goldEfficiency)">
                      {{ swapItem.goldEfficiency }}%
                    </span>
                    <span class="swap-item-cost gold">{{ swapItem.cost }}g</span>
                  </div>
                </div>
                <span v-if="isItemAlreadySelected(swapItem)" class="already-in-comparison">
                  ✓ In comparison
                </span>
              </div>
              
              <div v-if="filteredSwapItems.length === 0" class="no-swap-results">
                No items found matching "{{ swapSearchQuery }}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getItemImageUrl, getValidatedItemImageUrl, formatStatValue } from '../api/items'
import { getStatIcon, formatStatName, getStatColor } from '../utils/statIcons.js'

Chart.register(...registerables)

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  allItems: {
    type: Array,
    default: () => []
  }
})

const efficiencyChart = ref(null)
const costValueChart = ref(null)
const componentChart = ref(null)
const itemsCarousel = ref(null)
let efficiencyChartInstance = null
let costValueChartInstance = null
let componentChartInstance = null

// Mobile carousel state
const isMobile = ref(false)
const currentCarouselIndex = ref(0)

// Nested recipe tooltip state
const hoveredComponent = ref(null)

// Swap modal state
const showSwapModal = ref(false)
const swapTargetItem = ref(null)
const swapSearchQuery = ref('')
const swapSearchInput = ref(null)
const filteredSwapItems = ref([])

const emit = defineEmits(['clear', 'viewDetailed', 'removeItem', 'addMore', 'swapItem'])

function removeItem(item) {
  emit('removeItem', item)
}

// Nested recipe tooltip functions
function showNestedRecipe(component) {
  if (!isMobile.value) {
    hoveredComponent.value = component
  }
}

function hideNestedRecipe() {
  hoveredComponent.value = null
}

// Swap modal functions
function openSwapModal(item = null) {
  swapTargetItem.value = item
  showSwapModal.value = true
  swapSearchQuery.value = ''
  filteredSwapItems.value = props.allItems.filter(i => 
    !props.items.some(selected => selected.id === i.id)
  )
  
  nextTick(() => {
    swapSearchInput.value?.focus()
  })
}

function closeSwapModal() {
  showSwapModal.value = false
  swapTargetItem.value = null
  swapSearchQuery.value = ''
}

function filterSwapItems() {
  const query = swapSearchQuery.value.toLowerCase().trim()
  
  if (!query) {
    filteredSwapItems.value = props.allItems.filter(i => 
      !props.items.some(selected => selected.id === i.id)
    )
  } else {
    filteredSwapItems.value = props.allItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(query)
      const statsMatch = item.statBreakdown && Object.keys(item.statBreakdown).some(stat =>
        stat.toLowerCase().includes(query) || formatStatName(stat).toLowerCase().includes(query)
      )
      return nameMatch || statsMatch
    })
  }
}

function selectSwapItem(newItem) {
  if (isItemAlreadySelected(newItem)) {
    return // Don't allow selecting already compared items
  }
  
  if (swapTargetItem.value) {
    // Swap existing item
    emit('swapItem', swapTargetItem.value, newItem)
  } else {
    // Add new item (if less than 6)
    if (props.items.length < 6) {
      emit('addMore', [newItem])
    }
  }
  
  closeSwapModal()
}

function isItemAlreadySelected(item) {
  return props.items.some(i => i.id === item.id)
}

function goToItems() {
  // Navigate to home page using router
  window.location.href = '/'
}

function createEfficiencyChart() {
  if (!efficiencyChart.value || props.items.length < 2) return

  if (efficiencyChartInstance) {
    efficiencyChartInstance.destroy()
  }

  const ctx = efficiencyChart.value.getContext('2d')
  const labels = props.items.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name)
  const data = props.items.map(item => item.goldEfficiency)
  const colors = data.map(eff => {
    if (eff >= 120) return 'rgba(34, 197, 94, 0.8)'
    if (eff >= 100) return 'rgba(59, 130, 246, 0.8)'
    if (eff >= 80) return 'rgba(245, 158, 11, 0.8)'
    return 'rgba(239, 68, 68, 0.8)'
  })

  efficiencyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Gold Efficiency %',
        data: data,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#a1a1aa', font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#a1a1aa', maxRotation: 45, minRotation: 0, font: { size: 11 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#18181b',
          titleColor: '#e4e4e7',
          bodyColor: '#a1a1aa',
          borderColor: '#3f3f46',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      }
    }
  })
}

function createCostValueChart() {
  if (!costValueChart.value || props.items.length < 2) return

  if (costValueChartInstance) {
    costValueChartInstance.destroy()
  }

  const ctx = costValueChart.value.getContext('2d')
  const labels = props.items.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name)

  costValueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Item Cost',
          data: props.items.map(item => item.cost),
          borderColor: 'rgba(135, 64, 55, 1)',
          backgroundColor: 'rgba(135, 64, 55, 0.1)',
          tension: 0.3,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(135, 64, 55, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Stat Value',
          data: props.items.map(item => item.totalGoldValue),
          borderColor: 'rgba(240, 168, 41, 1)',
          backgroundColor: 'rgba(240, 168, 41, 0.1)',
          tension: 0.3,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(240, 168, 41, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#a1a1aa', font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#a1a1aa', maxRotation: 45, minRotation: 0, font: { size: 11 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#e4e4e7', padding: 15, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: '#18181b',
          titleColor: '#e4e4e7',
          bodyColor: '#a1a1aa',
          borderColor: '#3f3f46',
          borderWidth: 1,
          padding: 12
        }
      }
    }
  })
}

function createComponentChart() {
  if (!componentChart.value || props.items.length < 2) return

  if (componentChartInstance) {
    componentChartInstance.destroy()
  }

  const ctx = componentChart.value.getContext('2d')
  const labels = props.items.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name)

  componentChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Components Cost',
          data: props.items.map(item => getComponentsCostValue(item)),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2
        },
        {
          label: 'Combine Cost',
          data: props.items.map(item => getCombineCostValue(item)),
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: '#a1a1aa', maxRotation: 45, minRotation: 0, font: { size: 11 } }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#a1a1aa', font: { size: 11 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#e4e4e7', padding: 15, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: '#18181b',
          titleColor: '#e4e4e7',
          bodyColor: '#a1a1aa',
          borderColor: '#3f3f46',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            footer: (tooltipItems) => {
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0)
              return `Total: ${total}g`
            }
          }
        }
      }
    }
  })
}

watch(() => props.items, () => {
  nextTick(() => {
    createEfficiencyChart()
    createCostValueChart()
    createComponentChart()
  })
}, { immediate: true, deep: true })

onMounted(() => {
  createEfficiencyChart()
  createCostValueChart()
  createComponentChart()
})

const bestEfficiency = computed(() => {
  if (props.items.length === 0) return null
  return props.items.reduce((best, item) => 
    item.goldEfficiency > best.goldEfficiency ? item : best
  , props.items[0])
})

const avgEfficiency = computed(() => {
  if (props.items.length === 0) return 0
  return props.items.reduce((sum, item) => sum + item.goldEfficiency, 0) / props.items.length
})

const totalCost = computed(() => {
  return props.items.reduce((sum, item) => sum + item.cost, 0)
})

const totalValue = computed(() => {
  return props.items.reduce((sum, item) => sum + item.totalGoldValue, 0)
})

const minEfficiency = computed(() => {
  if (props.items.length === 0) return 0
  return Math.min(...props.items.map(i => i.goldEfficiency))
})

const maxEfficiency = computed(() => {
  if (props.items.length === 0) return 0
  return Math.max(...props.items.map(i => i.goldEfficiency))
})

const minCost = computed(() => {
  if (props.items.length === 0) return 0
  return Math.min(...props.items.map(i => i.cost))
})

const maxCost = computed(() => {
  if (props.items.length === 0) return 0
  return Math.max(...props.items.map(i => i.cost))
})

const secondBestEfficiency = computed(() => {
  if (props.items.length < 2) return null
  const sorted = [...props.items].sort((a, b) => b.goldEfficiency - a.goldEfficiency)
  return sorted[1]
})

const efficiencyGap = computed(() => {
  if (!bestEfficiency.value || !secondBestEfficiency.value) return 0
  return bestEfficiency.value.goldEfficiency - secondBestEfficiency.value.goldEfficiency
})

const netGain = computed(() => {
  return Math.round(totalValue.value - totalCost.value)
})

const avgCost = computed(() => {
  if (props.items.length === 0) return 0
  return Math.round(totalCost.value / props.items.length)
})

const itemsWithComponents = computed(() => {
  return props.items.filter(item => item.from && item.from.length > 0)
})

const totalComponents = computed(() => {
  return itemsWithComponents.value.reduce((sum, item) => {
    return sum + (item.from ? item.from.length : 0)
  }, 0)
})

const avgBuildCost = computed(() => {
  if (itemsWithComponents.value.length === 0) return 0
  const totalBuildCost = itemsWithComponents.value.reduce((sum, item) => sum + item.cost, 0)
  return Math.round(totalBuildCost / itemsWithComponents.value.length)
})

const recommendation = computed(() => {
  if (props.items.length < 2) return ''
  
  const sorted = [...props.items].sort((a, b) => b.goldEfficiency - a.goldEfficiency)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  
  const diffPercent = ((best.goldEfficiency - worst.goldEfficiency) / worst.goldEfficiency * 100).toFixed(1)
  
  return `${best.name} offers the best gold efficiency at ${best.goldEfficiency.toFixed(1)}%, which is ${diffPercent}% better than ${worst.name}. However, remember that item passives, active effects, and champion synergies are equally important factors. Consider your champion's playstyle and team composition when making final decisions.`
})

function getComponents(item) {
  if (!item.from || !props.allItems) return []
  return item.from
    .map(id => props.allItems.find(i => i.id === id))
    .filter(Boolean)
}

function getComponentsCost(item) {
  const components = getComponents(item)
  return components.reduce((sum, comp) => sum + (comp.cost || 0), 0)
}

function getComponentsCostValue(item) {
  return getComponentsCost(item)
}

function getCombineCost(item) {
  if (!item.gold) return 0
  return item.gold.base || 0
}

function getCombineCostValue(item) {
  return getCombineCost(item)
}

function getComponentEfficiency(item) {
  // Normalize efficiency to 0-100 range for bar display
  const max = Math.max(...props.items.map(i => i.goldEfficiency))
  return (item.goldEfficiency / max) * 100
}

function getImageUrl(itemId) {
  return getItemImageUrl(itemId)
}

function handleImageError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%2327272a" width="64" height="64"/%3E%3C/svg%3E'
}

function getItemTier(item) {
  if (item.cost >= 2500) return 'Legendary'
  if (item.cost >= 1200) return 'Epic'
  if (item.into && item.into.length > 0) return 'Component'
  return 'Basic'
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

// Mobile carousel functions
function scrollCarousel(direction) {
  if (!itemsCarousel.value) return
  
  const cardWidth = itemsCarousel.value.querySelector('.detail-card')?.offsetWidth || 0
  const gap = 24 // 1.5rem gap
  const scrollAmount = cardWidth + gap
  
  if (direction === 'left' && currentCarouselIndex.value > 0) {
    currentCarouselIndex.value--
    itemsCarousel.value.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    })
  } else if (direction === 'right' && currentCarouselIndex.value < props.items.length - 1) {
    currentCarouselIndex.value++
    itemsCarousel.value.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    })
  }
}

// Detect mobile on mount
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
  }
  checkMobile()
  
  window.addEventListener('resize', checkMobile)
  
  return () => {
    window.removeEventListener('resize', checkMobile)
  }
})

function getStatPercent(goldValue, totalValue) {
  if (!totalValue) return 0
  return Math.round((goldValue / totalValue) * 100)
}

function sanitizeHtml(html) {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function formatDescription(html) {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Keep some formatting tags but make them safe
    .replace(/<br\s*\/?>/gi, '<br>')
    .replace(/<\/?passive>/gi, '')
    .replace(/<\/?active>/gi, '')
    .replace(/<\/?unique>/gi, '<span class="unique-tag">')
    .replace(/<\/?stats>/gi, '<span class="stats-tag">')
    .replace(/<\/?attention>/gi, '<strong class="attention">')
    .replace(/<\/?li>/gi, '• ')
    .replace(/<\/?ul>/gi, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '<br><br>')
    .trim()
}
</script>

<style scoped>
.compare-container {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

/* Header */
.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-primary);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.compare-container h2 {
  color: var(--gold);
  font-size: 1.75rem;
  margin: 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: var(--gold);
}

.item-count {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-clear, .btn-add-more {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-clear svg, .btn-add-more svg {
  width: 16px;
  height: 16px;
}

.btn-add-more:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
  transform: translateY(-1px);
}

.btn-clear:hover {
  background: var(--error);
  border-color: var(--error);
  color: white;
  transform: translateY(-1px);
}

/* Enhanced Insights Section */
.insights-section {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid var(--border-primary);
}

.insights-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--gold);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-primary);
}

.insights-header svg {
  width: 24px;
  height: 24px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.insight-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  transition: all 0.2s;
}

.insight-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.insight-card.winner {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.1), rgba(135, 64, 55, 0.05));
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.insight-header svg {
  width: 16px;
  height: 16px;
}

.insight-winner {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.winner-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  border: 2px solid var(--gold);
  object-fit: contain;
  background: var(--bg-secondary);
}

.winner-info {
  flex: 1;
}

.winner-name {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.375rem;
}

.winner-eff {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.winner-stats {
  display: flex;
  gap: 1rem;
}

.winner-stat {
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.insight-comparison {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.comparison-label {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
}

.comparison-value {
  font-size: 1.125rem;
  font-weight: 700;
}

/* Component Efficiency */
.component-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.component-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.component-name {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
}

.component-bar {
  position: relative;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.component-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold), var(--rust));
  transition: width 0.3s ease;
}

.component-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

/* Gold Analysis */
.gold-analysis {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.analysis-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.analysis-row.highlight {
  background: linear-gradient(90deg, rgba(240, 168, 41, 0.1), rgba(135, 64, 55, 0.05));
  border: 1px solid var(--border-secondary);
}

.analysis-label {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
}

.analysis-value {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
}

/* Build Complexity */
.complexity-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.complexity-item {
  text-align: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.complexity-number {
  color: var(--gold);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.complexity-label {
  color: var(--text-tertiary);
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.3;
}

/* Recipe Section */
.recipe-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.recipe-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gold);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.recipe-header svg {
  width: 14px;
  height: 14px;
}

.recipe-components {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.recipe-component, .recipe-final {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.recipe-final {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.1), rgba(135, 64, 55, 0.05));
}

.recipe-comp-icon, .recipe-final-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
  object-fit: contain;
  background: var(--bg-secondary);
}

.recipe-final-icon {
  border-color: var(--gold);
}

.recipe-comp-info, .recipe-final-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.recipe-comp-name, .recipe-final-name {
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 600;
}

.recipe-comp-cost, .recipe-final-cost {
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.recipe-arrow {
  color: var(--gold);
  font-size: 1.25rem;
  font-weight: bold;
}

.recipe-cost-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-primary);
}

.cost-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.cost-line.total {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-primary);
}

/* Charts */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

.chart-header {
  margin-bottom: 1.25rem;
}

.chart-card h3 {
  color: var(--text-primary);
  font-size: 1.125rem;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.chart-subtitle {
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.chart-card canvas {
  max-height: 280px;
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

/* Better layout for 3-4 items on desktop */
@media (min-width: 1200px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* For exactly 3 items: 2 on top, 1 centered below */
  .items-grid:has(.detail-card:nth-child(3):last-child) .detail-card:nth-child(3) {
    grid-column: 1 / -1;
    max-width: 50%;
    margin: 0 auto;
  }
}

.detail-card {
  position: relative;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.2s;
}

.detail-card:hover {
  border-color: var(--gold);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
  position: relative;
}

.detail-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-secondary);
  object-fit: contain;
  background: var(--bg-secondary);
}

.detail-title {
  flex: 1;
}

.detail-title h4 {
  color: var(--text-primary);
  font-size: 1.125rem;
  margin: 0 0 0.375rem 0;
  font-weight: 600;
}

.detail-tier {
  color: var(--gold);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-efficiency {
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.5rem 0.875rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.btn-remove-item {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.btn-remove-item svg {
  width: 16px;
  height: 16px;
}

.btn-remove-item:hover {
  background: var(--error);
  border-color: var(--error);
  color: white;
  transform: scale(1.05);
}

.detail-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.detail-stat {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
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
  font-size: 1.125rem;
  font-weight: 700;
}

.stat-value.positive {
  color: var(--success);
}

.stat-value.negative {
  color: var(--error);
}

/* Stat Breakdown Visual */
.stat-breakdown-visual {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.breakdown-title {
  color: var(--gold);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.breakdown-total {
  color: var(--gold);
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.breakdown-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.breakdown-bar-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 0.75rem;
  align-items: center;
}

.bar-label {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.bar-stat-name {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.stat-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
  filter: brightness(1.1);
}

.bar-stat-value {
  color: var(--gold);
  font-size: 0.8125rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.bar-wrapper {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold), var(--rust));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-gold {
  color: var(--gold);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
  text-align: right;
  min-width: 50px;
}

/* Description */
.detail-description {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.desc-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gold);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.desc-label svg {
  width: 14px;
  height: 14px;
}

.desc-text {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.7;
}

.desc-text strong, .desc-text .attention {
  color: var(--gold);
  font-weight: 700;
}

.desc-text .unique-tag {
  color: var(--success);
  font-weight: 600;
}

.desc-text .stats-tag {
  color: var(--text-primary);
  font-weight: 600;
}

.desc-text br {
  display: block;
  content: "";
  margin: 0.5rem 0;
}

/* Analysis Panel */
.analysis-panel {
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  border: 2px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--gold);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.analysis-header svg {
  width: 24px;
  height: 24px;
}

.analysis-text {
  color: var(--text-primary);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.analysis-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.analysis-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.analysis-label {
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.analysis-value {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 700;
}

.analysis-diff {
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  font-weight: 500;
}

/* Efficiency Colors */
.eff-excellent { color: #22c55e; }
.eff-good { color: #3b82f6; }
.eff-fair { color: #f59e0b; }
.eff-poor { color: #ef4444; }

.rating-excellent { color: #22c55e; }
.rating-good { color: #3b82f6; }
.rating-fair { color: #f59e0b; }
.rating-poor { color: #ef4444; }

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

/* Empty State */
.empty-state {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.empty-state-content {
  max-width: 600px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.1), rgba(135, 64, 55, 0.1));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-primary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--gold);
  opacity: 0.8;
}

.empty-state h2 {
  color: var(--text-primary);
  font-size: 2rem;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin: 0 0 2.5rem 0;
  line-height: 1.6;
}

.btn-browse-items {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: linear-gradient(135deg, var(--gold), var(--rust));
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(240, 168, 41, 0.3);
}

.btn-browse-items svg {
  width: 20px;
  height: 20px;
}

.btn-browse-items:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 168, 41, 0.4);
}

.empty-state-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.feature-item svg {
  width: 28px;
  height: 28px;
  color: var(--gold);
}

.feature-item span {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Single Item View */
.single-item-view {
  background: var(--bg-secondary);
  border: 2px dashed var(--border-secondary);
  border-radius: var(--radius-xl);
  padding: 4rem 2rem;
  margin: 2rem 0;
}

.single-item-message {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.message-icon {
  width: 64px;
  height: 64px;
  color: var(--gold);
  margin: 0 auto 1.5rem;
  opacity: 0.8;
}

.single-item-message h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0 0 0.75rem 0;
  font-weight: 700;
}

.single-item-message p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.btn-add-first {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: var(--gold);
  color: var(--bg-primary);
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(240, 168, 41, 0.3);
}

.btn-add-first svg {
  width: 20px;
  height: 20px;
}

.btn-add-first:hover {
  background: rgb(220, 148, 21);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 168, 41, 0.4);
}

/* Header Add Item Button */
.btn-add-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gold);
  color: var(--bg-primary);
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-item svg {
  width: 18px;
  height: 18px;
}

.btn-add-item:hover {
  background: rgb(220, 148, 21);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(240, 168, 41, 0.3);
}

/* Add Item Card */
.add-item-card {
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.05), rgba(135, 64, 55, 0.05));
  border: 2px dashed var(--gold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-item-card:hover {
  background: linear-gradient(135deg, rgba(240, 168, 41, 0.1), rgba(135, 64, 55, 0.1));
  border-color: var(--gold);
  border-style: solid;
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(240, 168, 41, 0.3);
}

.add-item-content {
  text-align: center;
  padding: 2rem;
}

.add-item-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.add-item-card:hover .add-item-icon {
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 8px 24px rgba(240, 168, 41, 0.4);
}

.add-item-icon svg {
  width: 48px;
  height: 48px;
  color: var(--bg-primary);
}

.add-item-content h3 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.add-item-content p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin: 0 0 1.5rem 0;
}

.add-item-count {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--gold);
  font-weight: 700;
  font-size: 0.875rem;
}

.stat-value.positive {
  color: var(--success);
}

.stat-value.negative {
  color: var(--error);
}

/* Mobile Carousel Styles */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: var(--bg-primary);
  border: 2px solid var(--gold);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.carousel-nav:hover:not(:disabled) {
  background: var(--gold);
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: var(--border-secondary);
}

.carousel-nav svg {
  width: 24px;
  height: 24px;
  color: var(--gold);
}

.carousel-nav:hover:not(:disabled) svg {
  color: var(--bg-primary);
}

.carousel-nav-left {
  left: -22px;
}

.carousel-nav-right {
  right: -22px;
}

/* Responsive */
@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  /* Mobile carousel for item comparison cards */
  .items-grid {
    position: relative;
    display: flex !important;
    flex-direction: row !important;
    grid-template-columns: unset !important;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    gap: 1rem !important;
    padding: 0 0.5rem;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  .items-grid::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  .detail-card {
    flex: 0 0 calc(100vw - 3rem) !important;
    min-width: calc(100vw - 3rem) !important;
    max-width: calc(100vw - 3rem) !important;
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }
  
  .carousel-nav {
    display: flex;
    width: 40px;
    height: 40px;
  }
  
  .carousel-nav-left {
    left: 8px;
  }
  
  .carousel-nav-right {
    right: 8px;
  }
  
  .carousel-nav svg {
    width: 20px;
    height: 20px;
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
  
  .analysis-stats {
    grid-template-columns: 1fr;
  }

  .complexity-stats {
    grid-template-columns: 1fr;
  }

  .recipe-components {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .recipe-component {
    flex: 1 1 45%;
    min-width: 0;
  }
  
  .recipe-comp-icon,
  .recipe-final-icon {
    width: 32px;
    height: 32px;
  }
  
  .recipe-comp-name,
  .recipe-final-name {
    font-size: 0.75rem;
  }

  .recipe-arrow {
    display: none;
  }
  
  .compare-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .btn-add-more,
  .btn-clear {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .detail-card {
    flex: 0 0 calc(100vw - 2rem) !important;
    min-width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
  
  .carousel-nav {
    width: 36px;
    height: 36px;
  }
  
  .carousel-nav svg {
    width: 18px;
    height: 18px;
  }
}

/* Swap Item Button */
.btn-swap-item {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.btn-swap-item svg {
  width: 16px;
  height: 16px;
}

.btn-swap-item:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--bg-primary);
  transform: scale(1.05);
}

/* Nested Recipe Tooltip */
.recipe-component {
  position: relative;
  cursor: help;
}

.nested-recipe-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: var(--bg-primary);
  border: 2px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: 1rem;
  width: 280px;
  z-index: 1000;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(240, 168, 41, 0.3);
}

.nested-recipe-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-primary);
}

.nested-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--gold);
  object-fit: contain;
  background: var(--bg-secondary);
}

.nested-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9375rem;
}

.nested-cost {
  font-size: 0.875rem;
  font-weight: 700;
}

.nested-recipe-components {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
}

.nested-comp-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}

.nested-comp-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-secondary);
  object-fit: contain;
  background: var(--bg-secondary);
}

.nested-comp-info {
  flex: 1;
}

.nested-comp-name {
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-weight: 600;
}

.nested-comp-cost {
  font-size: 0.75rem;
  font-weight: 700;
}

.nested-recipe-summary {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.625rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  justify-content: center;
}

/* Swap Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.swap-modal {
  background: var(--bg-secondary);
  border: 2px solid var(--gold);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 96px rgba(0, 0, 0, 0.9);
}

.swap-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid var(--border-primary);
}

.swap-modal-header h3 {
  color: var(--gold);
  font-size: 1.25rem;
  margin: 0;
  font-weight: 700;
}

.btn-modal-close {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-close:hover {
  background: var(--error);
  color: white;
}

.btn-modal-close svg {
  width: 20px;
  height: 20px;
}

.swap-modal-body {
  padding: 1.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.swap-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.swap-search-box .search-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.swap-search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.swap-search-input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(240, 168, 41, 0.1);
}

.swap-items-list {
  overflow-y: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.swap-items-list::-webkit-scrollbar {
  width: 8px;
}

.swap-items-list::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.swap-items-list::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 4px;
}

.swap-items-list::-webkit-scrollbar-thumb:hover {
  background: var(--gold);
}

.swap-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.swap-item:hover {
  border-color: var(--gold);
  background: var(--bg-hover);
  transform: translateX(4px);
}

.swap-item.already-selected {
  opacity: 0.5;
  cursor: not-allowed;
}

.swap-item.already-selected:hover {
  transform: none;
  border-color: var(--border-primary);
}

.swap-item-img {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-secondary);
  object-fit: contain;
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.swap-item-info {
  flex: 1;
}

.swap-item-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
}

.swap-item-stats {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.swap-item-eff {
  font-weight: 700;
  font-size: 0.875rem;
}

.swap-item-cost {
  font-size: 0.875rem;
  font-weight: 600;
}

.already-in-comparison {
  color: var(--success);
  font-size: 0.8125rem;
  font-weight: 600;
}

.no-swap-results {
  padding: 2rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.9375rem;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .swap-modal,
.modal-leave-active .swap-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .swap-modal,
.modal-leave-to .swap-modal {
  transform: scale(0.9);
}
</style>
