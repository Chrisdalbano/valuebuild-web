<script setup>
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import SelectCheckbox from '@/components/atoms/SelectCheckbox.vue'
import TierPill from '@/components/atoms/TierPill.vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import ItemTooltip from './ItemTooltip.vue'

defineProps({
  item: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  selecting: { type: Boolean, default: false },
  // mobile tap-tooltip state (owned by the explorer)
  tooltipActive: { type: Boolean, default: false },
  // hover tooltip is desktop-only
  showTooltip: { type: Boolean, default: true },
})

defineEmits(['toggle', 'image-failed', 'close-tooltip'])
</script>

<template>
  <div
    @click="$emit('toggle', item)"
    :class="['item-card', { selected, selecting, 'tooltip-active': tooltipActive }]"
  >
    <div class="card-header">
      <ItemIcon :item-id="item.id" :alt="item.name" class="card-img" @failed="$emit('image-failed', $event)" />
      <div class="card-checkbox">
        <SelectCheckbox :checked="selected" @toggle="$emit('toggle', item)" />
      </div>
      <TierPill :item="item" class="card-badge" />
    </div>

    <div class="card-body">
      <h4 class="card-title">{{ item.name }}</h4>

      <div class="card-stats">
        <div class="stat-main">
          <span class="stat-label">Efficiency</span>
          <EfficiencyBadge :value="item.goldEfficiency" class="stat-value" />
        </div>
        <div class="stat-row">
          <span class="stat-label">Cost</span>
          <GoldValue :amount="item.cost" class="stat-value" />
        </div>
        <div class="stat-row">
          <span class="stat-label">Value</span>
          <GoldValue :amount="item.totalGoldValue" class="stat-value" />
        </div>
      </div>

      <EfficiencyBadge :value="item.goldEfficiency" variant="rating" class="card-rating" />
    </div>

    <ItemTooltip
      v-if="showTooltip"
      :item="item"
      :closable="tooltipActive"
      class="item-hover-tooltip"
      @close="$emit('close-tooltip')"
    />
  </div>
</template>

<style scoped>
.item-card {
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: visible;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.item-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3); border-color: var(--accent-lead); }

.item-card.selected {
  border-color: var(--accent-lead);
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 10%, transparent),
    color-mix(in srgb, var(--p-rust-500) 10%, transparent));
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent-lead) 30%, transparent),
    inset 0 0 20px color-mix(in srgb, var(--accent-lead) 10%, transparent);
}

.item-card.selecting { animation: selectPulse 0.4s ease; }

@keyframes selectPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

.card-header {
  position: relative;
  aspect-ratio: 1;
  background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.card-img { width: 64px; height: 64px; object-fit: contain; transition: transform 0.3s; }
.item-card:hover .card-img { transform: scale(1.1); }

.card-checkbox { position: absolute; top: 0.75rem; right: 0.75rem; z-index: 2; }

.card-badge { position: absolute; bottom: 0.75rem; left: 0.75rem; }

.card-body { padding: 1rem; }

.card-title { color: var(--fg-primary); font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; line-height: 1.3; min-height: 2.6em; }

.card-stats { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }

.stat-main { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-elevated); border-radius: var(--radius-sm); }

.stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
.stat-label { color: var(--fg-muted); font-size: 0.75rem; font-weight: 500; }
.stat-value { font-weight: 700; font-size: 0.875rem; }
.stat-main .stat-value { font-size: 1.125rem; }

/* Hover tooltip positioning (content styles live in ItemTooltip) */
.item-hover-tooltip {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(10px, 0);
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

@media (min-width: 769px) {
  .item-card:hover .item-hover-tooltip {
    opacity: 1 !important;
    visibility: visible !important;
    transition: opacity 0.15s ease;
    display: block !important;
  }
}

.item-card.tooltip-active .item-hover-tooltip {
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: all !important;
}

@media (max-width: 768px) {
  .item-hover-tooltip {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    transform: translate(-50%, -50%) !important;
    width: calc(100vw - 2rem) !important;
    max-width: 380px !important;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 99999 !important;
  }
  .item-card.tooltip-active::before {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99998;
    backdrop-filter: blur(4px);
  }
  .item-card:hover .item-hover-tooltip { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }
  .item-card:hover { transform: none !important; }
  .item-card.tooltip-active .item-hover-tooltip { opacity: 1 !important; visibility: visible !important; }
}

@media (max-width: 480px) {
  .item-hover-tooltip { width: calc(100vw - 1rem) !important; }
}
</style>
