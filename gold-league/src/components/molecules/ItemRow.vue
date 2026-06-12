<script setup>
import { computed } from 'vue'
import ItemHoverCard from './ItemHoverCard.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import SelectCheckbox from '@/components/atoms/SelectCheckbox.vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
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
  <tr @click="$emit('toggle', item)" :class="{ selected, selecting }">
    <td class="td-checkbox">
      <SelectCheckbox :checked="selected" @toggle="$emit('toggle', item)" />
    </td>
    <td class="td-item">
      <div class="item-info">
        <ItemHoverCard :item="item" placement="right" :mobile-tap="false">
          <ItemIcon :item="item" size="md" :alt="item.name" class="item-icon-frame" @failed="$emit('image-failed', $event)" />
        </ItemHoverCard>
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

.item-icon-frame { border: 1px solid var(--border-strong); }

.item-details { display: flex; flex-direction: column; gap: 0.25rem; }
.item-name { font-weight: 600; }
.item-tier-label { font-size: 0.75rem; color: var(--fg-muted); }

.td-efficiency, .td-cost, .td-value, .td-rating { font-weight: 600; }
.td-efficiency { text-align: center; width: 150px; }
.td-cost { text-align: right; width: 120px; }
.td-value { text-align: right; width: 120px; }
.td-rating { text-align: center; width: 120px; }

@media (max-width: 768px) {
  td { padding: 0.75rem 0.5rem; font-size: 0.8125rem; }
  .item-name { font-size: 0.875rem; }
  .item-tier-label { font-size: 0.6875rem; }
  .td-efficiency { width: auto; }
  .td-cost, .td-value { display: none; /* Hide on mobile to save space */ }
  .td-rating { width: auto; }
}
</style>
