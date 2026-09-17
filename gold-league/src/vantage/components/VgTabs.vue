<script setup lang="ts">
import { useId } from "vue";
const props = defineProps<{
  label: string;
  options: readonly { value: string; label: string }[];
}>();
const model = defineModel<string>({ required: true });
const id = useId();
function navigate(e: KeyboardEvent, index: number) {
  let target = index;
  if (e.key === "ArrowRight") target = (index + 1) % props.options.length;
  else if (e.key === "ArrowLeft")
    target = (index - 1 + props.options.length) % props.options.length;
  else if (e.key === "Home") target = 0;
  else if (e.key === "End") target = props.options.length - 1;
  else return;
  e.preventDefault();
  model.value = props.options[target].value;
  (
    (e.currentTarget as HTMLElement).parentElement?.children[
      target
    ] as HTMLElement
  )?.focus();
}
</script>
<template>
  <div class="vg-tabs">
    <div role="tablist" :aria-label="label" class="tablist">
      <button
        v-for="(option, i) in options"
        :id="id + '-' + option.value"
        :key="option.value"
        type="button"
        role="tab"
        :aria-selected="model === option.value"
        :aria-controls="id + '-panel'"
        :tabindex="model === option.value ? 0 : -1"
        @click="model = option.value"
        @keydown="navigate($event, i)"
      >
        {{ option.label }}
      </button>
    </div>
    <div
      :id="id + '-panel'"
      role="tabpanel"
      :aria-labelledby="id + '-' + model"
      tabindex="0"
    >
      <slot :value="model" />
    </div>
  </div>
</template>
<style scoped>
.tablist {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid var(--vg-border);
  margin-bottom: 24px;
  overflow-x: auto;
}
.tablist button {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 14px 0;
  color: var(--vg-muted);
  white-space: nowrap;
  font-size: 12px;
}
.tablist button[aria-selected="true"] {
  border-color: var(--vg-accent);
  color: var(--vg-text);
}
</style>
