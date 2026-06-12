<script setup>
defineEmits(['browse'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-state-content">
      <div class="empty-icon-wrapper">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      </div>
      <h2>Start Comparing Items</h2>
      <p>Select 2-6 items from the database to analyze their gold efficiency, stats, and build paths side by side</p>
      <button @click="$emit('browse')" class="btn-browse-items">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Browse Items Database
      </button>
      <div class="empty-state-features">
        <div class="feature-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span>Quick Insights</span>
        </div>
        <div class="feature-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
          </svg>
          <span>Visual Charts</span>
        </div>
        <div class="feature-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
          <span>Build Paths</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.empty-state-content { max-width: 600px; text-align: center; }

.empty-icon-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 10%, transparent),
    color-mix(in srgb, var(--accent-warm) 10%, transparent));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border);
}

.empty-icon { width: 64px; height: 64px; color: var(--accent-lead); opacity: 0.8; }

.empty-state h2 { color: var(--fg-primary); font-size: 2rem; margin: 0 0 1rem 0; font-weight: 700; }

.empty-state p { color: var(--fg-secondary); font-size: 1.125rem; margin: 0 0 2.5rem 0; line-height: 1.6; }

.btn-browse-items {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: linear-gradient(135deg, var(--accent-lead), var(--accent-warm));
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.btn-browse-items svg { width: 20px; height: 20px; }

.btn-browse-items:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--accent-lead) 40%, transparent);
}

.empty-state-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.feature-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.feature-item svg { width: 28px; height: 28px; color: var(--accent-lead); }
.feature-item span { color: var(--fg-secondary); font-size: 0.875rem; font-weight: 500; }
</style>
