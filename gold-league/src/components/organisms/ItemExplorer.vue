<script setup>
import { ref, computed, toRef, onMounted, onUnmounted } from 'vue'
import CompareTray from '../molecules/CompareTray.vue'
import SearchBar from '../molecules/SearchBar.vue'
import ViewToggle from '../molecules/ViewToggle.vue'
import FilterChips from '../molecules/FilterChips.vue'
import SortControls from '../molecules/SortControls.vue'
import TypeFilter from '../molecules/TypeFilter.vue'
import ItemCard from '../molecules/ItemCard.vue'
import ItemTableView from '../molecules/ItemTableView.vue'
import PaginationBar from '../molecules/PaginationBar.vue'
import { useItemFilters } from '@/composables/useItemFilters'
import { useItemSuggestions } from '@/composables/useItemSuggestions'
import { useIsMobile } from '@/composables/useMediaQuery'

const props = defineProps({
  items: { type: Array, required: true },
})

const emit = defineEmits(['compare', 'addToBuild'])

const tierOptions = [
  { value: 'legendary', label: 'Legendary' },
  { value: 'epic', label: 'Epic' },
  { value: 'component', label: 'Components' },
  { value: 'basic', label: 'Basic' },
]

const isMobile = useIsMobile()
const viewMode = ref('grid')
const itemsRef = toRef(props, 'items')
const isLoading = computed(() => props.items.length === 0)

const {
  search, sortKey, sortDir, tierFilter, typeFilter, excludeSupport, itemsPerPage, failedImages,
  filtered, displayedItems, hasMoreItems, remainingItems, sortBy, loadMore, markImageFailed,
} = useItemFilters(itemsRef)

const { suggestions } = useItemSuggestions(itemsRef, search, failedImages)

// top-3 efficiency items of the current filtered view get the gold beam
const beamIds = computed(() => {
  const top = [...filtered.value].sort((a, b) => b.goldEfficiency - a.goldEfficiency).slice(0, 3)
  return new Set(top.map(i => i.id))
})

// Selection (the floating tray)
const selectedItems = ref([])
const selectingItemId = ref(null)
const selectedIds = computed(() => selectedItems.value.map(i => i.id))

function toggleSelect(item) {
  selectingItemId.value = item.id
  setTimeout(() => (selectingItemId.value = null), 400)

  const index = selectedItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else if (selectedItems.value.length < 6) {
    selectedItems.value.push(item)
  }
}

function removeSelected(item) {
  const index = selectedItems.value.findIndex(i => i.id === item.id)
  if (index > -1) selectedItems.value.splice(index, 1)
}

// Infinite scroll
const isLoadingMore = ref(false)
function handleScroll() {
  if (isLoadingMore.value) return
  const scrollPosition = window.scrollY + window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  if (scrollPosition >= documentHeight - 300 && hasMoreItems.value) {
    isLoadingMore.value = true
    setTimeout(() => {
      loadMore()
      isLoadingMore.value = false
    }, 100)
  }
}

onMounted(() => {
  if (isMobile.value) viewMode.value = 'table' // better mobile default
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <div class="item-browser">
    <CompareTray
      v-if="!isLoading"
      :items="selectedItems"
      @remove="removeSelected"
      @clear="selectedItems = []"
      @compare="emit('compare', $event)"
      @add-to-build="emit('addToBuild', $event)"
      @image-failed="markImageFailed"
    />

    <!-- controls render immediately (no pop-in) — usable the instant data lands -->
    <div class="browser-controls">
      <div class="controls-row">
        <SearchBar v-model="search" :suggestions="suggestions" @select-suggestion="search = $event.name" />
        <ViewToggle v-model="viewMode" />
      </div>
      <div class="filters-row">
        <FilterChips v-model="tierFilter" :options="tierOptions" />
        <SortControls v-model:sort-key="sortKey" v-model:sort-dir="sortDir" />
      </div>
      <TypeFilter v-model="typeFilter" v-model:exclude-support="excludeSupport" />
    </div>

    <!-- loading: skeleton cards in the SAME grid as the real cards -> no shift -->
    <div v-if="isLoading" class="items-grid" aria-busy="true">
      <div v-for="n in 18" :key="n" class="card-skeleton">
        <div class="cs-header"></div>
        <div class="cs-body">
          <div class="cs-line cs-title"></div>
          <div class="cs-stat"></div>
          <div class="cs-line cs-sm"></div>
          <div class="cs-line cs-sm"></div>
          <div class="cs-rating"></div>
        </div>
      </div>
    </div>

    <template v-else>
      <div v-if="viewMode === 'grid'" class="items-grid">
        <ItemCard
          v-for="item in displayedItems"
          :key="item.id"
          :item="item"
          :selected="selectedIds.includes(item.id)"
          :selecting="selectingItemId === item.id"
          :beam="beamIds.has(item.id)"
          @toggle="toggleSelect"
          @image-failed="markImageFailed"
        />
      </div>

      <ItemTableView
        v-else
        :items="displayedItems"
        :sort-key="sortKey"
        :sort-dir="sortDir"
        :selected-ids="selectedIds"
        :selecting-id="selectingItemId"
        @sort="sortBy"
        @toggle="toggleSelect"
        @image-failed="markImageFailed"
      />

      <PaginationBar
        v-model="itemsPerPage"
        :total="filtered.length"
        :has-more="hasMoreItems"
        :remaining="remainingItems"
        @load-more="loadMore()"
      />
    </template>
  </div>
</template>

<style scoped>
.item-browser {
  width: 100%;
  position: relative;
  padding-bottom: 90px; /* Space for floating tray */
}

.browser-controls {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border);
}

.controls-row { display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; }

.filters-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
}

/* skeleton card mirrors ItemCard's exact box so swapping in real cards causes
   ZERO layout shift (same grid, same border/radius, square header, body) */
.card-skeleton {
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.cs-header { aspect-ratio: 1; border-bottom: 1px solid var(--border); }
.cs-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.cs-line { border-radius: var(--radius-sm); }
.cs-title { height: 2.4em; }
.cs-stat { height: 2.5rem; border-radius: var(--radius-sm); }
.cs-sm { height: 0.95rem; width: 80%; }
.cs-sm:nth-of-type(odd) { width: 65%; }
.cs-rating { height: 2rem; border-radius: var(--radius-sm); margin-top: 0.25rem; }

.cs-header, .cs-line, .cs-stat, .cs-rating {
  background: linear-gradient(90deg,
    var(--accent-lead-tint) 0%,
    color-mix(in srgb, var(--accent-lead) 12%, transparent) 50%,
    var(--accent-lead-tint) 100%);
  background-size: 200% 100%;
  animation: cs-shimmer 1.4s ease-in-out infinite;
}
@keyframes cs-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) {
  .cs-header, .cs-line, .cs-stat, .cs-rating { animation: none; }
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  .browser-controls { padding: 1rem; gap: 1rem; }
  .controls-row { flex-direction: column; gap: 0.75rem; }
  .filters-row { flex-direction: column; gap: 0.75rem; }
}
</style>
