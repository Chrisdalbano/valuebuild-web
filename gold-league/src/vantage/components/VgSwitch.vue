<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean }>();
const model = defineModel<boolean>({ required: true });
</script>
<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :disabled="disabled"
    class="vg-switch"
    @click="model = !model"
  >
    <span class="track" :class="{ on: model }"><span /></span
    ><span>{{ label }}</span>
  </button>
</template>
<style scoped>
.vg-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--vg-text);
  font-size: 12px;
}
.track {
  width: 34px;
  height: 20px;
  background: var(--vg-raised);
  border: 1px solid var(--vg-border);
  padding: 3px;
  flex-shrink: 0;
}
.track span {
  display: block;
  width: 12px;
  height: 12px;
  background: var(--vg-muted);
  transition: transform var(--vg-duration);
}
.on {
  background: var(--vg-accent);
  border-color: var(--vg-accent);
}
.on span {
  background: var(--vg-on-accent);
  transform: translateX(14px);
}
button:disabled {
  opacity: 0.45;
}
</style>
