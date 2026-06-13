<script setup>
import NumberTicker from '@/components/atoms/NumberTicker.vue'

defineProps({
  splash: { type: String, default: '' },
  itemCount: { type: Number, default: 0 },
  patch: { type: String, default: '' },
})
</script>

<template>
  <div class="hero-splash-container">
    <div class="hero-splash-bg" :style="{ backgroundImage: `url(${splash})` }"></div>
    <div class="hero-overlay-fade"></div>

    <div class="hero-content">
      <div class="hero-badge"><span>Gold Efficiency Research</span></div>

      <h1 class="hero-title">Build<span class="title-accent">Value</span></h1>

      <p class="hero-subtitle">
        A living study of what your gold actually buys in League of Legends — efficiency baselines,
        effect valuation, and patch-by-patch discoveries, recomputed from the source every week.
      </p>

      <div class="hero-stats">
        <div class="stat-pill">
          <div class="stat-number"><NumberTicker :value="itemCount" /></div>
          <div class="stat-label">Items Studied</div>
        </div>
        <div class="stat-pill">
          <div class="stat-number">{{ patch || '—' }}</div>
          <div class="stat-label">Current Patch</div>
        </div>
        <div class="stat-pill">
          <div class="stat-number">Weekly</div>
          <div class="stat-label">Re-measured</div>
        </div>
      </div>

      <div class="hero-cta">
        <button @click="$router.push('/')" class="btn-primary-hero">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Browse the Database
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-splash-container {
  position: relative;
  height: 100vh;
  min-height: 700px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3; /* override the app-level splash */
}

.hero-splash-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

/* legacy navy fade kept verbatim (hand-tuned to blend into --bg-canvas) */
.hero-overlay-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom,
    rgba(10, 13, 20, 0.4) 0%,
    rgba(10, 13, 20, 0.7) 30%,
    rgba(10, 13, 20, 0.95) 60%,
    rgba(10, 13, 20, 1) 80%,
    var(--bg-canvas) 100%);
}

.hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; max-width: 900px; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: var(--accent-lead-tint);
  border: 1px solid color-mix(in srgb, var(--accent-lead) 30%, transparent);
  border-radius: 50px;
  color: var(--accent-lead);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 900;
  color: var(--fg-primary);
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  text-shadow: 0 0 60px color-mix(in srgb, var(--accent-lead) 30%, transparent);
}

.title-accent {
  background: linear-gradient(120deg, var(--accent-lead-hover), var(--accent-lead) 55%, var(--accent-warm-hover));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: clamp(1rem, 2.2vw, 1.375rem);
  color: var(--fg-secondary);
  max-width: 60ch;
  margin: 0 auto 3rem;
  line-height: 1.6;
  font-weight: 500;
}

.hero-stats { display: flex; gap: 2rem; justify-content: center; margin-bottom: 3rem; flex-wrap: wrap; }

.stat-pill {
  padding: 1.5rem 2rem;
  background: color-mix(in srgb, var(--bg-surface) 55%, transparent);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  min-width: 150px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-lead);
  margin-bottom: 0.25rem;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--fg-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hero-cta { margin-top: 2rem; }

.btn-primary-hero {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, var(--accent-lead), var(--accent-lead-press));
  color: var(--accent-lead-foreground);
  font-size: 1.125rem;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px color-mix(in srgb, var(--accent-lead) 40%, transparent);
}

.btn-primary-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px color-mix(in srgb, var(--accent-lead) 55%, transparent);
}

.btn-primary-hero svg { width: 20px; height: 20px; }

@media (prefers-reduced-motion: reduce) {
  .btn-primary-hero { transition: none; }
}

@media (max-width: 768px) {
  .hero-stats { gap: 1rem; }
  .stat-pill { padding: 1rem 1.5rem; min-width: 120px; }
}
</style>
