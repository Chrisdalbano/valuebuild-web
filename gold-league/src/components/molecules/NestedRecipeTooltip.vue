<script setup>
import { computed } from 'vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import { getItemImageUrl } from '@/api/items'
import { getComponents, getComponentsCost, getCombineCost, imgPlaceholderOnError } from '@/utils/itemHelpers'

const props = defineProps({
  component: { type: Object, required: true },
  allItems: { type: Array, required: true },
})

const subComponents = computed(() => getComponents(props.component, props.allItems))
</script>

<template>
  <div class="nested-recipe-tooltip">
    <div class="nested-recipe-header">
      <img :src="getItemImageUrl(component.id)" :alt="component.name" class="nested-icon" @error="imgPlaceholderOnError" />
      <div>
        <div class="nested-name">{{ component.name }}</div>
        <GoldValue :amount="component.cost" class="nested-cost" />
      </div>
    </div>
    <div class="nested-recipe-components">
      <div v-for="subComp in subComponents" :key="subComp.id" class="nested-comp-item">
        <img :src="getItemImageUrl(subComp.id)" :alt="subComp.name" class="nested-comp-icon" @error="imgPlaceholderOnError" />
        <div class="nested-comp-info">
          <div class="nested-comp-name">{{ subComp.name }}</div>
          <GoldValue :amount="subComp.cost" class="nested-comp-cost" />
        </div>
      </div>
    </div>
    <div class="nested-recipe-summary">
      <span>Components:</span><GoldValue :amount="getComponentsCost(component, allItems)" />
      <span>+</span>
      <span>Combine:</span><GoldValue :amount="getCombineCost(component)" />
    </div>
  </div>
</template>

<style scoped>
.nested-recipe-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: var(--bg-canvas);
  border: 2px solid var(--accent-lead);
  border-radius: var(--radius-lg);
  padding: 1rem;
  width: 280px;
  z-index: 1000;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.9),
    0 0 0 1px color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.nested-recipe-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border);
}

.nested-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--accent-lead);
  object-fit: contain;
  background: var(--bg-surface);
}

.nested-name { color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; }
.nested-cost { font-size: 0.875rem; font-weight: 700; }

.nested-recipe-components { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.875rem; }

.nested-comp-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.nested-comp-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  object-fit: contain;
  background: var(--bg-surface);
}

.nested-comp-info { flex: 1; }
.nested-comp-name { color: var(--fg-primary); font-size: 0.8125rem; font-weight: 600; }
.nested-comp-cost { font-size: 0.75rem; font-weight: 700; }

.nested-recipe-summary {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.625rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  justify-content: center;
}
</style>
