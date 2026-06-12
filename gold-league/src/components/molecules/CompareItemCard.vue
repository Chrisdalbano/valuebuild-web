<script setup>
import { computed } from 'vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import RecipeSection from './RecipeSection.vue'
import StatBreakdownBars from './StatBreakdownBars.vue'
import { getItemImageUrl } from '@/api/items'
import { itemTier, formatRiotDescription, imgPlaceholderOnError } from '@/utils/itemHelpers'

const props = defineProps({
  item: { type: Object, required: true },
  allItems: { type: Array, required: true },
  isMobile: { type: Boolean, default: false },
})

defineEmits(['remove', 'swap'])

const tierLabel = computed(() => itemTier(props.item).label)
const gain = computed(() => props.item.totalGoldValue - props.item.cost)
const hasBreakdown = computed(
  () => props.item.statBreakdown && Object.keys(props.item.statBreakdown).length > 0
)
</script>

<template>
  <div class="detail-card">
    <button @click="$emit('swap', item)" class="btn-swap-item" title="Swap this item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
      </svg>
    </button>
    <button @click="$emit('remove', item)" class="btn-remove-item" title="Remove from comparison">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>

    <RecipeSection :item="item" :all-items="allItems" :is-mobile="isMobile" />

    <div class="detail-header">
      <img :src="getItemImageUrl(item.id)" :alt="item.name" class="detail-icon" @error="imgPlaceholderOnError" />
      <div class="detail-title">
        <h4>{{ item.name }}</h4>
        <span class="detail-tier">{{ tierLabel }}</span>
      </div>
      <div class="detail-efficiency">
        <EfficiencyBadge :value="item.goldEfficiency" />
      </div>
    </div>

    <div class="detail-stats-grid">
      <div class="detail-stat">
        <span class="stat-label">Cost</span>
        <GoldValue :amount="item.cost" class="stat-value" />
      </div>
      <div class="detail-stat">
        <span class="stat-label">Value</span>
        <GoldValue :amount="item.totalGoldValue" class="stat-value" />
      </div>
      <div class="detail-stat">
        <span class="stat-label">Rating</span>
        <EfficiencyBadge :value="item.goldEfficiency" variant="label" class="stat-value" />
      </div>
      <div class="detail-stat">
        <span class="stat-label">Gain</span>
        <span class="stat-value" :class="gain > 0 ? 'positive' : 'negative'">
          {{ gain > 0 ? '+' : '' }}{{ gain.toFixed(0) }}g
        </span>
      </div>
    </div>

    <StatBreakdownBars v-if="hasBreakdown" :item="item" />

    <div v-if="item.description" class="detail-description">
      <div class="desc-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        Item Effects & Passives
      </div>
      <div class="desc-text" v-html="formatRiotDescription(item.description)"></div>
    </div>
  </div>
</template>

<style scoped>
.detail-card { position: relative; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; transition: all 0.2s; }

.detail-card:hover { border-color: var(--accent-lead); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }

.detail-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); position: relative; }

.detail-icon { width: 56px; height: 56px; border-radius: var(--radius-md); border: 2px solid var(--border-strong); object-fit: contain; background: var(--bg-surface); }

.detail-title { flex: 1; }
.detail-title h4 { color: var(--fg-primary); font-size: 1.125rem; margin: 0 0 0.375rem 0; font-weight: 600; }

.detail-tier { color: var(--accent-lead); font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

.detail-efficiency { font-size: 1.5rem; font-weight: 700; padding: 0.5rem 0.875rem; background: var(--bg-surface); border-radius: var(--radius-md); }

.btn-swap-item, .btn-remove-item {
  position: absolute;
  top: 8px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.btn-swap-item { left: 8px; }
.btn-remove-item { right: 8px; }
.btn-swap-item svg, .btn-remove-item svg { width: 16px; height: 16px; }

.btn-swap-item:hover { background: var(--accent-lead); border-color: var(--accent-lead); color: var(--bg-canvas); transform: scale(1.05); }
.btn-remove-item:hover { background: var(--fb-error); border-color: var(--fb-error); color: white; transform: scale(1.05); }

.detail-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }

.detail-stat { display: flex; flex-direction: column; gap: 0.375rem; padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border); }

.stat-label { color: var(--fg-muted); font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

.stat-value { color: var(--fg-primary); font-size: 1.125rem; font-weight: 700; }
.stat-value.positive { color: var(--fb-success); }
.stat-value.negative { color: var(--fb-error); }

.detail-description { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; }

.desc-label { display: flex; align-items: center; gap: 0.5rem; color: var(--accent-lead); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }

.desc-label svg { width: 14px; height: 14px; }

.desc-text { color: var(--fg-secondary); font-size: 0.8125rem; line-height: 1.7; }
/* Ported as-is: these never matched the v-html content in the legacy file
   either (scoped attr isn't applied to injected HTML). Activating them via
   :deep() is a deliberate Phase 3 polish item, not a structure change. */
.desc-text strong, .desc-text .attention { color: var(--accent-lead); font-weight: 700; }
.desc-text .unique-tag { color: var(--fb-success); font-weight: 600; }
.desc-text .stats-tag { color: var(--fg-primary); font-weight: 600; }
.desc-text br { display: block; content: ""; margin: 0.5rem 0; }
</style>
