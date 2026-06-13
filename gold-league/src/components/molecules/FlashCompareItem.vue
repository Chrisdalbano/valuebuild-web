<script setup>
import { computed } from 'vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'

const props = defineProps({
  item: { type: Object, required: true },
  winner: { type: Boolean, default: false },
  showVs: { type: Boolean, default: false },
  goldIconUrl: { type: String, default: '' },
})

// efficiency bar on a 0–150% scale (100% = break-even), coloured by verdict
const barPercent = computed(() => Math.min(100, Math.max(2, (props.item.goldEfficiency / 150) * 100)))
const barColor = computed(() => {
  const e = props.item.goldEfficiency
  if (e >= 100) return 'var(--eff-positive)'
  if (e >= 85) return 'var(--eff-neutral)'
  return 'var(--eff-negative)'
})
</script>

<template>
  <div class="flash-item" :class="{ 'is-winner': winner }">
    <div class="flash-rank" :class="{ 'rank-winner': winner }" aria-hidden="true">
      <svg v-if="winner" viewBox="0 0 24 24" fill="currentColor" class="crown">
        <path d="M5 16L3 5l5.5 4L12 4l3.5 5L21 5l-2 11H5zm0 2h14v2H5v-2z"/>
      </svg>
    </div>
    <ItemIcon :item="item" size="xl" :alt="item.name" class="flash-img" />
    <div class="flash-details">
      <div class="flash-name">{{ item.name }}</div>
      <div class="flash-bar-row">
        <div class="flash-bar-track">
          <div class="flash-bar-fill" :style="{ width: barPercent + '%', background: barColor }"></div>
          <span class="flash-bar-mark" title="break-even"></span>
        </div>
        <EfficiencyBadge :value="item.goldEfficiency" class="flash-eff" />
      </div>
      <div class="flash-meta">
        <span class="flash-meta-cell"><span class="meta-label">Cost</span><GoldValue :amount="item.cost" /></span>
        <span class="flash-meta-cell"><span class="meta-label">Value</span><GoldValue :amount="item.totalGoldValue" /></span>
      </div>
    </div>
    <div v-if="showVs" class="flash-vs">VS</div>
  </div>
</template>

<style scoped>
.flash-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: var(--bg-elevated);
  padding: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  position: relative;
  transition: border-color var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard);
}

.flash-item.is-winner {
  border-color: color-mix(in srgb, var(--accent-lead) 45%, transparent);
  background: linear-gradient(135deg, var(--accent-lead-tint), transparent 70%);
}

.flash-item:hover { border-color: var(--border-strong); background: var(--bg-overlay); }

.flash-rank {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  z-index: 1;
}

.flash-rank.rank-winner {
  background: var(--accent-lead);
  border-color: var(--accent-lead);
  box-shadow: 0 0 0 3px var(--accent-lead-tint);
}
.crown { width: 15px; height: 15px; color: var(--accent-lead-foreground); }

.flash-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  flex-shrink: 0;
  object-fit: contain;
  background: var(--bg-surface);
}

.flash-details { flex: 1; min-width: 0; }
.flash-name { color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.flash-bar-row { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.5rem; }
.flash-bar-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: var(--bg-canvas);
  border-radius: 999px;
  overflow: hidden;
}
.flash-bar-fill { height: 100%; border-radius: 999px; transition: width var(--dur-base) var(--ease-standard); }
/* break-even tick at 100/150 = 66.6% of the track */
.flash-bar-mark { position: absolute; top: -1px; bottom: -1px; left: 66.6%; width: 1px; background: var(--fg-muted); opacity: 0.5; }
.flash-eff { font-weight: 700; font-size: 0.8125rem; flex-shrink: 0; }

.flash-meta { display: flex; gap: 1.25rem; }
.flash-meta-cell { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; font-weight: 700; }
.meta-label { color: var(--fg-muted); font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

.flash-vs {
  position: absolute;
  bottom: -0.875rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-lead);
  color: var(--accent-lead-foreground);
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  z-index: 1;
}

@media (max-width: 768px) {
  .flash-img { width: 48px; height: 48px; }
  .flash-name { font-size: 0.875rem; }
}

@media (prefers-reduced-motion: reduce) {
  .flash-bar-fill { transition: none; }
}
</style>
