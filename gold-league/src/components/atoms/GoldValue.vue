<script setup>
defineProps({
  amount: { type: [Number, String], required: true },
})
</script>

<template>
  <span class="gold-value">{{ amount }}g</span>
</template>

<style scoped>
/* element+class: outranks parent single-class color overrides regardless of
   style-injection order (e.g. .analysis-value in GoldAnalysisCard) */
span.gold-value {
  color: var(--accent-lead);
  font-family: 'Monaco', 'Courier New', monospace;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
