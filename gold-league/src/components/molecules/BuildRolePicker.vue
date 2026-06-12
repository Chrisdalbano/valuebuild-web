<script setup>
import { buildRoleOptions as roleOptions } from '@/composables/useBuildSuggestions'

const role = defineModel({ type: String, default: 'all' })
</script>

<template>
  <div class="role-selector">
    <div class="role-label">Build Type:</div>
    <button
      v-for="option in roleOptions"
      :key="option.value"
      @click="role = option.value"
      :class="['role-btn', { active: role === option.value }]"
    >
      <img :src="option.icon" :alt="option.label" class="role-icon" @error="(e) => e.target.style.display = 'none'" />
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.role-selector {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  background: var(--bg-elevated);
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 1px solid var(--border);
}

.role-label {
  color: var(--fg-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.role-icon { width: 20px; height: 20px; object-fit: contain; filter: brightness(0) invert(1); }
.role-btn.active .role-icon { filter: brightness(0) invert(0); }

.role-btn:hover {
  background: var(--bg-canvas);
  border-color: var(--accent-lead);
  color: var(--fg-primary);
  transform: translateY(-1px);
}

.role-btn.active {
  background: var(--accent-lead);
  border-color: var(--accent-lead);
  color: var(--bg-canvas);
  font-weight: 700;
}

@media (max-width: 768px) {
  .role-selector { flex-direction: column; align-items: stretch; }
  .role-btn { justify-content: center; }
}
</style>
