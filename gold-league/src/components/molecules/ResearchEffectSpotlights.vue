<script setup>
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import ItemHoverCard from './ItemHoverCard.vue'
import { useItemDetail } from '@/composables/useItemDetail'

const props = defineProps({
  spotlights: { type: Array, required: true },
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
  <section v-if="spotlights.length" class="research-section">
    <h3 class="research-h3">Effect Spotlights</h3>
    <div class="spotlight-list">
      <article
        v-for="(s, i) in spotlights"
        :key="i"
        class="spotlight-row"
        @click="onOpen(s.itemId)"
      >
        <ItemHoverCard v-if="resolve(s.itemId)" :item="resolve(s.itemId)" placement="right" :mobile-tap="false">
          <ItemIcon :item="resolve(s.itemId)" size="lg" :alt="s.name" />
        </ItemHoverCard>
        <div class="spotlight-body">
          <div class="spotlight-name">{{ s.name }}</div>
          <p class="spotlight-insight">{{ s.insight }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.research-section { margin-bottom: 3rem; }
.research-h3 { color: var(--fg-primary); font-size: 1.375rem; font-weight: 700; margin-bottom: 1.5rem; }

.spotlight-list { display: flex; flex-direction: column; gap: 1rem; }

.spotlight-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}
.spotlight-row:hover { transform: translateX(4px); border-color: var(--accent-support); }

.spotlight-body { flex: 1; min-width: 0; }
.spotlight-name { color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.25rem; }
.spotlight-insight { color: var(--fg-secondary); font-size: 0.875rem; line-height: 1.6; margin: 0; }

@media (prefers-reduced-motion: reduce) { .spotlight-row { transition: none; } }
</style>
