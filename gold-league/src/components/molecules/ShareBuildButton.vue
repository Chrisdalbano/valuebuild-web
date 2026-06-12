<script setup>
import { ref } from 'vue'

const props = defineProps({
  url: { type: Function, required: true }, // () => canonical share URL
})

const state = ref('idle') // idle | copied | error
let resetTimer = null

async function copy() {
  clearTimeout(resetTimer)
  try {
    await navigator.clipboard.writeText(props.url())
    state.value = 'copied'
  } catch {
    state.value = 'error'
  }
  resetTimer = setTimeout(() => (state.value = 'idle'), 1800)
}
</script>

<template>
  <button @click="copy" class="btn-share" :class="state" :title="url()">
    <svg v-if="state === 'idle'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
    <svg v-else-if="state === 'copied'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
    {{ state === 'copied' ? 'Link copied!' : state === 'error' ? 'Copy failed' : 'Share Build' }}
  </button>
</template>

<style scoped>
.btn-share {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-lead);
  border: 1px solid var(--accent-lead);
  border-radius: var(--radius-md);
  color: var(--bg-canvas);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-share svg { width: 18px; height: 18px; }

.btn-share:hover { background: var(--accent-lead-press); border-color: var(--accent-lead-press); transform: translateY(-2px); }

.btn-share.copied { background: var(--fb-success); border-color: var(--fb-success); color: white; }
.btn-share.error { background: var(--fb-error); border-color: var(--fb-error); color: white; }

@media (prefers-reduced-motion: reduce) {
  .btn-share { transition: none; }
}
</style>
