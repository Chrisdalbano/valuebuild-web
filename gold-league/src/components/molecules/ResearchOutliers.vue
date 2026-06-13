<script setup>
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import ItemHoverCard from './ItemHoverCard.vue'
import { useItemDetail } from '@/composables/useItemDetail'

const props = defineProps({
  outliers: { type: Array, required: true },
  allItems: { type: Array, default: () => [] },
})

const { openDetail } = useItemDetail()

function resolve(id) {
  return props.allItems.find(i => i.id === id) || null
}
function onOpen(id) {
  const item = resolve(id)
  if (item) openDetail(item)
}
</script>

<template>
  <section v-if="outliers.length" class="research-section">
    <h3 class="research-h3">Mispriced Items <span class="hyp">hypotheses</span></h3>
    <div class="outlier-grid">
      <article
        v-for="(o, i) in outliers"
        :key="i"
        class="outlier-card"
        :class="o.direction"
        @click="onOpen(o.itemId)"
      >
        <div class="outlier-head">
          <ItemHoverCard v-if="resolve(o.itemId)" :item="resolve(o.itemId)" :mobile-tap="false">
            <ItemIcon :item="resolve(o.itemId)" size="md" :alt="o.name" />
          </ItemHoverCard>
          <div class="outlier-name">{{ o.name }}</div>
          <span class="dir-badge" :class="o.direction">{{ o.direction }}</span>
        </div>
        <p class="outlier-claim">{{ o.claim }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.research-section { margin-bottom: 3rem; }
.research-h3 { display: flex; align-items: center; gap: 0.625rem; color: var(--fg-primary); font-size: 1.375rem; font-weight: 700; margin-bottom: 1.5rem; }
.hyp { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-support); background: var(--accent-support-tint); padding: 0.2rem 0.5rem; border-radius: 999px; }

.outlier-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }

.outlier-card {
  padding: 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.outlier-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); }
.outlier-card.undervalued { border-left-color: var(--eff-positive); }
.outlier-card.undervalued:hover { border-color: var(--eff-positive); }
.outlier-card.overvalued { border-left-color: var(--eff-negative); }
.outlier-card.overvalued:hover { border-color: var(--eff-negative); }

.outlier-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.outlier-name { flex: 1; color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; }

.dir-badge {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
}
.dir-badge.undervalued { color: var(--eff-positive); background: color-mix(in srgb, var(--eff-positive) 15%, transparent); }
.dir-badge.overvalued { color: var(--eff-negative); background: color-mix(in srgb, var(--eff-negative) 15%, transparent); }

.outlier-claim { color: var(--fg-secondary); font-size: 0.875rem; line-height: 1.6; margin: 0; }

@media (prefers-reduced-motion: reduce) { .outlier-card { transition: none; } }
</style>
