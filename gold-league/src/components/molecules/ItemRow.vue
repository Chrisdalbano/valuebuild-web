<script setup>
import { computed } from 'vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import SelectCheckbox from '@/components/atoms/SelectCheckbox.vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import ItemTooltip from './ItemTooltip.vue'
import { itemTier } from '@/utils/itemHelpers'

const props = defineProps({
  item: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  selecting: { type: Boolean, default: false },
})

defineEmits(['toggle', 'image-failed'])

const tierLabel = computed(() => itemTier(props.item).label)
</script>

<template>
  <tr
    @click="$emit('toggle', item)"
    :class="{ selected, selecting }"
    class="table-row-with-tooltip"
  >
    <td class="td-checkbox">
      <SelectCheckbox :checked="selected" @toggle="$emit('toggle', item)" />
    </td>
    <td class="td-item">
      <div class="item-info">
        <ItemIcon :item-id="item.id" :alt="item.id" class="item-icon" @failed="$emit('image-failed', $event)" />
        <div class="item-details">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-tier-label">{{ tierLabel }}</span>
        </div>
      </div>
    </td>
    <td class="td-efficiency">
      <EfficiencyBadge :value="item.goldEfficiency" />
    </td>
    <td class="td-cost"><GoldValue :amount="item.cost" /></td>
    <td class="td-value"><GoldValue :amount="item.totalGoldValue" /></td>
    <td class="td-rating">
      <EfficiencyBadge :value="item.goldEfficiency" variant="rating" />
      <ItemTooltip :item="item" class="table-row-tooltip" />
    </td>
  </tr>
</template>

<style scoped>
tr {
  border-bottom: 1px solid var(--border);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

tr:hover { background: var(--bg-elevated); }

tr.selected {
  background: color-mix(in srgb, var(--accent-lead) 10%, transparent);
  border-left: 4px solid var(--accent-lead);
}

td { padding: 1rem; color: var(--fg-primary); }

.td-checkbox { width: 50px; text-align: center; }

.item-info { display: flex; align-items: center; gap: 0.75rem; }

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
}

.item-details { display: flex; flex-direction: column; gap: 0.25rem; }
.item-name { font-weight: 600; }
.item-tier-label { font-size: 0.75rem; color: var(--fg-muted); }

.td-efficiency, .td-cost, .td-value, .td-rating { font-weight: 600; }
.td-efficiency { text-align: center; width: 150px; }
.td-cost { text-align: right; width: 120px; }
.td-value { text-align: right; width: 120px; }
.td-rating { text-align: center; width: 120px; position: relative; }

/* Row tooltip positioning (content styles live in ItemTooltip) */
.table-row-tooltip {
  position: absolute;
  top: -1rem;
  right: 100%;
  margin-right: 1rem;
  transform: translateX(0);
  background: var(--bg-canvas);
  border: 2px solid var(--accent-lead);
  border-radius: var(--radius-lg);
  padding: 1rem;
  width: 320px;
  max-width: 90vw;
  z-index: 99999 !important;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0s linear 0.15s;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.9),
    0 0 0 1px color-mix(in srgb, var(--accent-lead) 30%, transparent);
  display: block !important;
}

.table-row-with-tooltip:hover .table-row-tooltip {
  opacity: 1 !important;
  visibility: visible !important;
  transition: opacity 0.15s ease;
  display: block !important;
}

@media (max-width: 768px) {
  td { padding: 0.75rem 0.5rem; font-size: 0.8125rem; }
  .item-icon { width: 32px; height: 32px; }
  .item-name { font-size: 0.875rem; }
  .item-tier-label { font-size: 0.6875rem; }
  .td-efficiency { width: auto; }
  .td-cost, .td-value { display: none; /* Hide on mobile to save space */ }
  .td-rating { width: auto; }
}
</style>
