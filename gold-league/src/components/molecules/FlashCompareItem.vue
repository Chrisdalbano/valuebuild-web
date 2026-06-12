<script setup>
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import { buildItemImageUrl } from '@/utils/itemHelpers'

defineProps({
  item: { type: Object, required: true },
  winner: { type: Boolean, default: false },
  showVs: { type: Boolean, default: false },
  goldIconUrl: { type: String, default: '' },
})
</script>

<template>
  <div class="insight-item" :class="{ 'is-winner': winner }">
    <div class="item-rank" :class="{ 'rank-winner': winner }">{{ winner ? '👑' : '💠' }}</div>
    <img :src="buildItemImageUrl(item.id)" :alt="item.name" class="insight-item-img" />
    <div class="insight-item-details">
      <div class="insight-item-name">{{ item.name }}</div>
      <div class="insight-item-stats">
        <EfficiencyBadge :value="item.goldEfficiency" class="insight-eff" />
        <span class="insight-cost">
          <img :src="goldIconUrl" alt="gold" class="gold-icon-inline" /> {{ item.cost }}
        </span>
      </div>
      <div class="insight-item-value">
        <span class="value-label">Value:</span>
        <span class="value-amount">{{ item.totalGoldValue }}g</span>
      </div>
    </div>
    <div v-if="showVs" class="insight-vs">VS</div>
  </div>
</template>

<style scoped>
.insight-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: var(--bg-elevated);
  padding: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  position: relative;
  transition: all 0.2s;
}

.insight-item.is-winner {
  border-color: color-mix(in srgb, var(--fb-success) 30%, transparent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--fb-success) 5%, transparent), transparent);
}

.insight-item:hover { border-color: var(--border-strong); background: var(--bg-overlay); }

.item-rank {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: 50%;
  font-size: 0.875rem;
  z-index: 1;
}

.item-rank.rank-winner {
  /* legacy hand-picked greens, kept verbatim */
  background: linear-gradient(135deg, #245536, #10b981);
  border-color: var(--fb-success);
  animation: pulse-winner 2s ease-in-out infinite;
}

@keyframes pulse-winner { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

.insight-item-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border-strong);
  flex-shrink: 0;
}

.insight-item-details { flex: 1; }
.insight-item-name { color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.375rem; }
.insight-item-stats { display: flex; gap: 0.75rem; align-items: center; }
.insight-eff { font-weight: 700; font-size: 0.875rem; }

.insight-cost {
  color: var(--accent-lead);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.875rem;
}

.insight-item-value { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.375rem; font-size: 0.8125rem; }
.value-label { color: var(--fg-muted); font-weight: 500; }
.value-amount { color: var(--accent-lead); font-family: 'Monaco', 'Courier New', monospace; font-weight: 700; }

.insight-vs {
  position: absolute;
  bottom: -0.875rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-lead);
  color: var(--bg-canvas);
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.gold-icon-inline {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
  margin-right: 2px;
}

@media (max-width: 768px) {
  .insight-item-img { width: 48px; height: 48px; }
  .insight-item-name { font-size: 0.875rem; }
  .item-rank { width: 26px; height: 26px; font-size: 0.8125rem; }
}
</style>
