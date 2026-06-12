<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import FlashCompareItem from './FlashCompareItem.vue'

const props = defineProps({
  comparison: { type: Array, required: true },
  goldIconUrl: { type: String, default: '' },
})

const emit = defineEmits(['load-comparison'])
const router = useRouter()

const avgEfficiency = computed(
  () => props.comparison.reduce((sum, i) => sum + i.goldEfficiency, 0) / props.comparison.length
)

const winner = computed(() =>
  props.comparison.reduce((best, item) => (item.goldEfficiency > best.goldEfficiency ? item : best), props.comparison[0])
)

const efficiencyDiff = computed(() => {
  if (props.comparison.length < 2) return 0
  const sorted = [...props.comparison].sort((a, b) => b.goldEfficiency - a.goldEfficiency)
  return (sorted[0].goldEfficiency - sorted[1].goldEfficiency).toFixed(1)
})

const recommendation = computed(() => {
  const diff = efficiencyDiff.value
  if (diff > 20) return `${winner.value.name} dominates with ${diff}% better efficiency!`
  if (diff > 10) return `${winner.value.name} edges ahead by ${diff}% - solid choice`
  if (diff > 5) return `Close matchup! ${winner.value.name} leads by ${diff}%`
  return `Nearly identical value - choose based on your build`
})

function viewFullAnalysis() {
  router.push('/compare')
  emit('load-comparison', props.comparison)
}
</script>

<template>
  <div class="insight-card" @click="$emit('load-comparison', comparison)">
    <div class="insight-header">
      <div class="insight-badge">Quick Compare</div>
      <EfficiencyBadge :value="avgEfficiency" :decimals="0" prefix="Avg " class="insight-avg" />
    </div>

    <div class="comparison-verdict">
      <div class="verdict-winner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="verdict-icon">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
        <span>{{ winner.name }}</span>
        <span class="verdict-badge winner">+{{ efficiencyDiff }}%</span>
      </div>
    </div>

    <div class="insight-items">
      <FlashCompareItem
        v-for="(item, idx) in comparison"
        :key="item.id"
        :item="item"
        :winner="item.id === winner.id"
        :show-vs="idx < comparison.length - 1"
        :gold-icon-url="goldIconUrl"
      />
    </div>

    <div class="quick-recommendation">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rec-icon">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
      </svg>
      <span>{{ recommendation }}</span>
    </div>

    <button class="insight-btn" @click.stop="viewFullAnalysis">
      View Full Analysis
      <span class="btn-arrow">→</span>
    </button>
  </div>
</template>

<style scoped>
.insight-card { background: var(--bg-surface); border: 2px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }

.insight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent,
    color-mix(in srgb, var(--accent-lead) 10%, transparent), transparent);
  transition: left 0.5s;
}

.insight-card:hover::before { left: 100%; }

.insight-card:hover { border-color: var(--accent-lead); transform: translateY(-4px); box-shadow: 0 12px 32px color-mix(in srgb, var(--accent-lead) 20%, transparent); }

.insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }

.insight-badge { background: color-mix(in srgb, var(--accent-lead) 15%, transparent); color: var(--accent-lead); padding: 0.375rem 0.875rem; border-radius: 2rem; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid color-mix(in srgb, var(--accent-lead) 30%, transparent); }

.insight-avg { font-size: 1.25rem; font-weight: 700; padding: 0.375rem 0.875rem; border-radius: var(--radius-md); background: var(--bg-elevated); }

.insight-items { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }

.comparison-verdict {
  margin-bottom: 1.25rem;
  padding: 0.875rem;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--fb-success) 10%, transparent),
    color-mix(in srgb, var(--eff-positive) 5%, transparent));
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--fb-success) 20%, transparent);
}

.verdict-winner { display: flex; align-items: center; gap: 0.625rem; color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; }
.verdict-icon { width: 20px; height: 20px; color: var(--fb-success); flex-shrink: 0; }

.verdict-badge {
  margin-left: auto;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--fb-success) 20%, transparent);
  color: var(--fb-success);
  border: 1px solid color-mix(in srgb, var(--fb-success) 30%, transparent);
}

.quick-recommendation { display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.875rem; background: color-mix(in srgb, var(--fb-info) 10%, transparent); border: 1px solid color-mix(in srgb, var(--fb-info) 20%, transparent); border-radius: var(--radius-md); margin-bottom: 1.25rem; }

.rec-icon { width: 18px; height: 18px; color: var(--fb-info); flex-shrink: 0; margin-top: 2px; }
.quick-recommendation span { color: var(--fg-secondary); font-size: 0.8125rem; line-height: 1.5; font-style: italic; }

.insight-btn { width: 100%; background: linear-gradient(135deg, var(--accent-lead), var(--accent-warm)); color: white; border: none; padding: 0.875rem 1.5rem; border-radius: var(--radius-md); font-weight: 700; font-size: 0.9375rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.625rem; box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-lead) 30%, transparent); }

.btn-arrow { font-size: 1.25rem; font-weight: bold; transition: transform 0.3s; }
.insight-card:hover .btn-arrow { transform: translateX(4px); }

@media (max-width: 768px) {
  .insight-card { padding: 1.25rem; }
}

@media (max-width: 480px) {
  .insight-card { padding: 1rem; }
  .verdict-winner { font-size: 0.875rem; flex-wrap: wrap; }
  .quick-recommendation span { font-size: 0.75rem; }
}
</style>
