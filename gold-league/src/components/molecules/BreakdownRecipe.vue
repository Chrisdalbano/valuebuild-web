<script setup>
import { computed } from 'vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import { getCombineCost } from '@/utils/itemHelpers'

const props = defineProps({
  item: { type: Object, required: true },
  components: { type: Array, required: true },
})

defineEmits(['select'])

const componentsCost = computed(() =>
  props.components.reduce((sum, comp) => sum + (comp.cost || 0), 0)
)
</script>

<template>
  <div class="recipe-section">
    <h3>Recipe & Cost Analysis</h3>
    <div class="recipe-tree">
      <div class="components-list">
        <div v-for="comp in components" :key="comp.id" class="component-card" @click="$emit('select', comp)">
          <ItemIcon :item="comp" size="lg" :alt="comp.name" class="component-icon" />
          <div class="component-info">
            <div class="component-name">{{ comp.name }}</div>
            <GoldValue :amount="comp.cost" class="component-cost" />
            <EfficiencyBadge :value="comp.goldEfficiency" class="component-efficiency" />
          </div>
        </div>
      </div>
      <div class="recipe-arrow">→</div>
      <div class="final-item">
        <ItemIcon :item="item" size="lg" :alt="item.name" class="component-icon" />
        <div class="component-info">
          <div class="component-name">{{ item.name }}</div>
          <GoldValue :amount="item.cost" class="component-cost" />
        </div>
      </div>
    </div>

    <div class="cost-breakdown">
      <div class="cost-row"><span>Components Total:</span><GoldValue :amount="componentsCost" /></div>
      <div class="cost-row"><span>Combine Cost:</span><GoldValue :amount="getCombineCost(item)" /></div>
      <div class="cost-row total"><span>Final Cost:</span><GoldValue :amount="item.cost" /></div>
    </div>
  </div>
</template>

<style scoped>
.recipe-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.recipe-section h3 { color: var(--fg-primary); margin-bottom: 1.5rem; font-size: 1.125rem; font-weight: 600; }

.recipe-tree { display: flex; align-items: center; gap: 2rem; margin-bottom: 1.5rem; flex-wrap: wrap; }

.components-list { display: flex; gap: 1rem; flex-wrap: wrap; }

.component-card {
  background: var(--bg-surface);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.component-card:hover { border-color: var(--accent-lead); transform: translateY(-2px); box-shadow: var(--shadow-md); }

.component-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
}

.component-info { text-align: center; width: 100%; }
.component-name { font-size: 0.75rem; color: var(--fg-primary); font-weight: 500; margin-bottom: 0.25rem; }
.component-cost { font-size: 0.875rem; font-weight: 600; }
.component-efficiency { display: block; font-size: 0.75rem; font-weight: 600; }

.recipe-arrow { font-size: 2rem; color: var(--accent-lead); font-weight: bold; }

.final-item {
  background: var(--bg-surface);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--accent-lead);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
}

.cost-breakdown {
  background: var(--bg-surface);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.cost-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
}

.cost-row:last-child { border-bottom: none; }

.cost-row.total {
  font-weight: 700;
  font-size: 1rem;
  color: var(--fg-primary);
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid var(--border-strong);
}
</style>
