<script setup>
defineProps({
  insights: { type: Object, required: true }, // from useCompareInsights
  itemCount: { type: Number, required: true },
})
</script>

<template>
  <div class="analysis-panel">
    <div class="analysis-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
      Comparison Analysis
    </div>
    <div class="analysis-content">
      <p class="analysis-text">{{ insights.recommendation }}</p>

      <div class="analysis-stats">
        <div class="analysis-stat">
          <span class="analysis-label">Efficiency Range</span>
          <span class="analysis-value">
            {{ insights.minEfficiency.toFixed(1) }}% - {{ insights.maxEfficiency.toFixed(1) }}%
            <span class="analysis-diff">({{ (insights.maxEfficiency - insights.minEfficiency).toFixed(1) }}% difference)</span>
          </span>
        </div>
        <div class="analysis-stat">
          <span class="analysis-label">Cost Range</span>
          <span class="analysis-value gold-text">
            {{ insights.minCost }}g - {{ insights.maxCost }}g
            <span class="analysis-diff">({{ insights.maxCost - insights.minCost }}g difference)</span>
          </span>
        </div>
        <div class="analysis-stat">
          <span class="analysis-label">Average Cost Per Item</span>
          <span class="analysis-value gold-text">{{ (insights.totalCost / itemCount).toFixed(0) }}g</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-panel {
  background: linear-gradient(135deg, var(--bg-elevated), var(--bg-surface));
  border: 2px solid var(--accent-lead);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--accent-lead);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.analysis-header svg { width: 24px; height: 24px; }

.analysis-text { color: var(--fg-primary); font-size: 0.9375rem; line-height: 1.7; margin-bottom: 1.5rem; }

.analysis-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.analysis-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.analysis-label {
  color: var(--fg-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.analysis-value { color: var(--fg-primary); font-size: 1.125rem; font-weight: 700; }

.analysis-value.gold-text {
  color: var(--accent-lead);
  font-family: 'Monaco', 'Courier New', monospace;
}

.analysis-diff { color: var(--fg-muted); font-size: 0.8125rem; font-weight: 500; }

@media (max-width: 768px) {
  .analysis-stats { grid-template-columns: 1fr; }
}
</style>
