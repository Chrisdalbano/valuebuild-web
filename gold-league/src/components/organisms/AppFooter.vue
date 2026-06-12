<script setup>
import FooterBrand from '../molecules/FooterBrand.vue'
import FooterLinkList from '../molecules/FooterLinkList.vue'

const currentYear = new Date().getFullYear()

const quickLinks = [
  { label: 'Browse Items', to: '/' },
  { label: 'Compare Items', to: '/compare' },
  { label: 'Build Optimizer', to: '/builds' },
  { label: 'About Project', to: '/about' },
]

const resources = [
  { label: 'Gold Efficiency Wiki', href: 'https://leagueoflegends.fandom.com/wiki/Gold_efficiency' },
  { label: 'Riot Games API', href: 'https://developer.riotgames.com/' },
  { label: 'Data Dragon API', href: 'https://ddragon.leagueoflegends.com/cdn/15.1.1/data/en_US/item.json' },
]

const techStack = [
  { label: 'Vue 3', href: 'https://vuejs.org/' },
  { label: 'FastAPI Backend', href: 'https://fastapi.tiangolo.com/' },
  { label: 'MongoDB', href: 'https://www.mongodb.com/' },
]
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-top">
        <FooterBrand class="footer-column" />
        <FooterLinkList title="Quick Links" :links="quickLinks" />
        <FooterLinkList title="Resources" :links="resources" />
        <FooterLinkList title="Tech Stack" :links="techStack" />
      </div>

      <div class="footer-bottom">
        <div class="footer-legal">
          <p class="copyright">© {{ currentYear }} BuildValue. Built with passion for League of Legends.</p>
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

<style scoped>
.app-footer {
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--footer-bg) 95%, transparent) 0%,
    color-mix(in srgb, var(--footer-bg) 98%, transparent) 50%,
    var(--footer-bg-deep) 100%);
  border-top: 1px solid color-mix(in srgb, var(--footer-accent) 20%, transparent);
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
  background: linear-gradient(90deg, transparent,
    color-mix(in srgb, var(--footer-accent) 50%, transparent) 50%, transparent);
}

.footer-content { max-width: 1400px; margin: 0 auto; padding: 4rem 2rem 2rem; }

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid color-mix(in srgb, var(--footer-accent) 15%, transparent);
}

.footer-bottom { display: flex; justify-content: space-between; align-items: center; gap: 2rem; padding-top: 2rem; }

.footer-legal { flex: 1; }

.copyright { color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; font-weight: 500; margin-bottom: 0.75rem; }

.disclaimer { color: rgba(255, 255, 255, 0.4); font-size: 0.75rem; line-height: 1.6; max-width: 800px; }

.footer-social { display: flex; gap: 1rem; }

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--footer-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--footer-accent) 20%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--footer-accent-bright);
  transition: all 0.3s ease;
}

.social-link:hover {
  background: color-mix(in srgb, var(--footer-accent) 20%, transparent);
  border-color: color-mix(in srgb, var(--footer-accent) 40%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--footer-accent) 30%, transparent);
}

.social-link svg { width: 20px; height: 20px; }

@media (max-width: 1024px) {
  .footer-top { grid-template-columns: 1fr 1fr; gap: 2rem; }
  .footer-top > :first-child { grid-column: 1 / -1; }
}

@media (max-width: 768px) {
  .footer-content { padding: 3rem 1.5rem 1.5rem; }
  .footer-top { grid-template-columns: 1fr; gap: 2rem; margin-bottom: 2rem; padding-bottom: 2rem; }
  .footer-bottom { flex-direction: column; align-items: flex-start; gap: 1.5rem; padding-top: 1.5rem; }
  .footer-social { align-self: center; }
}
</style>
