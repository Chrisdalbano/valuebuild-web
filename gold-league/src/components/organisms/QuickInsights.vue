<script setup>
import { ref, useTemplateRef } from 'vue'
import FlashCompareCard from '../molecules/FlashCompareCard.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

const props = defineProps({
  comparisons: { type: Array, required: true },
  goldIconUrl: { type: String, required: true },
})

defineEmits(['shuffle', 'load-comparison'])

const isMobile = useIsMobile()
const currentIndex = ref(0)
const carouselContainer = useTemplateRef('carouselContainer')

function scrollCarousel(direction) {
  if (!carouselContainer.value) return
  const cardWidth = carouselContainer.value.querySelector('.insight-card')?.offsetWidth || 0
  const scrollAmount = cardWidth + 24 // 1.5rem gap
  if (direction === 'left' && currentIndex.value > 0) {
    currentIndex.value--
    carouselContainer.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else if (direction === 'right' && currentIndex.value < props.comparisons.length - 1) {
    currentIndex.value++
    carouselContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="quick-insights">
    <div class="insights-header">
      <div>
        <h2><span class="icon-flash"></span> Flash Comparisons</h2>
        <p class="insights-subtitle">Popular matchups, priced side by side.</p>
      </div>
      <button @click="$emit('shuffle')" class="btn-shuffle" title="Shuffle comparisons">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3"/>
        </svg>
        Shuffle
      </button>
    </div>

    <div class="insights-grid" ref="carouselContainer">
      <button v-if="isMobile && comparisons.length > 1" @click="scrollCarousel('left')"
        class="carousel-nav carousel-nav-left" :disabled="currentIndex === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button v-if="isMobile && comparisons.length > 1" @click="scrollCarousel('right')"
        class="carousel-nav carousel-nav-right" :disabled="currentIndex === comparisons.length - 1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <FlashCompareCard
        v-for="(comp, index) in comparisons"
        :key="index"
        :comparison="comp"
        :gold-icon-url="goldIconUrl"
        @load-comparison="$emit('load-comparison', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.quick-insights {
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 5%, transparent),
    color-mix(in srgb, var(--accent-warm) 5%, transparent));
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid var(--border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.insights-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

.quick-insights h2 {
  color: var(--accent-lead);
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.insights-subtitle { color: var(--fg-secondary); font-size: 0.875rem; margin: 0; }

.icon-flash {
  width: 2rem;
  height: 2rem;
  background-image: url('https://ddragon.leagueoflegends.com/cdn/15.19.1/img/spell/SummonerFlash.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.btn-shuffle {
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  color: var(--fg-primary);
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

.btn-shuffle svg { width: 16px; height: 16px; }
.btn-shuffle:hover { background: var(--accent-lead); border-color: var(--accent-lead); color: var(--bg-canvas); }

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--z-raised);
  background: var(--bg-canvas);
  border: 2px solid var(--accent-lead);
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

.carousel-nav:hover:not(:disabled) { background: var(--accent-lead); transform: translateY(-50%) scale(1.1); }
.carousel-nav:disabled { opacity: 0.3; cursor: not-allowed; border-color: var(--border-strong); }
.carousel-nav svg { width: 24px; height: 24px; color: var(--accent-lead); }
.carousel-nav:hover:not(:disabled) svg { color: var(--bg-canvas); }
.carousel-nav-left { left: -22px; }
.carousel-nav-right { right: -22px; }

@media (max-width: 768px) {
  .quick-insights { padding: 1.5rem 1rem; }
  .insights-grid {
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
  .insights-grid::-webkit-scrollbar { display: none; }
  .insights-grid :deep(.insight-card) {
    flex: 0 0 calc(100vw - 3rem) !important;
    min-width: calc(100vw - 3rem) !important;
    max-width: calc(100vw - 3rem) !important;
    scroll-snap-align: center; scroll-snap-stop: always;
  }
  .carousel-nav { display: flex; width: 40px; height: 40px; }
  .carousel-nav-left { left: 8px; }
  .carousel-nav-right { right: 8px; }
  .carousel-nav svg { width: 20px; height: 20px; }
  .insights-header { flex-direction: column; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
  .quick-insights h2 { font-size: 1.5rem; }
  .btn-shuffle { width: 100%; justify-content: center; }
}

@media (max-width: 480px) {
  .insights-grid :deep(.insight-card) {
    flex: 0 0 calc(100vw - 2rem) !important;
    min-width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
  .carousel-nav { width: 36px; height: 36px; }
  .carousel-nav svg { width: 18px; height: 18px; }
}
</style>
