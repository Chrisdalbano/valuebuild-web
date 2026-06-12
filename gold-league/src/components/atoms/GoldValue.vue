<script setup>
defineProps({
  amount: { type: [Number, String], required: true },
})
</script>

<template>
  <span class="gold-value">{{ amount }}g</span>
</template>

<style scoped>
.gold-value {
  color: var(--accent-lead);
  font-family: 'Monaco', 'Courier New', monospace;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
