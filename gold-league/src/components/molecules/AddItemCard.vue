<script setup>
defineProps({
  count: { type: Number, required: true },
  max: { type: Number, default: 6 },
})

defineEmits(['add'])
</script>

<template>
  <div @click="$emit('add')" class="detail-card add-item-card">
    <div class="add-item-content">
      <div class="add-item-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <h3>Add Another Item</h3>
      <p>Compare up to {{ max }} items</p>
      <div class="add-item-count">{{ count }} / {{ max }}</div>
    </div>
  </div>
</template>

<style scoped>
.add-item-card {
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 5%, transparent),
    color-mix(in srgb, var(--accent-warm) 5%, transparent));
  border: 2px dashed var(--accent-lead);
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-item-card:hover {
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 10%, transparent),
    color-mix(in srgb, var(--accent-warm) 10%, transparent));
  border-color: var(--accent-lead);
  border-style: solid;
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.add-item-content { text-align: center; padding: 2rem; }

.add-item-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--accent-lead);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.add-item-card:hover .add-item-icon {
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--accent-lead) 40%, transparent);
}

.add-item-icon svg { width: 48px; height: 48px; color: var(--bg-canvas); }

.add-item-content h3 { color: var(--fg-primary); font-size: 1.25rem; margin: 0 0 0.5rem 0; font-weight: 700; }

.add-item-content p { color: var(--fg-secondary); font-size: 0.9375rem; margin: 0 0 1.5rem 0; }

.add-item-count {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--accent-lead);
  font-weight: 700;
  font-size: 0.875rem;
}
</style>
