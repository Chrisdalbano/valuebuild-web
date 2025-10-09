<template>
  <footer class="app-footer">
    <div class="footer-content">
      <!-- Top Section -->
      <div class="footer-top">
        <div class="footer-column footer-brand">
          <div class="brand-logo">
            <img src="/20px-Gold_colored_icon.png" alt="Gold" class="brand-icon" />
            <h3>BuildValue</h3>
          </div>
          <p class="brand-tagline">
            Advanced gold efficiency analytics for League of Legends items. 
            Make smarter build decisions with data-driven insights.
          </p>
          <div class="footer-stats">
            <div class="stat-item">
              <span class="stat-value">{{ itemCount }}+</span>
              <span class="stat-label">Items Analyzed</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ lastUpdate }}</span>
              <span class="stat-label">Last Updated</span>
            </div>
          </div>
        </div>

        <div class="footer-column">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><router-link to="/">Browse Items</router-link></li>
            <li><router-link to="/compare">Compare Items</router-link></li>
            <li><router-link to="/builds">Build Optimizer</router-link></li>
            <li><router-link to="/about">About Project</router-link></li>
          </ul>
        </div>

        <div class="footer-column">
          <h4>Resources</h4>
          <ul class="footer-links">
            <li>
              <a href="https://leagueoflegends.fandom.com/wiki/Gold_efficiency" target="_blank" rel="noopener noreferrer">
                Gold Efficiency Wiki
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </li>
            <li>
              <a href="https://developer.riotgames.com/" target="_blank" rel="noopener noreferrer">
                Riot Games API
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </li>
            <li>
              <a href="https://ddragon.leagueoflegends.com/cdn/15.1.1/data/en_US/item.json" target="_blank" rel="noopener noreferrer">
                Data Dragon API
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-column">
          <h4>Tech Stack</h4>
          <ul class="footer-links">
            <li>
              <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">
                Vue 3
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </li>
            <li>
              <a href="https://fastapi.tiangolo.com/" target="_blank" rel="noopener noreferrer">
                FastAPI Backend
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </li>
            <li>
              <a href="https://www.mongodb.com/" target="_blank" rel="noopener noreferrer">
                MongoDB
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="footer-bottom">
        <div class="footer-legal">
          <p class="copyright">
            © {{ currentYear }} BuildValue. Built with passion for League of Legends.
          </p>
          <p class="disclaimer">
            BuildValue is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games 
            or anyone officially involved in producing or managing League of Legends. League of Legends and 
            Riot Games are trademarks or registered trademarks of Riot Games, Inc.
          </p>
        </div>
        <div class="footer-social">
          <a href="https://github.com/Chrisdalbano/valuebuild-web" target="_blank" rel="noopener noreferrer" class="social-link" title="View on GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentYear = new Date().getFullYear()
const itemCount = ref(200)
const lastUpdateDate = ref(null)

const lastUpdate = computed(() => {
  if (!lastUpdateDate.value) return 'Fetching...'
  
  const now = new Date()
  const diff = now - lastUpdateDate.value
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return 'Just now'
})

onMounted(async () => {
  try {
    // Fetch ETL metadata for last update timestamp
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/items/metadata`)
    if (response.ok) {
      const data = await response.json()
      if (data.lastUpdate) {
        lastUpdateDate.value = new Date(data.lastUpdate)
      }
      if (data.itemCount) {
        itemCount.value = data.itemCount
      }
    }
  } catch (error) {
    console.error('Failed to fetch ETL metadata:', error)
  }
})
</script>

<style scoped>
.app-footer {
  background: linear-gradient(180deg, 
    rgba(17, 24, 39, 0.95) 0%, 
    rgba(17, 24, 39, 0.98) 50%,
    #0a0e1a 100%
  );
  border-top: 1px solid rgba(139, 92, 246, 0.2);
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

.app-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(139, 92, 246, 0.5) 50%, 
    transparent
  );
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
}

/* Top Section */
.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.15);
}

.footer-column h4 {
  color: #c9a6ff;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

/* Brand Column */
.footer-brand {
  padding-right: 2rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.brand-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
}

.brand-logo h3 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #c9a6ff, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.brand-tagline {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.footer-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #c9a6ff;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(139, 92, 246, 0.2);
}

/* Links */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links li a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.footer-links li a:hover {
  color: #c9a6ff;
  transform: translateX(4px);
}

.external-icon {
  width: 14px;
  height: 14px;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.footer-links li a:hover .external-icon {
  opacity: 1;
}

/* Bottom Section */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding-top: 2rem;
}

.footer-legal {
  flex: 1;
}

.copyright {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.disclaimer {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  line-height: 1.6;
  max-width: 800px;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c9a6ff;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.social-link svg {
  width: 20px;
  height: 20px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer-top {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer-content {
    padding: 3rem 1.5rem 1.5rem;
  }

  .footer-top {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
  }

  .footer-brand {
    padding-right: 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.15);
  }

  .footer-stats {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding-top: 1.5rem;
  }

  .footer-social {
    align-self: center;
  }
}
</style>

