<script setup>
defineEmits(['add'])
</script>

<template>
  <div class="single-item-view">
    <div class="single-item-message">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="message-icon">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
      </svg>
      <h3>Add More Items to Compare</h3>
      <p>You need at least 2 items to see detailed comparisons, charts, and insights</p>
      <button @click="$emit('add')" class="btn-add-first">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add Another Item
      </button>
    </div>
  </div>
</template>

<style scoped>
.single-item-view {
  background: var(--bg-surface);
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-xl);
  padding: 4rem 2rem;
  margin: 2rem 0;
}

.single-item-message { text-align: center; max-width: 500px; margin: 0 auto; }

.message-icon { width: 64px; height: 64px; color: var(--accent-lead); margin: 0 auto 1.5rem; opacity: 0.8; }

.single-item-message h3 { color: var(--fg-primary); font-size: 1.5rem; margin: 0 0 0.75rem 0; font-weight: 700; }

.single-item-message p { color: var(--fg-secondary); font-size: 1rem; margin: 0 0 2rem 0; line-height: 1.6; }

.btn-add-first {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: var(--accent-lead);
  color: var(--bg-canvas);
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.btn-add-first svg { width: 20px; height: 20px; }

.btn-add-first:hover {
  background: var(--accent-lead-press);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--accent-lead) 40%, transparent);
}
</style>
