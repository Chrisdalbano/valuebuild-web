<script setup lang="ts">
defineProps<{ label: string; value: string; detail?: string }>();
</script>
<template>
  <div class="vg-stat">
    <span>{{ label }}</span
    ><strong>{{ value }}</strong
    ><small v-if="detail">{{ detail }}</small>
  </div>
</template>
<style scoped>
.vg-stat {
  display: grid;
  gap: 10px;
}
.vg-stat span {
  font: 10px var(--vg-font-mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--vg-muted);
}
strong {
  font: 600 44px/1 var(--vg-font-display);
  font-variant-numeric: tabular-nums;
}
small {
  font-size: 11px;
  color: var(--vg-muted);
}
</style>
