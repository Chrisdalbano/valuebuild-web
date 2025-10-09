<template>
  <div class="loading-skeleton">
    <!-- Table View Skeleton -->
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

    <!-- Grid View Skeleton -->
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

    <!-- Compare View Skeleton -->
    <div v-else-if="type === 'compare'" class="skeleton-compare">
      <div v-for="n in count" :key="n" class="skeleton-compare-card">
        <div class="skeleton-image-xl shimmer"></div>
        <div class="skeleton-title shimmer"></div>
        <div class="skeleton-stats-group">
          <div class="skeleton-stat-row shimmer"></div>
          <div class="skeleton-stat-row shimmer"></div>
          <div class="skeleton-stat-row shimmer"></div>
        </div>
        <div class="skeleton-recipe">
          <div class="skeleton-recipe-item shimmer"></div>
          <div class="skeleton-recipe-item shimmer"></div>
          <div class="skeleton-recipe-item shimmer"></div>
        </div>
      </div>
    </div>

    <!-- About Page Skeleton -->
    <div v-else-if="type === 'about'" class="skeleton-about">
      <div class="skeleton-hero">
        <div class="skeleton-title-xl shimmer"></div>
        <div class="skeleton-subtitle shimmer"></div>
        <div class="skeleton-cta shimmer"></div>
      </div>
      <div class="skeleton-features">
        <div v-for="n in 5" :key="n" class="skeleton-feature-card shimmer"></div>
      </div>
    </div>

    <!-- Generic Spinner -->
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

<script setup>
defineProps({
  type: {
    type: String,
    default: 'spinner', // 'table', 'grid', 'compare', 'about', 'spinner'
  },
  count: {
    type: Number,
    default: 8,
  },
  message: {
    type: String,
    default: 'Loading items...',
  },
})
</script>

<style scoped>
.loading-skeleton {
  width: 100%;
  padding: 2rem;
}

/* Shimmer Animation */
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(139, 92, 246, 0.05) 0%,
    rgba(139, 92, 246, 0.15) 50%,
    rgba(139, 92, 246, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Table Skeleton */
.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: 60px 1fr 2fr 120px;
  gap: 1.5rem;
  align-items: center;
  padding: 1rem;
  background: rgba(17, 24, 39, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 12px;
}

.skeleton-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  border-radius: 4px;
}

.skeleton-subtitle {
  height: 14px;
  width: 40%;
  border-radius: 4px;
}

.skeleton-stats {
  display: flex;
  gap: 1rem;
}

.skeleton-stat {
  height: 40px;
  width: 80px;
  border-radius: 8px;
}

.skeleton-efficiency {
  height: 40px;
  width: 100px;
  border-radius: 8px;
}

/* Grid Skeleton */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: rgba(17, 24, 39, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-card-header {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(139, 92, 246, 0.02);
}

.skeleton-image-large {
  width: 100px;
  height: 100px;
  border-radius: 12px;
}

.skeleton-card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-price {
  height: 16px;
  width: 50%;
  border-radius: 4px;
}

.skeleton-bar {
  height: 8px;
  width: 100%;
  border-radius: 4px;
}

/* Compare Skeleton */
.skeleton-compare {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
}

.skeleton-compare-card {
  background: rgba(17, 24, 39, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-image-xl {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  margin: 0 auto;
}

.skeleton-stats-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-stat-row {
  height: 36px;
  border-radius: 8px;
}

.skeleton-recipe {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.skeleton-recipe-item {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

/* About Skeleton */
.skeleton-about {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.skeleton-hero {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  padding: 4rem 2rem;
}

.skeleton-title-xl {
  height: 48px;
  width: 60%;
  border-radius: 8px;
}

.skeleton-cta {
  height: 48px;
  width: 200px;
  border-radius: 24px;
}

.skeleton-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.skeleton-feature-card {
  height: 200px;
  border-radius: 16px;
}

/* Spinner */
.skeleton-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.spinner {
  width: 60px;
  height: 60px;
  color: #8b5cf6;
}

.spinner svg {
  animation: spin 1s linear infinite;
}

.spinner circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.skeleton-spinner p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-table-row {
    grid-template-columns: 48px 1fr;
    gap: 1rem;
  }

  .skeleton-stats,
  .skeleton-efficiency {
    display: none;
  }

  .skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .skeleton-compare {
    grid-template-columns: 1fr;
  }
}
</style>

