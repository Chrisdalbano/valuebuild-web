<script setup>
defineProps({
  splash: { type: String, default: '' },
})
</script>

<template>
  <div class="hero-splash-container">
    <div class="hero-splash-bg" :style="{ backgroundImage: `url(${splash})` }"></div>
    <div class="hero-overlay-fade"></div>

    <div class="hero-content">
      <div class="hero-badge">
        <span>Data-Driven Itemization</span>
      </div>

      <h1 class="hero-title">
        BuildValue
      </h1>

      <p class="hero-subtitle">
        Efficiently compare and optimize your Build to be built differently. Item Gap.
      </p>

      <div class="hero-stats">
        <div class="stat-pill">
          <div class="stat-number">ALL</div>
          <div class="stat-label">Items Analyzed</div>
        </div>
        <div class="stat-pill">
          <div class="stat-number">Weekly</div>
          <div class="stat-label">Auto Updates</div>
        </div>
        <div class="stat-pill">
          <div class="stat-number">Real-Time</div>
          <div class="stat-label">Calculations</div>
        </div>
      </div>

      <div class="hero-cta">
        <button @click="$router.push('/')" class="btn-primary-hero">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Compare Items
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Legacy raw colors kept verbatim (no token maps): rgba(10,13,20,…) hero fade,
   rgba(193,131,28,…) dark-gold glows, rgb(220,148,21) gradient stop,
   rgba(255,171,37,…) title glow, whitesmoke title, rgba(255,255,255,…) glass pills. */
.hero-splash-container { position: relative; height: 100vh; min-height: 700px; overflow: hidden; display: flex; align-items: center; justify-content: center; z-index: 3; /* Override app-level splash */ }

.hero-splash-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center top; background-repeat: no-repeat; }

.hero-overlay-fade {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(10, 13, 20, 0.4) 0%,
    rgba(10, 13, 20, 0.7) 30%,
    rgba(10, 13, 20, 0.95) 60%,
    rgba(10, 13, 20, 1) 80%,
    var(--bg-canvas) 100%
  );
  backdrop-filter: blur(0px) saturate(100%);
}

.hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; max-width: 900px; }

.hero-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.25rem; background: rgba(193, 131, 28, 0.15); border: 1px solid rgba(193, 131, 28, 0.3); border-radius: 50px; color: var(--accent-lead); font-size: 0.875rem; font-weight: 600; margin-bottom: 2rem; backdrop-filter: blur(10px); }

.badge-icon { width: 24px; height: 24px; }

.hero-title { font-size: 5rem; font-weight: 900; background: whitesmoke; background-clip: text; margin-bottom: 1.5rem; letter-spacing: -0.02em; text-shadow: 0 0 60px rgba(255, 171, 37, 0.3); }

.hero-subtitle { font-size: 1.5rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 3rem; line-height: 1.6; font-weight: 500; }

.hero-stats { display: flex; gap: 2rem; justify-content: center; margin-bottom: 3rem; flex-wrap: wrap; }

.stat-pill { padding: 1.5rem 2rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; backdrop-filter: blur(10px); min-width: 140px; }

.stat-number { font-size: 2rem; font-weight: 700; color: var(--accent-lead); margin-bottom: 0.25rem; }

.stat-label { font-size: 0.875rem; color: rgba(255, 255, 255, 0.7); font-weight: 500; }

.hero-cta { margin-top: 2rem; }

.btn-primary-hero { display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2.5rem; background: linear-gradient(135deg, var(--accent-lead), rgb(220, 148, 21)); color: #000; font-size: 1.125rem; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(193, 131, 28, 0.4); }

.btn-primary-hero:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(193, 131, 28, 0.6); }

.btn-primary-hero svg { width: 20px; height: 20px; }

@media (max-width: 768px) {
  .hero-title { font-size: 3rem; }
  .hero-subtitle { font-size: 1.125rem; }
  .hero-stats { gap: 1rem; }
  .stat-pill { padding: 1rem 1.5rem; min-width: 120px; }
}
</style>
