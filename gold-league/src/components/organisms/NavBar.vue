<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MobileNavMenu from '../molecules/MobileNavMenu.vue'

const props = defineProps({
  compareCount: { type: Number, default: 0 },
  buildCount: { type: Number, default: 0 },
  itemCount: { type: Number, default: 0 },
})

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const routes = computed(() => [
  { path: '/', name: 'Items', badge: null },
  { path: '/compare', name: 'Compare', badge: props.compareCount > 0 ? props.compareCount : null },
  { path: '/builds', name: 'Builds', badge: props.buildCount > 0 ? props.buildCount : null },
  { path: '/about', name: 'About', badge: null },
])

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-container">
      <router-link to="/" class="navbar-brand" @click="closeMobileMenu">
        <img
          src="https://raw.communitydragon.org/15.8/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/kleptomancy/kleptomancy.png"
          alt="BuildValue"
          class="brand-logo"
        />
        <span class="brand-name">BuildValue</span>
      </router-link>

      <div class="navbar-nav">
        <router-link
          v-for="route in routes"
          :key="route.path"
          :to="route.path"
          class="nav-item"
          active-class="active"
        >
          {{ route.name }}
          <span v-if="route.badge" class="badge">{{ route.badge }}</span>
        </router-link>
      </div>

      <div class="navbar-right">
        <div class="item-count" v-if="itemCount > 0">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span class="count">{{ itemCount }}</span>
        </div>

        <button
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          :class="{ active: isMobileMenuOpen }"
          aria-label="Toggle menu"
        >
          <span class="line"></span>
          <span class="line"></span>
        </button>
      </div>
    </div>

    <MobileNavMenu :open="isMobileMenuOpen" :routes="routes" @close="closeMobileMenu" />
  </nav>
</template>

<style scoped>
.navbar { position: fixed; top: 0; left: 0; right: 0; z-index: var(--z-nav); background: color-mix(in srgb, var(--bg-canvas) 80%, transparent); border-bottom: 1px solid var(--border); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }

.navbar.scrolled {
  background: color-mix(in srgb, var(--bg-canvas) 95%, transparent);
  border-bottom-color: var(--border-strong);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.navbar-container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 2rem; }

.navbar-brand { display: flex; align-items: center; gap: 0.625rem; text-decoration: none; transition: opacity 0.2s; }
.navbar-brand:hover { opacity: 0.8; }

.brand-logo { width: 32px; height: 32px; filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--accent-lead) 20%, transparent)); }

.brand-name { font-size: 1.125rem; font-weight: 600; color: var(--fg-primary); letter-spacing: -0.025em; }

.navbar-nav { display: flex; align-items: center; gap: 0.25rem; flex: 1; }

.nav-item { position: relative; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.875rem; font-size: 0.875rem; font-weight: 500; color: var(--fg-secondary); text-decoration: none; border-radius: var(--radius-md); transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap; }

.nav-item:hover, .nav-item.active { color: var(--fg-primary); background: var(--bg-elevated); }

.nav-item.active::after { content: ''; position: absolute; bottom: 0; left: 0.875rem; right: 0.875rem; height: 2px; background: var(--accent-lead); border-radius: 2px; }

.badge { display: inline-flex; align-items: center; justify-content: center; min-width: 1.25rem; height: 1.25rem; padding: 0 0.375rem; font-size: 0.6875rem; font-weight: 600; color: var(--accent-lead); background: var(--bg-surface); border-radius: 4px; line-height: 1; }

.navbar-right { display: flex; align-items: center; gap: 1rem; }

.item-count { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 500; color: var(--fg-secondary); }

.item-count .icon { width: 16px; height: 16px; opacity: 0.5; }
.item-count .count { color: var(--accent-lead); font-weight: 600; font-variant-numeric: tabular-nums; }

.mobile-menu-btn { display: none; flex-direction: column; justify-content: center; gap: 5px; width: 40px; height: 40px; padding: 0; background: none; border: none; border-radius: var(--radius-md); cursor: pointer; transition: background 0.2s; }

.mobile-menu-btn:hover { background: var(--bg-elevated); }

.mobile-menu-btn .line { width: 20px; height: 2px; margin: 0 auto; background: var(--fg-secondary); border-radius: 2px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }

.mobile-menu-btn.active .line:first-child { transform: translateY(7px) rotate(45deg); }
.mobile-menu-btn.active .line:last-child { transform: translateY(-7px) rotate(-45deg); }

@media (max-width: 768px) {
  .navbar-container { padding: 0 1rem; height: 56px; }
  .navbar-nav { display: none; }
  .mobile-menu-btn { display: flex; }
  .item-count { font-size: 0.8125rem; padding: 0.25rem 0.5rem; }
  .brand-logo { width: 28px; height: 28px; }
  .brand-name { font-size: 1rem; }
}

@media (max-width: 480px) {
  .navbar-right { gap: 0.5rem; }
  .item-count .icon { display: none; }
}
</style>
