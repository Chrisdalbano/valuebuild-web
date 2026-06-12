<template>
  <section class="section-tech">
    <div class="section-container">
      <div class="section-header">
        <h2>Technical Architecture</h2>
        <p>A production-grade full-stack application demonstrating modern web development practices</p>
      </div>

      <div class="tech-stack-visual">
        <div class="tech-layer">
          <div class="tech-layer-header">
            <div class="layer-badge frontend-badge">Frontend</div>
            <div class="layer-name">Client Layer</div>
          </div>
          <div class="tech-cards">
            <div class="tech-card"><strong>Vue 3</strong><span>Composition API, reactive state management</span></div>
            <div class="tech-card"><strong>Vite</strong><span>Lightning-fast HMR, optimized builds</span></div>
            <div class="tech-card"><strong>Chart.js</strong><span>Interactive data visualizations</span></div>
            <div class="tech-card"><strong>Axios</strong><span>HTTP client with interceptors</span></div>
          </div>
        </div>

        <div class="tech-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">HTTPS / REST API</div>
          <div class="divider-line"></div>
        </div>

        <div class="tech-layer">
          <div class="tech-layer-header">
            <div class="layer-badge backend-badge">Backend</div>
            <div class="layer-name">API Layer</div>
          </div>
          <div class="tech-cards">
            <div class="tech-card"><strong>FastAPI</strong><span>Python async web framework</span></div>
            <div class="tech-card"><strong>Motor</strong><span>Async MongoDB driver</span></div>
            <div class="tech-card"><strong>APScheduler</strong><span>Automated cron jobs</span></div>
            <div class="tech-card"><strong>Uvicorn</strong><span>ASGI server with workers</span></div>
          </div>
        </div>

        <div class="tech-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">Cloud / Async</div>
          <div class="divider-line"></div>
        </div>

        <div class="tech-layer">
          <div class="tech-layer-header">
            <div class="layer-badge database-badge">Database</div>
            <div class="layer-name">Data Layer</div>
          </div>
          <div class="tech-cards">
            <div class="tech-card"><strong>MongoDB Atlas</strong><span>Cloud-hosted NoSQL database</span></div>
            <div class="tech-card"><strong>ETL Pipeline</strong><span>Weekly DDragon sync & transformation</span></div>
            <div class="tech-card"><strong>Data Validation</strong><span>Image checks, deprecated item filters</span></div>
            <div class="tech-card"><strong>Indexing</strong><span>Optimized queries for < 100ms response</span></div>
          </div>
        </div>
      </div>

      <div class="deployment-info">
        <div class="deploy-card">
          <img src="https://avatars.githubusercontent.com/u/13142323?s=200&v=4" alt="Render" class="deploy-logo" />
          <div>
            <strong>Render</strong>
            <p>Backend API hosting with auto-deploy from GitHub</p>
          </div>
        </div>
        <div class="deploy-card">
          <img src="https://www.netlify.com/v3/img/components/logomark.png" alt="Netlify" class="deploy-logo" />
          <div>
            <strong>Netlify</strong>
            <p>Frontend CDN with global edge network</p>
          </div>
        </div>
        <div class="deploy-card">
          <svg viewBox="0 0 24 24" fill="#00ED64" class="deploy-logo-svg">
            <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"/>
          </svg>
          <div>
            <strong>MongoDB Atlas</strong>
            <p>Managed cloud database with 512MB free tier</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Legacy raw badge colors (blue/green/violet rgba, #00ED64 Mongo leaf) kept verbatim — no token maps. */
.section-tech { padding: 6rem 2rem; position: relative; background: var(--bg-surface); }

.section-container { max-width: 1200px; margin: 0 auto; }

.section-header { text-align: center; margin-bottom: 4rem; }
.section-header h2 { font-size: 2.5rem; font-weight: 700; color: var(--fg-primary); margin-bottom: 1rem; }
.section-header p { font-size: 1.125rem; color: var(--fg-secondary); max-width: 700px; margin: 0 auto; }

.tech-stack-visual { margin-bottom: 3rem; }

.tech-layer { margin-bottom: 2rem; }

.tech-layer-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }

.layer-badge { padding: 0.375rem 0.875rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

.frontend-badge { background: rgba(59, 130, 246, 0.15); color: rgb(59, 130, 246); border: 1px solid rgba(59, 130, 246, 0.3); }
.backend-badge { background: rgba(34, 197, 94, 0.15); color: rgb(34, 197, 94); border: 1px solid rgba(34, 197, 94, 0.3); }
.database-badge { background: rgba(168, 85, 247, 0.15); color: rgb(168, 85, 247); border: 1px solid rgba(168, 85, 247, 0.3); }

.layer-name { font-size: 1.125rem; font-weight: 600; color: var(--fg-primary); }

.tech-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }

.tech-card { padding: 1.25rem; background: var(--bg-canvas); border: 1px solid var(--border); border-radius: 8px; display: flex; flex-direction: column; gap: 0.25rem; }

.tech-card strong { color: var(--accent-lead); font-size: 1rem; font-weight: 600; }

.tech-card span { color: var(--fg-secondary); font-size: 0.875rem; }

.tech-divider { display: flex; align-items: center; gap: 1rem; margin: 2rem 0; }

.divider-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, var(--border), transparent); }

.divider-icon { padding: 0.5rem 1rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.deployment-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 3rem; }

.deploy-card { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: var(--bg-canvas); border: 1px solid var(--border); border-radius: 8px; }

.deploy-logo { width: 48px; height: 48px; object-fit: contain; flex-shrink: 0; }

.deploy-logo-svg { width: 48px; height: 48px; flex-shrink: 0; }

.deploy-card strong { display: block; color: var(--fg-primary); font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }

.deploy-card p { color: var(--fg-secondary); font-size: 0.875rem; margin: 0; }

@media (max-width: 768px) {
  .section-header h2 { font-size: 2rem; }
  .section-header p { font-size: 1rem; }
  .tech-cards,
  .deployment-info { grid-template-columns: 1fr; }
  .section-tech { padding: 4rem 1.5rem; }
}
</style>
