<script setup>
import { useRouter } from 'vue-router'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import ItemHoverCard from './ItemHoverCard.vue'

const props = defineProps({
  builds: { type: Array, required: true },
  allItems: { type: Array, default: () => [] },
})

const router = useRouter()

function resolveAll(ids) {
  return (ids || []).map(id => props.allItems.find(i => i.id === id)).filter(Boolean)
}
function tryBuild(ids) {
  const valid = resolveAll(ids).map(i => i.id)
  if (valid.length) router.push({ path: '/builds', query: { b: valid.join(',') } })
}
</script>

<template>
  <section v-if="builds.length" class="research-section">
    <h3 class="research-h3">Experimental Builds <span class="hyp">try these</span></h3>
    <div class="build-grid">
      <article v-for="(b, i) in builds" :key="i" class="exp-build">
        <div class="exp-title">{{ b.title }}</div>
        <div class="exp-items">
          <ItemHoverCard v-for="item in resolveAll(b.itemIds)" :key="item.id" :item="item" :mobile-tap="false">
            <ItemIcon :item="item" size="lg" :alt="item.name" class="exp-icon" />
          </ItemHoverCard>
        </div>
        <p class="exp-rationale">{{ b.rationale }}</p>
        <button class="btn-try" :disabled="resolveAll(b.itemIds).length === 0" @click="tryBuild(b.itemIds)">
          Try this build
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.research-section { margin-bottom: 3rem; }
.research-h3 { display: flex; align-items: center; gap: 0.625rem; color: var(--fg-primary); font-size: 1.375rem; font-weight: 700; margin-bottom: 1.5rem; }
.hyp { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-warm); background: color-mix(in srgb, var(--accent-warm) 15%, transparent); padding: 0.2rem 0.5rem; border-radius: 999px; }

.build-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }

.exp-build {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.exp-title { color: var(--fg-primary); font-weight: 700; font-size: 1.0625rem; margin-bottom: 1rem; }

.exp-items { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.exp-icon { border: 1px solid var(--border-strong); }

.exp-rationale { color: var(--fg-secondary); font-size: 0.875rem; line-height: 1.6; margin: 0 0 1.25rem; flex: 1; }

.btn-try {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--accent-lead);
  color: var(--accent-lead-foreground);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-try:hover:not(:disabled) { background: var(--accent-lead-press); transform: translateY(-1px); }
.btn-try:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-try svg { width: 16px; height: 16px; }

@media (prefers-reduced-motion: reduce) { .btn-try { transition: none; } }
</style>
