<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import ItemStatsCard from './ItemStatsCard.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

// The "extend into the parent" mechanic: wraps any anchor (default: ItemIcon)
// and floats THE ItemStatsCard from it. Teleported to <body> and positioned
// by floating-ui, so it never fights overflow clipping or local z-index.
const props = defineProps({
  item: { type: Object, required: true },
  size: { type: String, default: 'md' }, // forwarded to the default ItemIcon
  placement: { type: String, default: 'top' },
  disabled: { type: Boolean, default: false },
  // disable tap-to-open when the anchor lives inside a clickable row/card
  // (mobile tap should perform the parent action, not open the popover)
  mobileTap: { type: Boolean, default: true },
})

const isMobile = useIsMobile()
const open = ref(false)
const anchor = ref(null)
const card = ref(null)

const { floatingStyles } = useFloating(anchor, card, {
  placement: computed(() => props.placement),
  middleware: [offset(10), flip({ padding: 12 }), shift({ padding: 12 })],
  whileElementsMounted: autoUpdate,
})

let intentTimer = null

function show() {
  if (props.disabled || isMobile.value) return
  clearTimeout(intentTimer)
  intentTimer = setTimeout(() => (open.value = true), 150) // hover intent
}

function hide() {
  clearTimeout(intentTimer)
  open.value = false
}

function onTap(e) {
  if (props.disabled || !isMobile.value || !props.mobileTap) return
  e.stopPropagation()
  open.value = !open.value
}

onBeforeUnmount(() => clearTimeout(intentTimer))
</script>

<template>
  <span
    ref="anchor"
    class="hover-anchor"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
    @click="onTap"
  >
    <slot>
      <ItemIcon :item="item" :size="size" :alt="item.name" />
    </slot>
  </span>

  <teleport to="body">
    <div v-if="open && isMobile" class="card-scrim" @click.stop="open = false"></div>
    <transition name="statscard">
      <div v-if="open" ref="card" class="floating-card" :style="isMobile ? undefined : floatingStyles" @click.stop>
        <ItemStatsCard :item="item" />
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.hover-anchor { display: inline-flex; min-width: 0; }

.floating-card {
  z-index: var(--z-popover);
  pointer-events: auto;
}

/* mobile: centered sheet over a scrim instead of anchored float */
@media (max-width: 768px) {
  .floating-card {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    max-height: 80vh;
    overflow-y: auto;
    border-radius: var(--radius-lg);
  }
}

.card-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  z-index: var(--z-scrim);
}

.statscard-enter-active { transition: opacity var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard); }
.statscard-leave-active { transition: opacity var(--dur-instant) var(--ease-exit); }
.statscard-enter-from { opacity: 0; transform: scale(0.96); }
.statscard-leave-to { opacity: 0; }

@media (max-width: 768px) {
  /* transform is the centering mechanism on mobile — animate opacity only */
  .statscard-enter-from { transform: translate(-50%, -50%) scale(0.96); }
}

@media (prefers-reduced-motion: reduce) {
  .statscard-enter-active, .statscard-leave-active { transition: none; }
}
</style>
