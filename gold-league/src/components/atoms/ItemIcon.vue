<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { getValidatedItemImageUrl, getItemImageUrlFallback } from '@/api/items'

// THE item image. Every item icon in the app renders through this atom:
// ETL-validated URL (correct patch) → CommunityDragon → gold glyph placeholder,
// lazy-loaded with a token shimmer until the pixels arrive.
const props = defineProps({
  // Full item object preferred (uses backend-validated imageUrl).
  // A bare string id is accepted for legacy call sites.
  item: { type: [Object, String], required: true },
  size: { type: String, default: 'md' }, // sm 32 / md 40 / lg 48 / xl 56 / hero 64
  alt: { type: String, default: '' },
  // set false for above-the-fold icons that must not wait for the observer
  lazy: { type: Boolean, default: true },
})

const emit = defineEmits(['failed', 'loaded'])

const itemId = computed(() =>
  typeof props.item === 'string' ? props.item : props.item?.id
)

const STAGES = { VALIDATED: 0, CDRAGON: 1, DEAD: 2 }
const stage = ref(STAGES.VALIDATED)
const loaded = ref(false)
const visible = ref(!props.lazy)

const src = computed(() => {
  if (stage.value === STAGES.VALIDATED) return getValidatedItemImageUrl(props.item)
  if (stage.value === STAGES.CDRAGON) return getItemImageUrlFallback(String(itemId.value))
  return null
})

watch(itemId, () => {
  stage.value = STAGES.VALIDATED
  loaded.value = false
})

function onError() {
  if (stage.value === STAGES.VALIDATED) {
    stage.value = STAGES.CDRAGON
  } else {
    stage.value = STAGES.DEAD
    emit('failed', itemId.value)
  }
}

function onLoad() {
  loaded.value = true
  emit('loaded', itemId.value)
}

const root = useTemplateRef('root')
let observer = null

onMounted(() => {
  if (!props.lazy || visible.value) return
  if (!('IntersectionObserver' in window)) {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    entries => {
      if (entries.some(e => e.isIntersecting)) {
        visible.value = true
        observer.disconnect()
        observer = null
      }
    },
    { rootMargin: '200px' }
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => observer && observer.disconnect())
</script>

<template>
  <span ref="root" class="item-icon" :class="[`size-${size}`, { loaded }]">
    <span v-if="!loaded" class="icon-skeleton" aria-hidden="true"></span>
    <img
      v-if="visible && src"
      :src="src"
      :alt="alt || String(itemId)"
      class="icon-img"
      loading="lazy"
      decoding="async"
      @load="onLoad"
      @error="onError"
    />
    <span v-else-if="stage === 2" class="icon-dead" aria-hidden="true">◆</span>
  </span>
</template>

<style scoped>
.item-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
}

.size-sm { width: 32px; height: 32px; }
.size-md { width: 40px; height: 40px; }
.size-lg { width: 48px; height: 48px; }
.size-xl { width: 56px; height: 56px; }
.size-hero { width: 64px; height: 64px; }

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-standard);
}

.item-icon.loaded .icon-img { opacity: 1; }
.item-icon.loaded .icon-skeleton { display: none; }

.icon-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    var(--accent-lead-tint) 0%,
    color-mix(in srgb, var(--accent-lead) 22%, transparent) 50%,
    var(--accent-lead-tint) 100%);
  background-size: 200% 100%;
  animation: icon-shimmer 1.4s ease-in-out infinite;
}

@keyframes icon-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.icon-dead {
  color: var(--accent-lead);
  opacity: 0.35;
  font-size: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .icon-skeleton { animation: none; background: var(--accent-lead-tint); }
  .icon-img { transition: none; }
}
</style>
