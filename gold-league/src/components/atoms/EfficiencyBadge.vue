<script setup>
import { computed } from 'vue'
import { efficiencyTier } from '@/utils/itemHelpers'

const props = defineProps({
  value: { type: Number, required: true },
  // 'text' = colored percentage, 'rating' = tinted pill with the verdict label
  variant: { type: String, default: 'text' },
})

const tier = computed(() => efficiencyTier(props.value))
const classes = computed(() => [
  props.variant === 'rating' ? 'eff-rating' : 'eff-text',
  `tier-${tier.value.key}`,
])
</script>

<template>
  <span :class="classes">
    <template v-if="variant === 'rating'">{{ tier.label }}</template>
    <template v-else>{{ value }}%</template>
  </span>
</template>

<style scoped>
.eff-text {
  font-weight: inherit;
}

.eff-text.tier-excellent { color: var(--eff-positive); }
.eff-text.tier-good { color: var(--fb-info); }
.eff-text.tier-fair { color: var(--eff-neutral); }
.eff-text.tier-poor { color: var(--eff-negative); }

.eff-rating {
  display: block;
  text-align: center;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.eff-rating.tier-excellent {
  background: color-mix(in srgb, var(--eff-positive) 15%, transparent);
  color: var(--eff-positive);
  border: 1px solid color-mix(in srgb, var(--eff-positive) 30%, transparent);
}

.eff-rating.tier-good {
  background: color-mix(in srgb, var(--fb-info) 15%, transparent);
  color: var(--fb-info);
  border: 1px solid color-mix(in srgb, var(--fb-info) 30%, transparent);
}

.eff-rating.tier-fair {
  background: color-mix(in srgb, var(--eff-neutral) 15%, transparent);
  color: var(--eff-neutral);
  border: 1px solid color-mix(in srgb, var(--eff-neutral) 30%, transparent);
}

.eff-rating.tier-poor {
  background: color-mix(in srgb, var(--eff-negative) 15%, transparent);
  color: var(--eff-negative);
  border: 1px solid color-mix(in srgb, var(--eff-negative) 30%, transparent);
}
</style>
