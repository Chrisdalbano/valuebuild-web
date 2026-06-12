<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { prefersReducedMotion } from '@/composables/useRevealOnce'

// Faint drifting gold particles behind hero content. Compositor-cheap canvas:
// pauses when off-screen or the tab is hidden; static dots under reduced motion.
const props = defineProps({
  count: { type: Number, default: 36 },
  opacity: { type: Number, default: 0.35 },
})

const canvas = useTemplateRef('canvas')
let ctx, particles = [], raf = null, running = false, observer = null

function size() {
  const el = canvas.value
  const { clientWidth: w, clientHeight: h } = el.parentElement
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = w * dpr
  el.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { w, h }
}

function seed(w, h) {
  particles = Array.from({ length: props.count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.6 + Math.random() * 1.6,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.12,
    a: 0.25 + Math.random() * 0.75,
  }))
}

function draw(w, h) {
  ctx.clearRect(0, 0, w, h)
  const gold = getComputedStyle(canvas.value).color // currentColor = --accent-lead
  for (const p of particles) {
    ctx.globalAlpha = p.a * props.opacity
    ctx.fillStyle = gold
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function tick() {
  if (!running) return
  const { clientWidth: w, clientHeight: h } = canvas.value.parentElement
  for (const p of particles) {
    p.x = (p.x + p.vx + w) % w
    p.y = (p.y + p.vy + h) % h
  }
  draw(w, h)
  raf = requestAnimationFrame(tick)
}

function start() {
  if (running || prefersReducedMotion()) return
  running = true
  raf = requestAnimationFrame(tick)
}

function stop() {
  running = false
  cancelAnimationFrame(raf)
}

function onVisibility() {
  document.hidden ? stop() : start()
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  const { w, h } = size()
  seed(w, h)
  draw(w, h) // static frame (this is all reduced-motion users get)

  observer = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0 }
  )
  observer.observe(canvas.value)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', onResize)
})

function onResize() {
  const { w, h } = size()
  seed(w, h)
  draw(w, h)
}

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <canvas ref="canvas" class="particles-bg" aria-hidden="true"></canvas>
</template>

<style scoped>
.particles-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--accent-lead);
  pointer-events: none;
}
</style>
