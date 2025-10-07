<template>
  <div class="about-landing">
    <!-- Champion Splash Background (Session-persistent) -->
    <div class="hero-splash-container">
      <div 
        class="hero-splash-bg" 
        :style="{ backgroundImage: `url(${splash})` }"
      ></div>
      <div class="hero-overlay-fade"></div>
      
      <!-- Hero Content -->
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

    <!-- What We Offer Section -->
    <section class="section-features">
      <div class="section-container">
        <div class="section-header">
          <h2>Built for Players. Powered by Data.</h2>
          <p>A full-stack web application that transforms how you approach itemization in League of Legends</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));">
              <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/icon_gold.png" 
                   alt="Gold Efficiency" class="feature-icon-img" />
            </div>
            <h3>Gold Efficiency Analytics</h3>
            <p>Instantly see how much stat value you get per gold spent. Every item is analyzed using official base stat formulas derived from League's component items.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));">
              <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsadaptiveforceicon.png" 
                   alt="Compare" class="feature-icon-img" />
            </div>
            <h3>Advanced Comparison</h3>
            <p>Compare up to 6 items side-by-side with detailed stat breakdowns, build paths, and visual efficiency charts. Make informed decisions in champion select.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05));">
              <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/icon_aoe.png" 
                   alt="Build Optimizer" class="feature-icon-img" />
            </div>
            <h3>Build Optimizer</h3>
            <p>Construct optimal 6-item builds and see total gold value, combined stats, and efficiency ratings. Experiment without risking LP.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));">
              <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/icon_move_speed.png" 
                   alt="Smart Insights" class="feature-icon-img" />
            </div>
            <h3>Flash Comparisons</h3>
            <p>Get instant recommendations on the most efficient items by category. Perfect for quick decision-making during game lobbies.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));">
              <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/icon_cooldown.png" 
                   alt="Live Data" class="feature-icon-img" />
            </div>
            <h3>Weekly Up-to-Date</h3>
            <p>Automated ETL pipeline syncs with Riot's DDragon API every Monday. New items, balance changes, and patches are reflected automatically.</p>
          </div>

        
        </div>
      </div>
    </section>

    <!-- Technology Stack Section -->
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
              <div class="tech-card">
                <strong>Vue 3</strong>
                <span>Composition API, reactive state management</span>
              </div>
              <div class="tech-card">
                <strong>Vite</strong>
                <span>Lightning-fast HMR, optimized builds</span>
              </div>
              <div class="tech-card">
                <strong>Chart.js</strong>
                <span>Interactive data visualizations</span>
              </div>
              <div class="tech-card">
                <strong>Axios</strong>
                <span>HTTP client with interceptors</span>
              </div>
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
              <div class="tech-card">
                <strong>FastAPI</strong>
                <span>Python async web framework</span>
              </div>
              <div class="tech-card">
                <strong>Motor</strong>
                <span>Async MongoDB driver</span>
              </div>
              <div class="tech-card">
                <strong>APScheduler</strong>
                <span>Automated cron jobs</span>
              </div>
              <div class="tech-card">
                <strong>Uvicorn</strong>
                <span>ASGI server with workers</span>
              </div>
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
              <div class="tech-card">
                <strong>MongoDB Atlas</strong>
                <span>Cloud-hosted NoSQL database</span>
              </div>
              <div class="tech-card">
                <strong>ETL Pipeline</strong>
                <span>Weekly DDragon sync & transformation</span>
              </div>
              <div class="tech-card">
                <strong>Data Validation</strong>
                <span>Image checks, deprecated item filters</span>
              </div>
              <div class="tech-card">
                <strong>Indexing</strong>
                <span>Optimized queries for < 100ms response</span>
              </div>
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

    <!-- Gold Efficiency Explained -->
    <section class="section-formula">
      <div class="section-container">
        <div class="formula-content">
          <div class="formula-left">
            <h2>Understanding Gold Efficiency</h2>
            <p>Gold efficiency is the cornerstone metric for evaluating item value in League of Legends. It represents the percentage of an item's cost that translates into raw stat value.</p>
            
            <div class="formula-box">
              <div class="formula-label">The Formula</div>
              <div class="formula-equation">
                Gold Efficiency = <span class="formula-fraction"><span class="numerator">Total Stat Value</span><span class="denominator">Item Cost</span></span> × 100%
              </div>
            </div>

            <div class="formula-example">
              <div class="example-header">
                <img src="https://ddragon.leagueoflegends.com/cdn/15.1.1/img/item/3031.png" 
                     alt="Infinity Edge" class="example-item-icon" />
                <strong>Example: Infinity Edge</strong>
              </div>
              <div class="example-stats">
                <div class="stat-line">
                  <span class="stat-icon">💰</span>
                  <span>Cost: <strong>3450g</strong></span>
                </div>
                <div class="stat-line">
                  <span class="stat-icon">⚔️</span>
                  <span>Stats: <strong>65 AD + 25% Crit</strong></span>
                </div>
                <div class="stat-line">
                  <span class="stat-icon">📊</span>
                  <span>Stat Value: <strong>3275g</strong> (2275g AD + 1000g Crit)</span>
                </div>
                <div class="stat-line highlight">
                  <span class="stat-icon">✨</span>
                  <span>Base Efficiency: <strong>94.93%</strong></span>
                </div>
                <div class="stat-line">
                  <span class="stat-icon">📉</span>
                  <span>Gold Deficit: <strong>-175g</strong></span>
                </div>
              </div>
              <div class="example-note">
                The unique passive amplifies crit damage by 40%, making it essential for ADCs despite being slightly below 100% base efficiency. The true value comes from maximizing your critical strike damage output.
              </div>
            </div>

            <div class="formula-note">
              Gold efficiency only accounts for base stats, not unique passives or actives. A low-efficiency item can still be optimal if its passive is powerful for your champion.
            </div>
          </div>

          <div class="formula-right">
            <div class="stat-values-table">
              <div class="table-header">Base Stat Gold Values</div>
              <div class="stat-row">
                <span class="stat-name-col">Attack Damage</span>
                <span class="stat-value-col">35g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Ability Power</span>
                <span class="stat-value-col">20g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Armor</span>
                <span class="stat-value-col">20g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Magic Resist</span>
                <span class="stat-value-col">20g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Health</span>
                <span class="stat-value-col">2.67g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Mana</span>
                <span class="stat-value-col">1g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Attack Speed (10%)</span>
                <span class="stat-value-col">250g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Crit Chance (1%)</span>
                <span class="stat-value-col">40g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Life Steal (1%)</span>
                <span class="stat-value-col">53.55g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Movement Speed</span>
                <span class="stat-value-col">12g</span>
              </div>
              <div class="stat-row">
                <span class="stat-name-col">Ability Haste</span>
                <span class="stat-value-col">26.67g</span>
              </div>
            </div>
            <div class="table-source">
              Derived from League's basic component items (Long Sword, Ruby Crystal, etc.)
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Project Showcase -->
    <section class="section-showcase">
      <div class="section-container">
        <div class="section-header">
          <h2>Project Highlights</h2>
          <p>Key technical achievements and development decisions</p>
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

    <!-- Footer CTA -->
    <section class="section-cta">
      <div class="section-container-narrow">
        <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/1111.jpg" 
             alt="BuildValue" class="cta-icon" />
        <h2>Ready to be the one who says 'Build Diff'?</h2>
        <p>Explore efficient itemization with our gold efficiency calculations</p>
        <button @click="$router.push('/')" class="btn-cta-large">
          Browse Items Database
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        
        <!-- Last Update Info -->
        <div v-if="lastUpdate" class="last-update-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="update-icon">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Data last updated: {{ formatLastUpdate(lastUpdate) }}</span>
        </div>
        
        <div class="disclaimer">
          BuildValue is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChampionSplash } from '../composables/useChampionSplash'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Get session-persistent splash
const { splash } = useChampionSplash()

// Last update timestamp
const lastUpdate = ref(null)

// Fetch metadata to get last update timestamp
onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/metadata`)
    if (response.data && response.data.lastUpdate) {
      lastUpdate.value = response.data.lastUpdate
    }
  } catch (error) {
    console.error('Failed to fetch metadata:', error)
  }
})

// Format last update timestamp
const formatLastUpdate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}
</script>

<style scoped>
/* Hero Section with Dynamic Splash */
.about-landing {
  min-height: 100vh;
  background: var(--bg-primary);
}

.hero-splash-container {
  position: relative;
  height: 100vh;
  min-height: 700px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3; /* Override app-level splash */
}

.hero-splash-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

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
    var(--bg-primary) 100%
  );
  backdrop-filter: blur(0px) saturate(100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  max-width: 900px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: rgba(193, 131, 28, 0.15);
  border: 1px solid rgba(193, 131, 28, 0.3);
  border-radius: 50px;
  color: var(--gold);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.badge-icon {
  width: 24px;
  height: 24px;
}

.hero-title {
  font-size: 5rem;
  font-weight: 900;
  background: whitesmoke;
  background-clip: text;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  text-shadow: 0 0 60px rgba(255, 171, 37, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  line-height: 1.6;
  font-weight: 500;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.stat-pill {
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  min-width: 140px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.hero-cta {
  margin-top: 2rem;
}

.btn-primary-hero {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, var(--gold), rgb(220, 148, 21));
  color: #000;
  font-size: 1.125rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(193, 131, 28, 0.4);
}

.btn-primary-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(193, 131, 28, 0.6);
}

.btn-primary-hero svg {
  width: 20px;
  height: 20px;
}

/* Sections */
.section-features,
.section-tech,
.section-formula,
.section-showcase,
.section-cta {
  padding: 6rem 2rem;
  position: relative;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-container-narrow {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 700px;
  margin: 0 auto;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.features-grid .feature-card:nth-child(4),
.features-grid .feature-card:nth-child(5) {
  grid-column: span 1;
}

/* Center last 2 cards when 5 total */
@media (min-width: 1025px) {
  .features-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .features-grid .feature-card:nth-child(1),
  .features-grid .feature-card:nth-child(2),
  .features-grid .feature-card:nth-child(3) {
    grid-column: span 2;
  }
  
  .features-grid .feature-card:nth-child(4) {
    grid-column: 2 / span 2;
  }
  
  .features-grid .feature-card:nth-child(5) {
    grid-column: 4 / span 2;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid .feature-card:nth-child(5) {
    grid-column: span 2;
  }
}

.feature-card {
  padding: 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border-color: var(--gold);
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.feature-card p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* Tech Stack Section */
.section-tech {
  background: var(--bg-secondary);
}

.tech-stack-visual {
  margin-bottom: 3rem;
}

.tech-layer {
  margin-bottom: 2rem;
}

.tech-layer-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.layer-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.frontend-badge {
  background: rgba(59, 130, 246, 0.15);
  color: rgb(59, 130, 246);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.backend-badge {
  background: rgba(34, 197, 94, 0.15);
  color: rgb(34, 197, 94);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.database-badge {
  background: rgba(168, 85, 247, 0.15);
  color: rgb(168, 85, 247);
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.layer-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tech-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.tech-card {
  padding: 1.25rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tech-card strong {
  color: var(--gold);
  font-size: 1rem;
  font-weight: 600;
}

.tech-card span {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.tech-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-primary), transparent);
}

.divider-icon {
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.deployment-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
}

.deploy-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.deploy-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  flex-shrink: 0;
}

.deploy-logo-svg {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.deploy-card strong {
  display: block;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.deploy-card p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

/* Formula Section */
.formula-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.formula-left h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.formula-left p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.formula-box {
  background: var(--bg-secondary);
  border: 2px solid var(--gold);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
}

.formula-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold);
  margin-bottom: 1rem;
}

.formula-equation {
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.formula-fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.5rem;
}

.numerator {
  padding-bottom: 0.25rem;
  border-bottom: 2px solid var(--gold);
  color: var(--gold);
}

.denominator {
  padding-top: 0.25rem;
  color: var(--gold);
}

.formula-example {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  margin: 2rem 0;
}

.example-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.example-item-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 2px solid var(--gold);
  box-shadow: 0 2px 8px rgba(193, 131, 28, 0.3);
}

.example-header strong {
  color: var(--gold);
  font-size: 1.125rem;
}

.example-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.stat-line.highlight {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.stat-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.stat-line strong {
  color: var(--text-primary);
  font-weight: 600;
}

.example-note {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-left: 3px solid var(--gold);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  font-style: italic;
}

.formula-note {
  padding: 1rem 1.5rem;
  background: rgba(234, 179, 8, 0.1);
  border-left: 3px solid var(--gold);
  border-radius: 4px;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.stat-values-table {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 2rem;
}

.table-header {
  padding: 1rem 1.5rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  font-weight: 600;
  color: var(--gold);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  transition: background 0.2s ease;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row:hover {
  background: var(--bg-tertiary);
}

.stat-name-col {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9375rem;
}

.stat-value-col {
  color: var(--gold);
  font-weight: 600;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9375rem;
}

.table-source {
  padding: 0.75rem 1.5rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: center;
  background: var(--bg-tertiary);
}

/* Showcase Section */
.section-showcase {
  background: var(--bg-secondary);
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.showcase-card {
  padding: 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.showcase-card:hover {
  transform: translateY(-4px);
  border-color: var(--gold);
}

.showcase-number {
  display: inline-block;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--gold), rgb(220, 148, 21));
  color: #000;
  font-size: 1.5rem;
  font-weight: 900;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.showcase-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.showcase-card p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.showcase-tech {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
}

/* CTA Section */
.section-cta {
  padding: 6rem 2rem;
}

.cta-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 2rem;
  filter: drop-shadow(0 4px 16px rgba(193, 131, 28, 0.4));
}

.section-cta h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.section-cta p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
}

.btn-cta-large {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 3rem;
  background: linear-gradient(135deg, var(--gold), rgb(220, 148, 21));
  color: #000;
  font-size: 1.25rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(193, 131, 28, 0.4);
}

.btn-cta-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(193, 131, 28, 0.6);
}

.btn-cta-large svg {
  width: 20px;
  height: 20px;
}

.last-update-info {
  margin-top: 2rem;
  padding: 0.875rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.update-icon {
  width: 16px;
  height: 16px;
  color: var(--gold);
  flex-shrink: 0;
}

.disclaimer {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  line-height: 1.6;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .formula-content {
    grid-template-columns: 1fr;
  }
  
  .stat-values-table {
    position: static;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .hero-stats {
    gap: 1rem;
  }
  
  .stat-pill {
    padding: 1rem 1.5rem;
    min-width: 120px;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .section-header p {
    font-size: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr !important;
  }
  
  .features-grid .feature-card:nth-child(4),
  .features-grid .feature-card:nth-child(5) {
    grid-column: span 1 !important;
  }
  
  .tech-cards,
  .deployment-info,
  .showcase-grid {
    grid-template-columns: 1fr;
  }
  
  .section-features,
  .section-tech,
  .section-formula,
  .section-showcase,
  .section-cta {
    padding: 4rem 1.5rem;
  }
  
  .section-cta h2 {
    font-size: 2rem;
  }
  
  .btn-cta-large {
    font-size: 1.125rem;
    padding: 1rem 2rem;
  }
}

/* Legacy styles for compatibility */
.about-section {
  padding: 2rem 1.5rem;
  color: var(--text-primary);
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 2rem;
}

.hero-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 4px 8px rgba(193, 131, 28, 0.3));
}

.hero-section h1 {
  color: var(--gold);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.tagline {
  font-size: 1.125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 1.75rem;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.highlight-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02));
  border-color: rgba(59, 130, 246, 0.3);
}

.warning-card {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.05), rgba(234, 179, 8, 0.02));
  border-color: rgba(234, 179, 8, 0.3);
}

.tips-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02));
  border-color: rgba(34, 197, 94, 0.3);
}

.how-to-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(168, 85, 247, 0.02));
  border-color: rgba(168, 85, 247, 0.3);
}

.info-card h3 {
  color: var(--gold);
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-card p {
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.info-card ul {
  line-height: 1.8;
  color: var(--text-secondary);
  padding-left: 1.5rem;
}

.info-card strong {
  color: var(--text-primary);
  font-weight: 600;
}

.formula {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gold);
  margin: 1.5rem 0;
  border: 1px solid var(--border-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
}

.rating-list {
  list-style: none;
  padding: 0;
}

.rating-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem;
  background: var(--bg-tertiary);
  margin-bottom: 0.625rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  min-width: 100px;
  text-align: center;
  font-size: 0.8125rem;
}

.eff-excellent { background: rgba(34, 197, 94, 0.15); color: var(--success); border: 1px solid rgba(34, 197, 94, 0.3); }
.eff-good { background: rgba(59, 130, 246, 0.15); color: var(--info); border: 1px solid rgba(59, 130, 246, 0.3); }
.eff-fair { background: rgba(234, 179, 8, 0.15); color: var(--warning); border: 1px solid rgba(234, 179, 8, 0.3); }
.eff-poor { background: rgba(239, 68, 68, 0.15); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.3); }

.stat-values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-value-item {
  display: flex;
  justify-content: space-between;
  padding: 0.875rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.stat-name {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
}

.stat-gold {
  color: var(--gold);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.875rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.highlight-green {
  color: var(--success);
  font-weight: 600;
}

.tips-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.tip-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  align-items: flex-start;
}

.tip-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--gold);
  color: #000;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.tip-item strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.tip-item p {
  margin: 0;
  font-size: 0.875rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.step-item {
  padding: 1.25rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--gold), rgb(220, 148, 21));
  color: #000;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.step-item p {
  margin: 0;
  font-size: 0.875rem;
}

.tech-stack {
  text-align: center;
}

.tech-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0;
  text-align: left;
}

.tech-item {
  padding: 0.875rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  font-size: 0.875rem;
}

.tech-item strong {
  color: var(--gold);
  margin-right: 0.5rem;
}

.source-link {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.source-link a {
  color: var(--gold);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.source-link a:hover {
  color: rgb(220, 148, 21);
  text-decoration: underline;
}

.disclaimer {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-tertiary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 1.75rem;
  }
  
  .stat-values-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-grid,
  .steps-grid,
  .tech-details {
    grid-template-columns: 1fr;
  }
  
  .about-section {
    padding: 1rem;
  }
  
  .info-card {
    padding: 1.25rem;
  }
}
</style>

