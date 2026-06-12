<script setup>
import { computed } from 'vue'
import { itemTier } from '@/utils/itemHelpers'

const props = defineProps({
  item: { type: Object, required: true },
})

const tier = computed(() => itemTier(props.item))
</script>

<template>
  <span class="tier-pill" :class="tier.key">{{ tier.label }}</span>
</template>

<style scoped>
.tier-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tier-pill.legendary {
  background: color-mix(in srgb, var(--tier-legendary) 90%, transparent);
  color: var(--bg-canvas);
}

.tier-pill.epic {
  background: color-mix(in srgb, var(--tier-epic) 90%, transparent);
  color: white;
}

.tier-pill.component {
  background: color-mix(in srgb, var(--tier-component) 90%, transparent);
  color: white;
}

.tier-pill.basic {
  background: color-mix(in srgb, var(--tier-basic) 90%, transparent);
  color: white;
}
</style>
