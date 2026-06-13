<script setup>
import { ref } from 'vue'
import { optimizeBuild } from '@/composables/useBudgetOptimizer'

const props = defineProps({
  items: { type: Array, required: true },
  role: { type: String, default: 'all' },
})

const emit = defineEmits(['apply'])

const budget = ref(15000)
const summary = ref('')

function run() {
  const value = Math.max(300, Math.min(40000, Number(budget.value) || 0))
  budget.value = value
  const build = optimizeBuild(props.items, value, props.role)
  if (build.length === 0) {
    summary.value = 'No completed items fit that budget. Try raising it.'
    return
  }
  const cost = build.reduce((sum, i) => sum + i.cost, 0)
  const totalValue = build.reduce((sum, i) => sum + i.totalGoldValue, 0)
  summary.value = `${build.length} item${build.length > 1 ? 's' : ''} · ${cost.toLocaleString()}g spent of ${value.toLocaleString()}g · ${Math.round(totalValue).toLocaleString()}g total stat value`
  emit('apply', build)
}
</script>

<template>
  <div class="budget-optimizer">
    <div class="optimizer-copy">
      <h3>⚡ Budget Optimizer</h3>
      <p class="optimizer-subtitle">
        Builds the highest total stat value under your gold budget. Replaces the current build.
      </p>
    </div>
    <div class="optimizer-controls">
      <div class="budget-field">
        <input
          v-model.number="budget"
          type="number"
          min="300"
          max="40000"
          step="100"
          class="budget-input"
          aria-label="Gold budget"
          @keyup.enter="run"
        />
        <span class="budget-unit">g</span>
      </div>
      <button @click="run" class="btn-optimize">Optimize</button>
    </div>
    <p v-if="summary" class="optimizer-summary">{{ summary }}</p>
  </div>
</template>

<style scoped>
.budget-optimizer {
  background: var(--bg-elevated);
  padding: 1.5rem 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.optimizer-copy { flex: 1; min-width: 260px; }

.budget-optimizer h3 { color: var(--accent-lead); font-size: 1.25rem; margin-bottom: 0.375rem; }

.optimizer-subtitle { color: var(--fg-muted); font-size: 0.875rem; margin: 0; }

.optimizer-controls { display: flex; align-items: center; gap: 0.75rem; }

.budget-field {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0 0.75rem;
  transition: border-color 0.2s;
}

.budget-field:focus-within { border-color: var(--accent-lead); }

.budget-input {
  width: 96px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--fg-primary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.625rem 0;
  text-align: right;
}

.budget-unit { color: var(--accent-lead); font-weight: 700; margin-left: 0.25rem; }

.btn-optimize {
  padding: 0.7rem 1.5rem;
  background: var(--accent-lead);
  border: 1px solid var(--accent-lead);
  border-radius: var(--radius-md);
  color: var(--bg-canvas);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-optimize:hover { background: var(--accent-lead-press); border-color: var(--accent-lead-press); transform: translateY(-1px); }

.optimizer-summary {
  flex-basis: 100%;
  margin: 0;
  color: var(--fg-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .budget-optimizer { padding: 1.25rem 1rem; }
  .optimizer-controls { width: 100%; }
  .budget-field { flex: 1; }
}
</style>
