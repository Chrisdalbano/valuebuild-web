<script setup>
import { computed } from 'vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import ItemHoverCard from './ItemHoverCard.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import { getComponents, getComponentsCost, getCombineCost } from '@/utils/itemHelpers'

const props = defineProps({
  item: { type: Object, required: true },
  allItems: { type: Array, required: true },
  isMobile: { type: Boolean, default: false },
})

const components = computed(() => getComponents(props.item, props.allItems))
</script>

<template>
  <div v-if="components.length > 0" class="recipe-section">
    <div class="recipe-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
      Recipe
    </div>
    <div class="recipe-components">
      <div v-for="comp in components" :key="comp.id" class="recipe-component">
        <ItemHoverCard :item="comp">
          <ItemIcon :item="comp" size="sm" :alt="comp.name" class="recipe-comp-icon" />
        </ItemHoverCard>
        <div class="recipe-comp-info">
          <div class="recipe-comp-name">{{ comp.name }}</div>
          <GoldValue :amount="comp.cost" class="recipe-comp-cost" />
        </div>
      </div>
      <div class="recipe-arrow">→</div>
      <div class="recipe-final">
        <ItemIcon :item="item" size="sm" :alt="item.name" class="recipe-final-icon" />
        <div class="recipe-final-info">
          <div class="recipe-final-name">{{ item.name }}</div>
          <GoldValue :amount="item.cost" class="recipe-final-cost" />
        </div>
      </div>
    </div>
    <div class="recipe-cost-summary">
      <div class="cost-line"><span>Components Total:</span><GoldValue :amount="getComponentsCost(item, allItems)" /></div>
      <div class="cost-line"><span>Combine Cost:</span><GoldValue :amount="getCombineCost(item)" /></div>
      <div class="cost-line total"><span>Final Cost:</span><GoldValue :amount="item.cost" /></div>
    </div>
  </div>
</template>

<style scoped>
.recipe-section {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.recipe-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-lead);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.recipe-header svg { width: 14px; height: 14px; }

.recipe-components { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }

.recipe-component, .recipe-final {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.recipe-component { position: relative; cursor: help; }

.recipe-final {
  border-color: var(--accent-lead);
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 10%, transparent),
    color-mix(in srgb, var(--accent-warm) 5%, transparent));
}

.recipe-comp-icon, .recipe-final-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  object-fit: contain;
  background: var(--bg-surface);
}

.recipe-final-icon { border-color: var(--accent-lead); }

.recipe-comp-info, .recipe-final-info { display: flex; flex-direction: column; gap: 0.125rem; }
.recipe-comp-name, .recipe-final-name { color: var(--fg-primary); font-size: 0.75rem; font-weight: 600; }
.recipe-comp-cost, .recipe-final-cost { font-size: 0.6875rem; font-weight: 700; }

.recipe-arrow { color: var(--accent-lead); font-size: 1.25rem; font-weight: bold; }

.recipe-cost-summary { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border); }

.cost-line { display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; color: var(--fg-secondary); }
.cost-line.total { font-size: 0.9375rem; font-weight: 700; color: var(--fg-primary); padding-top: 0.5rem; border-top: 1px solid var(--border); }

@media (max-width: 768px) {
  .recipe-components { flex-wrap: wrap; gap: 0.75rem; }
  .recipe-component { flex: 1 1 45%; min-width: 0; }
  .recipe-comp-icon, .recipe-final-icon { width: 32px; height: 32px; }
  .recipe-comp-name, .recipe-final-name { font-size: 0.75rem; }
  .recipe-arrow { display: none; }
}
</style>
