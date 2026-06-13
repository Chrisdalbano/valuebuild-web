<script setup>
// Honest, Riot-tag-driven category chips (see utils/itemClassify) replacing the
// old champion-role guesser. `excludeSupport` is a separate toggle so GoldPer
// support items stay out of efficiency comparisons by default but remain
// browsable via the Support chip.
const type = defineModel({ type: String, default: 'all' })
const excludeSupport = defineModel('excludeSupport', { type: Boolean, default: true })

const typeOptions = [
  { value: 'all', label: 'All' },
  { value: 'ad', label: 'AD' },
  { value: 'ap', label: 'AP' },
  { value: 'tank', label: 'Tank' },
  { value: 'crit', label: 'Crit' },
  { value: 'attackSpeed', label: 'Atk Speed' },
  { value: 'lethality', label: 'Lethality' },
  { value: 'magicPen', label: 'Magic Pen' },
  { value: 'abilityHaste', label: 'Ability Haste' },
  { value: 'onHit', label: 'On-Hit' },
  { value: 'boots', label: 'Boots' },
  { value: 'starter', label: 'Starter' },
  { value: 'support', label: 'Support' },
]
</script>

<template>
  <div class="type-filters-row">
    <div class="type-filter-label">Filter by Type:</div>
    <div class="type-filter-buttons">
      <button
        v-for="option in typeOptions"
        :key="option.value"
        @click="type = option.value"
        :class="['type-filter-btn', { active: type === option.value }]"
        :title="option.label"
      >
        <span class="type-filter-label-text">{{ option.label }}</span>
      </button>
    </div>
    <label class="support-toggle" :title="'Support items use a free, upgrade-only economy and distort gold-efficiency comparisons'">
      <input type="checkbox" v-model="excludeSupport" />
      <span class="support-toggle-text">Exclude support items</span>
    </label>
  </div>
</template>

<style scoped>
.type-filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.type-filter-label {
  color: var(--fg-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.type-filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.type-filter-btn {
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  color: var(--fg-secondary);
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.8125rem;
  transition: all 0.2s;
}

.type-filter-btn:hover {
  border-color: var(--accent-lead);
  color: var(--fg-primary);
  transform: translateY(-1px);
}

.type-filter-btn.active {
  background: var(--accent-lead);
  border-color: var(--accent-lead);
  color: var(--bg-canvas);
  font-weight: 600;
}

.support-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--fg-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  user-select: none;
}

.support-toggle input {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-lead);
  cursor: pointer;
}

.support-toggle:hover { color: var(--fg-primary); }

@media (max-width: 768px) {
  .type-filters-row { flex-direction: column; align-items: stretch; gap: 0.75rem; padding: 0.875rem; }
  .type-filter-buttons { width: 100%; }
  .type-filter-btn { flex: 1 1 auto; min-width: 0; text-align: center; }
  .support-toggle { justify-content: center; padding-top: 0.25rem; }
}
</style>
