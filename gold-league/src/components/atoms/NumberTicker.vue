<script setup>
import { ref, watch, useTemplateRef } from 'vue'
import { useRevealOnce, prefersReducedMotion } from '@/composables/useRevealOnce'

// Inspira-style animated number: counts up on first reveal, re-rolls from
// the previous value whenever `value` changes. Instant under reduced motion.
const props = defineProps({
  value: { type: Number, required: true },
  duration: { type: Number, default: 900 }, // ms
  decimals: { type: Number, default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
})

const el = useTemplateRef('el')
const shown = ref(0)
const revealed = ref(false)
let raf = null

function animateTo(target, from = shown.value) {
  cancelAnimationFrame(raf)
  if (prefersReducedMotion()) {
    shown.value = target
    return
  }
  const start = performance.now()
  const step = now => {
    const t = Math.min(1, (now - start) / props.duration)
    const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
    shown.value = from + (target - from) * eased
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

useRevealOnce(el, () => {
  revealed.value = true
  animateTo(props.value, 0)
})

watch(() => props.value, (val, old) => {
  if (revealed.value) animateTo(val, old)
})
</script>

<template>
  <span ref="el" class="number-ticker">{{ prefix }}{{ shown.toFixed(decimals) }}{{ suffix }}</span>
</template>

<style scoped>
.number-ticker { font-variant-numeric: tabular-nums; }
</style>
