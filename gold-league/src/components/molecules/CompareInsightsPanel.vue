<script setup>
import WinnerCard from './WinnerCard.vue'
import EffBarsCard from './EffBarsCard.vue'
import GoldAnalysisCard from './GoldAnalysisCard.vue'
import ComplexityCard from './ComplexityCard.vue'

defineProps({
  items: { type: Array, required: true },
  insights: { type: Object, required: true }, // from useCompareInsights
})
</script>

<template>
  <div class="insights-section">
    <div class="insights-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
      Quick Insights
    </div>

    <div class="insights-grid">
      <WinnerCard v-if="insights.bestEfficiency" :winner="insights.bestEfficiency" :gap="insights.efficiencyGap" />
      <EffBarsCard :items="items" />
      <GoldAnalysisCard
        :total-cost="insights.totalCost"
        :total-value="insights.totalValue"
        :net-gain="insights.netGain"
        :avg-cost="insights.avgCost"
      />
      <ComplexityCard
        :items-with-components="insights.itemsWithComponents.length"
        :total-components="insights.totalComponents"
        :avg-build-cost="insights.avgBuildCost"
      />
    </div>
  </div>
</template>

<style scoped>
.insights-section {
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid var(--border);
}

.insights-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--accent-lead);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
}

.insights-header svg { width: 24px; height: 24px; }

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .insights-grid { grid-template-columns: 1fr; }
}
</style>
