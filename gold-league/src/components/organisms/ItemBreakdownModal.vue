<script setup>
import { computed } from 'vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import BreakdownRecipe from '../molecules/BreakdownRecipe.vue'
import BreakdownStatAnalysis from '../molecules/BreakdownStatAnalysis.vue'
import BreakdownUpgrades from '../molecules/BreakdownUpgrades.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import { getCombineCost } from '@/utils/itemHelpers'

const props = defineProps({
  item: { type: Object, default: null },
  allItems: { type: Array, default: () => [] },
})

defineEmits(['close', 'select'])

const components = computed(() => {
  if (!props.item?.from) return []
  return props.item.from.map(id => props.allItems.find(i => i.id === id)).filter(Boolean)
})

const buildsInto = computed(() => {
  if (!props.item?.into) return []
  return props.item.into.map(id => props.allItems.find(i => i.id === id)).filter(Boolean)
})

// Legacy modal-specific taxonomy + 6-tier rating label, kept verbatim
const tierLabel = computed(() => {
  const item = props.item
  if (item.cost < 500) return 'Basic Item'
  if (components.value.length > 0 && item.cost < 1200) return 'Component'
  if (item.cost >= 2000) return 'Legendary Item'
  return 'Epic Item'
})

function efficiencyRating(efficiency) {
  if (efficiency >= 120) return 'Outstanding'
  if (efficiency >= 110) return 'Excellent'
  if (efficiency >= 100) return 'Good'
  if (efficiency >= 90) return 'Fair'
  if (efficiency >= 80) return 'Below Average'
  return 'Poor'
}

function sanitizeHtml(html) {
  return html
    .replace(/<br>/gi, '<br/>')
    .replace(/<passive>/gi, '<strong class="passive-tag">PASSIVE:</strong>')
    .replace(/<active>/gi, '<strong class="active-tag">ACTIVE:</strong>')
    .replace(/<unique>/gi, '<strong class="unique-tag">UNIQUE:</strong>')
    .replace(/<stats>/gi, '<div class="stats-tag">')
    .replace(/<\/stats>/gi, '</div>')
}
</script>

<template>
  <div v-if="item" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="item-breakdown">
        <div class="breakdown-header">
          <div class="item-main">
            <ItemIcon :item="item" size="hero" :alt="item.name" class="item-icon-xl" :lazy="false" />
            <div>
              <h2>{{ item.name }}</h2>
              <span class="item-tier">{{ tierLabel }}</span>
            </div>
          </div>
          <button @click="$emit('close')" class="btn-close">×</button>
        </div>

        <div class="stats-overview">
          <div class="stat-card primary">
            <div class="stat-label">Gold Efficiency</div>
            <EfficiencyBadge :value="item.goldEfficiency" class="stat-value" />
            <div class="stat-rating">{{ efficiencyRating(item.goldEfficiency) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Cost</div>
            <GoldValue :amount="item.cost" class="stat-value" />
          </div>
          <div class="stat-card">
            <div class="stat-label">Gold Value</div>
            <GoldValue :amount="item.totalGoldValue" class="stat-value" />
          </div>
          <div class="stat-card">
            <div class="stat-label">Combine Cost</div>
            <div class="stat-value">{{ getCombineCost(item) }}g</div>
          </div>
        </div>

        <BreakdownRecipe v-if="components.length > 0" :item="item" :components="components" @select="$emit('select', $event)" />

        <BreakdownStatAnalysis v-if="item.statBreakdown" :item="item" />

        <div v-if="item.description" class="description-section">
          <h3>Item Effects</h3>
          <div class="description-content" v-html="sanitizeHtml(item.description)"></div>
        </div>

        <BreakdownUpgrades v-if="buildsInto.length > 0" :upgrades="buildsInto" @select="$emit('select', $event)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 2rem;
  overflow-y: auto;
}

.modal-content { max-width: 1200px; width: 100%; max-height: 90vh; overflow-y: auto; background: var(--bg-canvas); border-radius: var(--radius-lg); padding: 0; }

.item-breakdown { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 2rem; margin: 2rem 0; border: 1px solid var(--border); }

.breakdown-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }

.item-main { display: flex; align-items: center; gap: 1.5rem; }

.item-icon-xl { width: 80px; height: 80px; border-radius: var(--radius-md); border: 2px solid var(--border-strong); box-shadow: var(--shadow-lg); }

.item-main h2 { font-size: 1.75rem; color: var(--fg-primary); margin-bottom: 0.5rem; }

.item-tier {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: color-mix(in srgb, var(--accent-lead) 15%, transparent);
  color: var(--accent-lead);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--fg-secondary);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.btn-close:hover { background: var(--bg-elevated); color: var(--fg-primary); }

.stats-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }

.stat-card { background: var(--bg-elevated); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border); text-align: center; }

.stat-card.primary {
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 10%, transparent),
    color-mix(in srgb, var(--accent-warm) 10%, transparent));
  border-color: color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.stat-label { font-size: 0.75rem; color: var(--fg-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; font-weight: 600; }

.stat-value { display: block; font-size: 1.75rem; font-weight: 700; color: var(--fg-primary); margin-bottom: 0.25rem; }

.stat-rating { font-size: 0.875rem; color: var(--fg-secondary); }

.description-section { margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-elevated); border-radius: var(--radius-md); border: 1px solid var(--border); }

.description-section h3 { color: var(--fg-primary); margin-bottom: 1.5rem; font-size: 1.125rem; font-weight: 600; }

.description-content { color: var(--fg-secondary); line-height: 1.6; font-size: 0.875rem; }

.description-content :deep(.passive-tag),
.description-content :deep(.active-tag),
.description-content :deep(.unique-tag) { color: var(--accent-lead); font-weight: 700; margin-right: 0.5rem; }
</style>
