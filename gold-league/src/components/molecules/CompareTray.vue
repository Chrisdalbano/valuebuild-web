<script setup>
import TrayItem from './TrayItem.vue'

defineProps({
  items: { type: Array, required: true },
  max: { type: Number, default: 6 },
})

defineEmits(['remove', 'clear', 'compare', 'add-to-build', 'image-failed'])
</script>

<template>
  <transition name="slide-up">
    <div v-if="items.length > 0" class="comparison-tray">
      <div class="tray-content">
        <div class="tray-header">
          <h3>
            <svg class="compare-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            Selected for Comparison
            <span class="count-badge">{{ items.length }}/{{ max }}</span>
          </h3>
          <button @click="$emit('clear')" class="btn-clear-inline" title="Clear all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="tray-items">
          <TrayItem
            v-for="item in items"
            :key="item.id"
            :item="item"
            @remove="$emit('remove', $event)"
            @image-failed="$emit('image-failed', $event)"
          />
        </div>

        <div class="tray-actions">
          <button @click="$emit('add-to-build', items)" class="btn-add-to-build" :disabled="items.length === 0">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add to Build
          </button>
          <button @click="$emit('compare', items)" class="btn-compare-now" :disabled="items.length < 2">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Compare
          </button>
        </div>
        <div v-if="items.length < 2" class="help-text">Select items to add to build or compare</div>
        <div v-else-if="items.length < max" class="help-text">
          You can select up to {{ max - items.length }} more items
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.comparison-tray {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* Legacy quirk kept: the old `background: var(--bg-secondary), 0.99` was
     invalid CSS, so the tray always rendered transparent over the blur. */
  background: transparent;
  backdrop-filter: blur(10px);
  border-top: 2px solid var(--accent-lead);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3),
    0 -1px 0 color-mix(in srgb, var(--accent-lead) 20%, transparent);
  z-index: var(--z-tray);
  padding: 1rem 1.5rem;
}

.tray-content { max-width: 1400px; margin: 0 auto; }

.tray-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.625rem; }

.tray-header h3 {
  color: var(--fg-primary);
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.compare-icon { width: 18px; height: 18px; color: var(--accent-lead); flex-shrink: 0; }

.count-badge {
  background: var(--bg-canvas);
  color: var(--accent-lead);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.btn-clear-inline {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--fg-secondary);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.btn-clear-inline svg { width: 14px; height: 14px; }

.btn-clear-inline:hover { background: var(--fb-error); border-color: var(--fb-error); color: white; transform: rotate(90deg); }

.tray-items {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
  margin-bottom: 0.5rem;
  scrollbar-width: thin;
}

.tray-items::-webkit-scrollbar { height: 6px; }
.tray-items::-webkit-scrollbar-track { background: var(--bg-elevated); border-radius: 3px; }
.tray-items::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
.tray-items::-webkit-scrollbar-thumb:hover { background: var(--accent-lead); }

.tray-actions { display: flex; align-items: center; gap: 0.75rem; }

.btn-compare-now,
.btn-add-to-build {
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-compare-now {
  background: var(--accent-lead);
  color: var(--bg-canvas);
  border: 1px solid var(--accent-lead);
}

.btn-compare-now:not(:disabled):hover {
  background: var(--accent-lead-press);
  border-color: var(--accent-lead-press);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.btn-add-to-build {
  background: var(--bg-elevated);
  color: var(--fg-primary);
  border: 1px solid var(--border-strong);
}

.btn-add-to-build:hover:not(:disabled) {
  background: var(--bg-overlay);
  border-color: var(--accent-lead);
  color: var(--accent-lead);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-lead) 20%, transparent);
}

.btn-compare-now:disabled,
.btn-add-to-build:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-icon { width: 16px; height: 16px; flex-shrink: 0; }

.help-text { color: var(--fg-muted); font-size: 0.75rem; font-weight: 500; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }

@media (max-width: 768px) {
  .comparison-tray { padding: 0.875rem 1rem; }
  .tray-items { flex-direction: column; gap: 0.625rem; }
  .tray-actions { flex-direction: column; gap: 0.625rem; }
  .btn-add-to-build, .btn-compare-now { width: 100%; justify-content: center; }
}
</style>
