import { onMounted, onBeforeUnmount } from 'vue'

// One shared IntersectionObserver for all "animate on first reveal" consumers
// (hundreds of badges would otherwise each own an observer).
let shared = null
const callbacks = new WeakMap()

function getObserver() {
  if (!shared) {
    shared = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = callbacks.get(entry.target)
            if (cb) {
              callbacks.delete(entry.target)
              shared.unobserve(entry.target)
              cb()
            }
          }
        }
      },
      { rootMargin: '50px' }
    )
  }
  return shared
}

// Fires `cb` once, the first time elRef enters the viewport.
export function useRevealOnce(elRef, cb) {
  onMounted(() => {
    if (!('IntersectionObserver' in window)) {
      cb()
      return
    }
    const el = elRef.value?.$el ?? elRef.value
    if (!el) return
    callbacks.set(el, cb)
    getObserver().observe(el)
  })

  onBeforeUnmount(() => {
    const el = elRef.value?.$el ?? elRef.value
    if (el && callbacks.has(el)) {
      callbacks.delete(el)
      shared?.unobserve(el)
    }
  })
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
