<script setup>
import { ref } from 'vue'
import ItemHoverCard from './ItemHoverCard.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import BorderBeam from '@/components/atoms/BorderBeam.vue'
import SelectCheckbox from '@/components/atoms/SelectCheckbox.vue'
import TierPill from '@/components/atoms/TierPill.vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import { useItemDetail } from '@/composables/useItemDetail'

const { openDetail } = useItemDetail()

// the floating stats popover is anchored at the icon, but the WHOLE card is the
// hover trigger (manualTrigger mode) so hovering anywhere on the card opens it
const hoverCard = ref(null)

defineProps({
  item: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  selecting: { type: Boolean, default: false },
  // gold beam for the top-efficiency items in the current view
  beam: { type: Boolean, default: false },
})

defineEmits(['toggle', 'image-failed'])

// pointer-tracked spotlight (CSS vars only — paints a small card, no layout)
const spot = ref({ x: '50%', y: '50%' })
function onPointerMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  spot.value = { x: `${e.clientX - rect.left}px`, y: `${e.clientY - rect.top}px` }
}
</script>

<template>
  <div
    @click="$emit('toggle', item)"
    @pointermove="onPointerMove"
    @mouseenter="hoverCard?.show()"
    @mouseleave="hoverCard?.hide()"
    :class="['item-card', { selected, selecting }]"
    :style="{ '--spot-x': spot.x, '--spot-y': spot.y }"
  >
    <BorderBeam v-if="beam" :duration="7" />
    <span class="spotlight" aria-hidden="true"></span>
    <div class="card-header">
      <ItemHoverCard ref="hoverCard" :item="item" :mobile-tap="false" manual-trigger>
        <ItemIcon :item="item" size="hero" :alt="item.name" class="card-img" @failed="$emit('image-failed', $event)" />
      </ItemHoverCard>
      <div class="card-checkbox">
        <SelectCheckbox :checked="selected" @toggle="$emit('toggle', item)" />
      </div>
      <button class="card-details" title="Full breakdown" aria-label="Full breakdown" @click.stop="openDetail(item)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
        </svg>
      </button>
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
    color-mix(in srgb, var(--accent-warm) 10%, transparent));
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent-lead) 30%, transparent),
    inset 0 0 20px color-mix(in srgb, var(--accent-lead) 10%, transparent);
}

.item-card.selecting { animation: selectPulse 0.4s ease; }

@keyframes selectPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

/* pointer-tracked gold sheen */
.spotlight {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-standard);
  background: radial-gradient(220px circle at var(--spot-x) var(--spot-y),
    color-mix(in srgb, var(--accent-lead) 14%, transparent), transparent 65%);
  z-index: var(--z-raised);
}

.item-card:hover .spotlight { opacity: 1; }

@media (prefers-reduced-motion: reduce), (hover: none) {
  .spotlight { display: none; }
}

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

.card-img { background: transparent; transition: transform 0.3s; }
.item-card:hover .card-img { transform: scale(1.1); }

.card-checkbox { position: absolute; top: 0.75rem; right: 0.75rem; z-index: var(--z-raised); }

.card-details {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: var(--z-raised);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--bg-canvas) 60%, transparent);
  border: 1px solid var(--border);
  color: var(--fg-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-standard), color 0.2s, border-color 0.2s;
  backdrop-filter: blur(4px);
}

.card-details svg { width: 15px; height: 15px; }
.item-card:hover .card-details { opacity: 1; }
.card-details:hover { color: var(--accent-lead); border-color: var(--accent-lead); }

.card-badge { position: absolute; bottom: 0.75rem; left: 0.75rem; }

@media (hover: none) { .card-details { opacity: 1; } }

.card-body { padding: 1rem; }

.card-title { color: var(--fg-primary); font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; line-height: 1.3; min-height: 2.6em; }

.card-stats { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }

.stat-main { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-elevated); border-radius: var(--radius-sm); }

.stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
.stat-label { color: var(--fg-muted); font-size: 0.75rem; font-weight: 500; }
.stat-value { font-weight: 700; font-size: 0.875rem; }
.stat-main .stat-value { font-size: 1.125rem; }

@media (prefers-reduced-motion: reduce) {
  .item-card, .card-img { transition: none; }
  .item-card.selecting { animation: none; }
}
</style>
