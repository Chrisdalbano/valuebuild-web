<script setup lang="ts">
withDefaults(
  defineProps<{ tone?: "neutral" | "positive" | "warning" | "accent" }>(),
  { tone: "neutral" },
);
</script>
<template>
  <span class="vg-badge" :class="tone"
    ><span aria-hidden="true">&#9670;</span><slot
  /></span>
</template>
<style scoped>
.vg-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font: 10px var(--vg-font-mono);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--vg-muted);
}
.positive {
  color: var(--vg-positive);
}
.warning {
  color: var(--vg-warning);
}
.accent {
  color: var(--vg-accent);
}
</style>
