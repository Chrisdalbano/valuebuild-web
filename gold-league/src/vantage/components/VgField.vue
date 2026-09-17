<script setup lang="ts">
import { useId } from "vue";
defineOptions({ inheritAttrs: false });
defineProps<{
  label: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "search" | "email";
}>();
const model = defineModel<string>({ required: true });
const id = useId();
</script>
<template>
  <div class="vg-field">
    <label :for="id">{{ label }}</label
    ><input
      :id="id"
      v-model="model"
      v-bind="$attrs"
      :type="type || 'text'"
      :disabled="disabled"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="hint || error ? id + '-hint' : undefined"
    /><small v-if="hint || error" :id="id + '-hint'" :class="{ error }">{{
      error || hint
    }}</small>
  </div>
</template>
<style scoped>
.vg-field {
  display: grid;
  gap: 9px;
}
label {
  font: 11px var(--vg-font-mono);
  color: var(--vg-muted);
}
input {
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  border: 1px solid var(--vg-border);
  border-radius: var(--vg-radius);
  background: var(--vg-field-bg);
  color: var(--vg-text);
}
input:focus {
  border-color: var(--vg-accent);
}
input[aria-invalid="true"] {
  border-color: var(--vg-accent);
}
small {
  font-size: 11px;
  color: var(--vg-muted);
}
.error {
  color: var(--vg-accent);
}
input:disabled {
  opacity: 0.5;
}
</style>
