<script setup lang="ts">
import { useTemplateRef, watch, onMounted, useId } from "vue";
import VgButton from "./VgButton.vue";
defineProps<{ title: string }>();
const model = defineModel<boolean>({ required: true });
const dialog = useTemplateRef<HTMLDialogElement>("dialog");
const id = useId();
function sync() {
  if (model.value && !dialog.value?.open) dialog.value?.showModal();
  else if (!model.value && dialog.value?.open) dialog.value.close();
}
// Keep Tab within the modal, including when the browser would focus its chrome.
function trapFocus(event: KeyboardEvent) {
  if (event.key !== "Tab" || !dialog.value) return;
  const controls = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) => element.getClientRects().length > 0 && element.tabIndex >= 0,
  );
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
onMounted(sync);
watch(model, sync);
</script>
<template>
  <dialog
    ref="dialog"
    class="vg-dialog"
    :aria-labelledby="id"
    @keydown="trapFocus"
    @cancel="model = false"
    @close="model = false"
    @click="$event.target === dialog && (model = false)"
  >
    <div class="inner">
      <header>
        <h2 :id="id">{{ title }}</h2>
        <VgButton
          variant="ghost"
          size="sm"
          aria-label="Close dialog"
          @click="model = false"
          >&#10005;</VgButton
        >
      </header>
      <slot />
      <footer v-if="$slots.footer"><slot name="footer" /></footer>
    </div>
  </dialog>
</template>
<style scoped>
.vg-dialog {
  width: min(520px, calc(100% - 32px));
  padding: 0;
  border: 1px solid var(--vg-border);
  background: var(--vg-surface);
  color: var(--vg-text);
  max-height: 85vh;
}
.vg-dialog::backdrop {
  background: rgb(0 0 0 / 0.75);
  backdrop-filter: blur(4px);
}
.inner {
  padding: 28px;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
h2 {
  font: 600 34px var(--vg-font-display);
  text-transform: uppercase;
  margin: 0;
}
footer {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
</style>
