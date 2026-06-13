<script setup>
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import ItemHoverCard from './ItemHoverCard.vue'

// A row of item icons (resolved item objects) with an optional "Try this build"
// deep-link. Reused by the champion analysis sections.
const props = defineProps({
  items: { type: Array, required: true },
  tryable: { type: Boolean, default: false },
})
defineEmits(['try'])
</script>

<template>
  <div class="build-item-row">
    <div class="bir-icons">
      <ItemHoverCard v-for="(item, i) in items" :key="`${item.id}-${i}`" :item="item" :mobile-tap="false">
        <ItemIcon :item="item" size="md" :alt="item.name" class="bir-icon" />
      </ItemHoverCard>
      <span v-if="!items.length" class="bir-empty">items unavailable</span>
    </div>
    <button v-if="tryable && items.length" class="bir-try" @click="$emit('try', items.map(i => i.id))">
      Try this build
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  </div>
</template>

<style scoped>
.build-item-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.bir-icons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.bir-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); border: 1px solid var(--border-strong); object-fit: contain; background: var(--bg-surface); }
.bir-empty { color: var(--fg-muted); font-size: 0.8125rem; font-style: italic; }

.bir-try {
  display: inline-flex; align-items: center; gap: 0.4rem; margin-left: auto;
  padding: 0.5rem 0.875rem; background: var(--accent-lead); color: var(--accent-lead-foreground);
  border: none; border-radius: var(--radius-md); font-weight: 700; font-size: 0.8125rem; cursor: pointer;
  transition: background var(--dur-fast) var(--ease-standard);
}
.bir-try:hover { background: var(--accent-lead-press); }
.bir-try svg { width: 14px; height: 14px; }
</style>
