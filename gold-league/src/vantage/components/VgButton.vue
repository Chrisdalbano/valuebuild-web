<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md";
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  { variant: "primary", size: "md", type: "button" },
);
</script>
<template>
  <button
    class="vg-button"
    :class="[variant, size]"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" /><slot /><slot
      name="trailing"
    />
  </button>
</template>
<style scoped>
.vg-button {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 12px 22px;
  border: 1px solid transparent;
  border-radius: var(--vg-radius);
  background: var(--vg-button-bg);
  color: var(--vg-button-fg);
  font-weight: 600;
  transition: transform var(--vg-duration);
}
.vg-button:hover:not(:disabled) {
  background: var(--vg-accent-hover);
  transform: translateY(-1px);
}
.vg-button:active:not(:disabled) {
  transform: translateY(1px);
}
.secondary {
  background: transparent;
  color: var(--vg-text);
  border-color: var(--vg-border);
}
.ghost {
  background: transparent;
  color: var(--vg-text);
}
.secondary:hover:not(:disabled),
.ghost:hover:not(:disabled) {
  background: var(--vg-raised);
}
.sm {
  min-height: 36px;
  padding: 8px 14px;
  font-size: 12px;
}
.vg-button:disabled {
  opacity: 0.45;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
