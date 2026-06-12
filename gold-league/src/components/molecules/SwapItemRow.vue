<script setup>
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import { getItemImageUrl } from '@/api/items'
import { imgPlaceholderOnError } from '@/utils/itemHelpers'

defineProps({
  item: { type: Object, required: true },
  alreadySelected: { type: Boolean, default: false },
})

defineEmits(['pick'])
</script>

<template>
  <div @click="$emit('pick', item)" class="swap-item" :class="{ 'already-selected': alreadySelected }">
    <img :src="getItemImageUrl(item.id)" :alt="item.name" class="swap-item-img" @error="imgPlaceholderOnError" />
    <div class="swap-item-info">
      <div class="swap-item-name">{{ item.name }}</div>
      <div class="swap-item-stats">
        <EfficiencyBadge :value="item.goldEfficiency" class="swap-item-eff" />
        <GoldValue :amount="item.cost" class="swap-item-cost" />
      </div>
    </div>
    <span v-if="alreadySelected" class="already-in-comparison">✓ In comparison</span>
  </div>
</template>

<style scoped>
.swap-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.swap-item:hover { border-color: var(--accent-lead); background: var(--bg-overlay); transform: translateX(4px); }

.swap-item.already-selected { opacity: 0.5; cursor: not-allowed; }
.swap-item.already-selected:hover { transform: none; border-color: var(--border); }

.swap-item-img {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-strong);
  object-fit: contain;
  background: var(--bg-surface);
  flex-shrink: 0;
}

.swap-item-info { flex: 1; }
.swap-item-name { color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.25rem; }
.swap-item-stats { display: flex; gap: 0.75rem; align-items: center; }
.swap-item-eff { font-weight: 700; font-size: 0.875rem; }
.swap-item-cost { font-size: 0.875rem; font-weight: 600; }

.already-in-comparison { color: var(--fb-success); font-size: 0.8125rem; font-weight: 600; }
</style>
