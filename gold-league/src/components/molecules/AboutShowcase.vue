<template>
  <section class="section-showcase">
    <div class="section-container">
      <div class="section-header">
        <h2>Engineering the Study</h2>
        <p>The infrastructure decisions that keep the research honest, fresh, and fast</p>
      </div>

      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-number">01</div>
          <h3>Automated ETL Pipeline</h3>
          <p>Built a robust Extract-Transform-Load system that pulls from Riot's DDragon API every week, validates data quality (image checks, deprecated item filtering), calculates efficiency for 150+ items, and stores in MongoDB. The entire pipeline runs unattended with error handling and logging.</p>
          <div class="showcase-tech">ETL • APScheduler • Data Validation</div>
        </div>

        <div class="showcase-card">
          <div class="showcase-number">02</div>
          <h3>Responsive Component Architecture</h3>
          <p>Designed reusable Vue components with mobile-first UX. The comparison view transforms from a grid to a swipeable carousel on mobile, item cards have tap-to-toggle tooltips, and all interactions are optimized for touch devices.</p>
          <div class="showcase-tech">Vue 3 • Composition API • Mobile UX</div>
        </div>

        <div class="showcase-card">
          <div class="showcase-number">03</div>
          <h3>Performance Optimization</h3>
          <p>Implemented lazy loading for champion splash arts, cached API responses, used MongoDB indexing for sub-100ms queries, and optimized bundle size with Vite. The entire frontend loads in under 2 seconds on Netlify's CDN.</p>
          <div class="showcase-tech">Lazy Loading • Caching • CDN</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-showcase { padding: 6rem 2rem; position: relative; background: var(--bg-surface); }

.section-container { max-width: 1200px; margin: 0 auto; }

.section-header { text-align: center; margin-bottom: 4rem; }
.section-header h2 { font-size: 2.5rem; font-weight: 700; color: var(--fg-primary); margin-bottom: 1rem; }
.section-header p { font-size: 1.125rem; color: var(--fg-secondary); max-width: 700px; margin: 0 auto; }

.showcase-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }

.showcase-card { padding: 2rem; background: var(--bg-canvas); border: 1px solid var(--border); border-radius: 12px; transition: all 0.3s ease; }

.showcase-card:hover { transform: translateY(-4px); border-color: var(--accent-lead); }

.showcase-number { width: 48px; height: 48px; background: linear-gradient(135deg, var(--accent-lead), var(--accent-lead-press)); color: var(--accent-lead-foreground); font-size: 1.5rem; font-weight: 900; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }

.showcase-card h3 { font-size: 1.25rem; font-weight: 600; color: var(--fg-primary); margin-bottom: 1rem; }

.showcase-card p { color: var(--fg-secondary); font-size: 0.9375rem; line-height: 1.7; margin-bottom: 1.5rem; }

.showcase-tech { display: inline-block; padding: 0.375rem 0.875rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: var(--fg-muted); }

@media (max-width: 768px) {
  .section-header h2 { font-size: 2rem; }
  .section-header p { font-size: 1rem; }
  .showcase-grid { grid-template-columns: 1fr; }
  .section-showcase { padding: 4rem 1.5rem; }
}
</style>
