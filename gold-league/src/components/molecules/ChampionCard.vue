<script setup>
import { useChampions } from '@/composables/useChampions'

const props = defineProps({
  champion: { type: Object, required: true },
})
defineEmits(['select'])

const { iconById } = useChampions()
const icon = () => iconById(props.champion.id, props.champion.patch)
</script>

<template>
  <button class="champion-card" @click="$emit('select', champion)" :title="champion.name">
    <span class="champ-portrait-wrap">
      <img
        v-if="icon()"
        :src="icon()"
        :alt="champion.name"
        class="champ-portrait"
        loading="lazy"
        @error="e => (e.target.style.visibility = 'hidden')"
      />
    </span>
    <span class="champ-name">{{ champion.name }}</span>
    <span v-if="champion.tags && champion.tags.length" class="champ-tag">{{ champion.tags[0] }}</span>
  </button>
</template>

<style scoped>
.champion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.champion-card:hover { transform: translateY(-3px); border-color: var(--accent-lead); box-shadow: var(--shadow-md); }

.champ-portrait-wrap {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
}
.champ-portrait { width: 100%; height: 100%; object-fit: cover; display: block; }

.champ-name { color: var(--fg-primary); font-size: 0.8125rem; font-weight: 600; text-align: center; line-height: 1.2; }
.champ-tag {
  color: var(--accent-support); font-size: 0.625rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.04em; background: var(--accent-support-tint); padding: 0.0625rem 0.5rem; border-radius: 999px;
}

@media (prefers-reduced-motion: reduce) { .champion-card { transition: none; } }
</style>
