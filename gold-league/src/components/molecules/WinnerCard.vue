<script setup>
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'

defineProps({
  winner: { type: Object, required: true },
  gap: { type: Number, required: true },
})
</script>

<template>
  <div class="insight-card winner">
    <div class="insight-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
      <span>Most Efficient</span>
    </div>
    <div class="insight-winner">
      <ItemIcon :item="winner" size="xl" :alt="winner.name" class="winner-icon" />
      <div class="winner-info">
        <div class="winner-name">{{ winner.name }}</div>
        <EfficiencyBadge :value="winner.goldEfficiency" :decimals="1" suffix=" Efficient" class="winner-eff" />
        <div class="winner-stats">
          <span class="winner-stat">{{ winner.cost }}g cost</span>
          <span class="winner-stat">{{ winner.totalGoldValue }}g value</span>
        </div>
      </div>
    </div>
    <div class="insight-comparison">
      <span class="comparison-label">Beats next best by:</span>
      <EfficiencyBadge :value="gap" :decimals="1" prefix="+" class="comparison-value" />
    </div>
  </div>
</template>

<style scoped>
.insight-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  transition: all 0.2s;
}

.insight-card:hover {
  border-color: var(--accent-lead);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.insight-card.winner {
  border-color: var(--accent-lead);
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 10%, transparent),
    color-mix(in srgb, var(--accent-warm) 5%, transparent));
  box-shadow: 0 0 28px color-mix(in srgb, var(--accent-lead) 16%, transparent);
  animation: winner-breathe 3.2s ease-in-out infinite;
}

@keyframes winner-breathe {
  0%, 100% { box-shadow: 0 0 22px color-mix(in srgb, var(--accent-lead) 12%, transparent); }
  50% { box-shadow: 0 0 34px color-mix(in srgb, var(--accent-lead) 22%, transparent); }
}

@media (prefers-reduced-motion: reduce) {
  .insight-card.winner { animation: none; }
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--fg-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.insight-header svg { width: 16px; height: 16px; }

.insight-winner {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.winner-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  border: 2px solid var(--accent-lead);
  object-fit: contain;
  background: var(--bg-surface);
}

.winner-info { flex: 1; }

.winner-name {
  color: var(--fg-primary);
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.375rem;
}

.winner-eff {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.winner-stats { display: flex; gap: 1rem; }
.winner-stat { color: var(--fg-muted); font-size: 0.75rem; }

.insight-comparison {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
}

.comparison-label { color: var(--fg-secondary); font-size: 0.8125rem; font-weight: 500; }
.comparison-value { font-size: 1.125rem; font-weight: 700; }
</style>
