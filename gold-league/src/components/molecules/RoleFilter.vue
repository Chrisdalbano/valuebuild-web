<script setup>
const role = defineModel({ type: String, default: 'all' })

const CDRAGON = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default'
const roleOptions = [
  { value: 'all', label: 'All', icon: `${CDRAGON}/star-outline-resting.png` },
  { value: 'marksman', label: 'Marksman', icon: `${CDRAGON}/role-icon-marksman.png` },
  { value: 'mage', label: 'Mage', icon: `${CDRAGON}/role-icon-mage.png` },
  { value: 'tank', label: 'Tank', icon: `${CDRAGON}/role-icon-tank.png` },
  { value: 'fighter', label: 'Fighter', icon: `${CDRAGON}/role-icon-fighter.png` },
  { value: 'assassin', label: 'Assassin', icon: `${CDRAGON}/role-icon-assassin.png` },
  { value: 'support', label: 'Support', icon: `${CDRAGON}/role-icon-support.png` },
]
</script>

<template>
  <div class="role-filters-row">
    <div class="role-filter-label">Filter by Role:</div>
    <div class="role-filter-buttons">
      <button
        v-for="option in roleOptions"
        :key="option.value"
        @click="role = option.value"
        :class="['role-filter-btn', { active: role === option.value }]"
        :title="option.label"
      >
        <img :src="option.icon" :alt="option.label" class="role-filter-icon" @error="(e) => e.target.style.display = 'none'" />
        <span class="role-filter-label-text">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.role-filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.role-filter-label {
  color: var(--fg-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.role-filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.role-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  color: var(--fg-secondary);
  padding: 0.625rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.role-filter-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.7;
}

.role-filter-btn:hover {
  border-color: var(--accent-lead);
  color: var(--fg-primary);
  transform: translateY(-1px);
}

.role-filter-btn:hover .role-filter-icon { opacity: 1; }

.role-filter-btn.active {
  background: var(--accent-lead);
  border-color: var(--accent-lead);
  color: var(--bg-canvas);
  font-weight: 600;
}

.role-filter-btn.active .role-filter-icon {
  filter: brightness(0) invert(0);
  opacity: 1;
}

.role-filter-label-text { white-space: nowrap; }

@media (max-width: 768px) {
  .role-filters-row { flex-direction: column; gap: 0.75rem; padding: 0.875rem; }
  .role-filter-buttons { width: 100%; }
  .role-filter-btn {
    flex: 1;
    min-width: 0;
    padding: 0.75rem;
    font-size: 0.8125rem;
    justify-content: center;
  }
  .role-filter-icon { width: 20px; height: 20px; margin: 0; }
  .role-filter-label-text { display: none; /* Hide text on very small screens */ }
}

@media (max-width: 480px) {
  .role-filter-label { font-size: 0.75rem; }
}
</style>
