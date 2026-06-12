<script setup>
defineProps({
  type: { type: String, default: 'spinner' }, // 'table' | 'grid' | 'spinner'
  count: { type: Number, default: 8 },
  message: { type: String, default: 'Loading items...' },
})
</script>

<template>
  <div class="loading-skeleton">
    <div v-if="type === 'table'" class="skeleton-table">
      <div v-for="n in count" :key="n" class="skeleton-table-row">
        <div class="skeleton-image shimmer"></div>
        <div class="skeleton-content">
          <div class="skeleton-title shimmer"></div>
          <div class="skeleton-subtitle shimmer"></div>
        </div>
        <div class="skeleton-stats">
          <div class="skeleton-stat shimmer"></div>
          <div class="skeleton-stat shimmer"></div>
          <div class="skeleton-stat shimmer"></div>
        </div>
        <div class="skeleton-efficiency shimmer"></div>
      </div>
    </div>

    <div v-else-if="type === 'grid'" class="skeleton-grid">
      <div v-for="n in count" :key="n" class="skeleton-card">
        <div class="skeleton-card-header">
          <div class="skeleton-image-large shimmer"></div>
        </div>
        <div class="skeleton-card-body">
          <div class="skeleton-title shimmer"></div>
          <div class="skeleton-price shimmer"></div>
          <div class="skeleton-bar shimmer"></div>
        </div>
      </div>
    </div>

    <div v-else class="skeleton-spinner">
      <div class="spinner">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" />
        </svg>
      </div>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.loading-skeleton { width: 100%; padding: 2rem; }

/* Shimmer — legacy violet tint (footer palette), Phase 3 retheme candidate */
.shimmer {
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--footer-accent) 5%, transparent) 0%,
    color-mix(in srgb, var(--footer-accent) 15%, transparent) 50%,
    color-mix(in srgb, var(--footer-accent) 5%, transparent) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Table */
.skeleton-table { display: flex; flex-direction: column; gap: 1rem; }

.skeleton-table-row {
  display: grid;
  grid-template-columns: 60px 1fr 2fr 120px;
  gap: 1.5rem;
  align-items: center;
  padding: 1rem;
  background: color-mix(in srgb, var(--footer-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--footer-accent) 10%, transparent);
  border-radius: 12px;
}

.skeleton-image { width: 60px; height: 60px; border-radius: 8px; }
.skeleton-content { display: flex; flex-direction: column; gap: 0.5rem; }
.skeleton-title { height: 20px; width: 70%; border-radius: 4px; }
.skeleton-subtitle { height: 14px; width: 40%; border-radius: 4px; }
.skeleton-stats { display: flex; gap: 1rem; }
.skeleton-stat { height: 40px; width: 80px; border-radius: 8px; }
.skeleton-efficiency { height: 40px; width: 100px; border-radius: 8px; }

/* Grid */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: color-mix(in srgb, var(--footer-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--footer-accent) 10%, transparent);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-card-header {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: color-mix(in srgb, var(--footer-accent) 2%, transparent);
}

.skeleton-image-large { width: 100px; height: 100px; border-radius: 12px; }
.skeleton-card-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.skeleton-price { height: 16px; width: 50%; border-radius: 4px; }
.skeleton-bar { height: 8px; width: 100%; border-radius: 4px; }

/* Spinner */
.skeleton-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.spinner { width: 60px; height: 60px; color: var(--footer-accent); }
.spinner svg { animation: spin 1s linear infinite; }

.spinner circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.skeleton-spinner p { color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; font-weight: 500; }

@media (max-width: 768px) {
  .skeleton-table-row { grid-template-columns: 48px 1fr; gap: 1rem; }
  .skeleton-stats, .skeleton-efficiency { display: none; }
  .skeleton-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
}
</style>
