<script setup>
defineProps({
  recommendation: { type: String, required: true },
  synergies: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="build-recommendations">
    <div class="analysis-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <h4>Build Insights</h4>
    </div>
    <div class="recommendation-content">
      <p>{{ recommendation }}</p>
      <div v-if="synergies.length > 0" class="synergies">
        <strong>Synergies:</strong>
        <ul>
          <li v-for="(synergy, idx) in synergies" :key="idx">{{ synergy }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.build-recommendations {
  background: var(--bg-surface);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--accent-lead);
  font-weight: 700;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.analysis-header svg { width: 20px; height: 20px; }
.analysis-header h4 { margin: 0; font-size: 1rem; }

.recommendation-content p { color: var(--fg-secondary); line-height: 1.6; margin-bottom: 1rem; }

.synergies {
  background: var(--bg-elevated);
  padding: 1rem;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-lead);
}

.synergies strong { color: var(--accent-lead); display: block; margin-bottom: 0.75rem; }
.synergies ul { margin: 0; padding-left: 1.25rem; }
.synergies li { color: var(--fg-secondary); margin-bottom: 0.5rem; line-height: 1.5; }
</style>
