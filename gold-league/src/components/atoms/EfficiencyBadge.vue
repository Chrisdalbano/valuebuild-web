<script setup>
import { ref, computed, watch, useTemplateRef } from 'vue'
import { efficiencyTier } from '@/utils/itemHelpers'
import { useRevealOnce, prefersReducedMotion } from '@/composables/useRevealOnce'

// THE efficiency verdict. The % counts up on first reveal (the number is the
// product — it should feel alive), instant under reduced motion.
const props = defineProps({
  value: { type: Number, required: true },
  // 'text' = colored percentage, 'rating' = tinted pill with the verdict label,
  // 'label' = plain colored verdict word
  variant: { type: String, default: 'text' },
  decimals: { type: Number, default: null }, // null = render value as-is
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  animated: { type: Boolean, default: true },
})

const el = useTemplateRef('el')
const tier = computed(() => efficiencyTier(props.value))
const classes = computed(() => [
  props.variant === 'rating' ? 'eff-rating' : 'eff-text',
  `tier-${tier.value.key}`,
])

const animDecimals = computed(() =>
  props.decimals !== null ? props.decimals : props.value % 1 === 0 ? 0 : 2
)

const isText = computed(() => props.variant !== 'rating' && props.variant !== 'label')
const shown = ref(props.animated && isText.value ? 0 : props.value)
const revealed = ref(false)
let raf = null

function animateTo(target, from) {
  cancelAnimationFrame(raf)
  if (prefersReducedMotion() || !props.animated) {
    shown.value = target
    return
  }
  const start = performance.now()
  const duration = 700
  const step = now => {
    const t = Math.min(1, (now - start) / duration)
    shown.value = from + (target - from) * (1 - Math.pow(1 - t, 3))
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

useRevealOnce(el, () => {
  revealed.value = true
  if (isText.value) animateTo(props.value, 0)
})

watch(() => props.value, (val, old) => {
  if (!isText.value) return
  if (revealed.value) animateTo(val, old)
  else shown.value = props.animated ? shown.value : val
})

const display = computed(() => {
  if (props.decimals !== null) return shown.value.toFixed(props.decimals)
  // value-as-is rendering once settled; fixed precision while rolling
  return shown.value === props.value ? String(props.value) : shown.value.toFixed(animDecimals.value)
})
</script>

<template>
  <span ref="el" :class="classes">
    <template v-if="variant === 'rating' || variant === 'label'">{{ tier.label }}</template>
    <template v-else>{{ prefix }}{{ display }}%{{ suffix }}</template>
  </span>
</template>

<style scoped>
.eff-text { font-weight: inherit; font-variant-numeric: tabular-nums; }

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
