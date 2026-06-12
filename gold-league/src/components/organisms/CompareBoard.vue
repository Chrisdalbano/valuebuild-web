<script setup>
import { ref, computed, reactive, toRef, useTemplateRef } from 'vue'
import CompareHeader from '../molecules/CompareHeader.vue'
import CompareEmptyState from '../molecules/CompareEmptyState.vue'
import CompareSingleItemNotice from '../molecules/CompareSingleItemNotice.vue'
import CompareInsightsPanel from '../molecules/CompareInsightsPanel.vue'
import CompareCharts from '../molecules/CompareCharts.vue'
import CompareItemCard from '../molecules/CompareItemCard.vue'
import AddItemCard from '../molecules/AddItemCard.vue'
import CompareAnalysisPanel from '../molecules/CompareAnalysisPanel.vue'
import SwapItemModal from '../molecules/SwapItemModal.vue'
import { useCompareInsights } from '@/composables/useCompareInsights'
import { useIsMobile } from '@/composables/useMediaQuery'

const props = defineProps({
  items: { type: Array, default: () => [] },
  allItems: { type: Array, default: () => [] },
})

const emit = defineEmits(['clear', 'removeItem', 'swapItem', 'addItem'])

const isMobile = useIsMobile()
// reactive() unwraps the composable's refs so children can consume
// `insights.x` as plain values through the prop
const insights = reactive(useCompareInsights(toRef(props, 'items')))

// Swap/add modal
const showSwapModal = ref(false)
const swapTargetItem = ref(null)
const modalTitle = computed(() =>
  swapTargetItem.value ? 'Swap Item' : (props.items.length === 0 ? 'Select First Item' : 'Add Item to Comparison')
)

function openSwapModal(item = null) {
  swapTargetItem.value = item
  showSwapModal.value = true
}

function onModalSelect(newItem) {
  if (swapTargetItem.value) {
    emit('swapItem', swapTargetItem.value, newItem)
  } else if (props.items.length < 6) {
    emit('addItem', newItem)
  }
  showSwapModal.value = false
  swapTargetItem.value = null
}

// Mobile carousel
const itemsCarousel = useTemplateRef('itemsCarousel')
const currentCarouselIndex = ref(0)

function scrollCarousel(direction) {
  if (!itemsCarousel.value) return
  const cardWidth = itemsCarousel.value.querySelector('.detail-card')?.offsetWidth || 0
  const scrollAmount = cardWidth + 24 // 1.5rem gap
  if (direction === 'left' && currentCarouselIndex.value > 0) {
    currentCarouselIndex.value--
    itemsCarousel.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else if (direction === 'right' && currentCarouselIndex.value < props.items.length - 1) {
    currentCarouselIndex.value++
    itemsCarousel.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

// Legacy behavior: full page load back to the explorer
function goToItems() {
  window.location.href = '/'
}
</script>

<template>
  <div v-if="items.length >= 1" class="compare-container">
    <CompareHeader :count="items.length" @clear="emit('clear')" />

    <CompareSingleItemNotice v-if="items.length === 1" @add="openSwapModal()" />
    <CompareInsightsPanel v-else :items="items" :insights="insights" />

    <CompareCharts :items="items" :all-items="allItems" />

    <div class="items-grid" ref="itemsCarousel">
      <button v-if="isMobile && items.length > 1" @click="scrollCarousel('left')"
        class="carousel-nav carousel-nav-left" :disabled="currentCarouselIndex === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button v-if="isMobile && items.length > 1" @click="scrollCarousel('right')"
        class="carousel-nav carousel-nav-right" :disabled="currentCarouselIndex === items.length - 1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <CompareItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :all-items="allItems"
        :is-mobile="isMobile"
        @remove="emit('removeItem', $event)"
        @swap="openSwapModal($event)"
      />

      <AddItemCard
        v-if="!isMobile && items.length >= 2 && items.length < 6"
        :count="items.length"
        @add="openSwapModal()"
      />
    </div>

    <CompareAnalysisPanel :insights="insights" :item-count="items.length" />
  </div>

  <CompareEmptyState v-else @browse="goToItems" />

  <SwapItemModal
    :open="showSwapModal"
    :title="modalTitle"
    :all-items="allItems"
    :selected-items="items"
    @close="showSwapModal = false; swapTargetItem = null"
    @select="onModalSelect"
  />
</template>

<style scoped>
.compare-container { padding: 1.5rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border); }

.items-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }

@media (min-width: 1200px) {
  .items-grid { grid-template-columns: repeat(2, 1fr); }
  /* For exactly 3 items: 2 on top, 1 centered below */
  .items-grid:has(.detail-card:nth-child(3):last-child) .detail-card:nth-child(3) {
    grid-column: 1 / -1;
    max-width: 50%;
    margin: 0 auto;
  }
}

/* Mobile carousel (sizes the child cards' roots — layout concern of this container) */
.carousel-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; background: var(--bg-canvas); border: 2px solid var(--accent-lead); border-radius: 50%; width: 44px; height: 44px; display: none; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }

.carousel-nav:hover:not(:disabled) { background: var(--accent-lead); transform: translateY(-50%) scale(1.1); }
.carousel-nav:disabled { opacity: 0.3; cursor: not-allowed; border-color: var(--border-strong); }
.carousel-nav svg { width: 24px; height: 24px; color: var(--accent-lead); }
.carousel-nav:hover:not(:disabled) svg { color: var(--bg-canvas); }
.carousel-nav-left { left: -22px; }
.carousel-nav-right { right: -22px; }

@media (max-width: 768px) {
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
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .items-grid::-webkit-scrollbar { display: none; }
  .items-grid :deep(.detail-card) {
    flex: 0 0 calc(100vw - 3rem) !important;
    min-width: calc(100vw - 3rem) !important;
    max-width: calc(100vw - 3rem) !important;
    scroll-snap-align: center; scroll-snap-stop: always;
  }
  .carousel-nav { display: flex; width: 40px; height: 40px; }
  .carousel-nav-left { left: 8px; }
  .carousel-nav-right { right: 8px; }
  .carousel-nav svg { width: 20px; height: 20px; }
}

@media (max-width: 480px) {
  .items-grid :deep(.detail-card) {
    flex: 0 0 calc(100vw - 2rem) !important;
    min-width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
  .carousel-nav { width: 36px; height: 36px; }
  .carousel-nav svg { width: 18px; height: 18px; }
}
</style>
