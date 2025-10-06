<template>
  <nav class="navbar" :class="{ 'scrolled': isScrolled }">
    <div class="navbar-container">
      <!-- Brand -->
      <router-link to="/" class="navbar-brand" @click="closeMobileMenu">
        <img 
          src="https://raw.communitydragon.org/15.8/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/kleptomancy/kleptomancy.png"
          alt="BuildValue" 
          class="brand-logo" 
        />
        <span class="brand-name">BuildValue</span>
      </router-link>

      <!-- Desktop Navigation -->
      <div class="navbar-nav">
        <router-link 
          v-for="route in routes" 
          :key="route.path"
          :to="route.path"
          class="nav-item"
          active-class="active"
        >
          {{ route.name }}
          <span v-if="getBadge(route.name)" class="badge">{{ getBadge(route.name) }}</span>
        </router-link>
      </div>

      <!-- Right Section -->
      <div class="navbar-right">
        <!-- Item Count Badge -->
        <div class="item-count" v-if="itemCount > 0">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span class="count">{{ itemCount }}</span>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          class="mobile-menu-btn" 
          @click="toggleMobileMenu"
          :class="{ 'active': isMobileMenuOpen }"
          aria-label="Toggle menu"
        >
          <span class="line"></span>
          <span class="line"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div v-if="isMobileMenuOpen" class="mobile-menu">
        <router-link 
          v-for="route in routes" 
          :key="route.path"
          :to="route.path"
          @click="closeMobileMenu"
          class="mobile-nav-item"
          active-class="active"
        >
          <span>{{ route.name }}</span>
          <span v-if="getBadge(route.name)" class="badge">{{ getBadge(route.name) }}</span>
        </router-link>
      </div>
    </transition>

    <!-- Mobile Backdrop -->
    <transition name="fade">
      <div 
        v-if="isMobileMenuOpen" 
        class="backdrop"
        @click="closeMobileMenu"
      ></div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  compareCount: {
    type: Number,
    default: 0
  },
  buildCount: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

// State
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

// Routes configuration
const routes = [
  { path: '/', name: 'Items' },
  { path: '/compare', name: 'Compare' },
  { path: '/builds', name: 'Builds' },
  { path: '/about', name: 'About' }
]

// Methods
function getBadge(routeName) {
  if (routeName === 'Compare' && props.compareCount > 0) {
    return props.compareCount
  }
  if (routeName === 'Builds' && props.buildCount > 0) {
    return props.buildCount
  }
  return null
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// Scroll handler for sticky nav effect
function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(12, 12, 14, 0.8);
  border-bottom: 1px solid var(--border-primary);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar.scrolled {
  background: rgba(12, 12, 14, 0.95);
  border-bottom-color: var(--border-secondary);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* Brand */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  transition: opacity 0.2s;
}

.navbar-brand:hover {
  opacity: 0.8;
}

.brand-logo {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(240, 168, 41, 0.2));
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

/* Desktop Navigation */
.navbar-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.nav-item.active {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0.875rem;
  right: 0.875rem;
  height: 2px;
  background: var(--gold);
  border-radius: 2px;
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--bg-primary);
  background: var(--gold);
  border-radius: 0.625rem;
  line-height: 1;
}

/* Right Section */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.item-count .icon {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.item-count .count {
  color: var(--gold);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.mobile-menu-btn:hover {
  background: var(--bg-tertiary);
}

.mobile-menu-btn .line {
  width: 20px;
  height: 2px;
  margin: 0 auto;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-btn.active .line:first-child {
  transform: translateY(7px) rotate(45deg);
}

.mobile-menu-btn.active .line:last-child {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0.5rem;
  z-index: 999;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.15s;
}

.mobile-nav-item:hover,
.mobile-nav-item.active {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

/* Backdrop */
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
    height: 56px;
  }

  .navbar-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .item-count {
    font-size: 0.8125rem;
    padding: 0.25rem 0.5rem;
  }

  .brand-logo {
    width: 28px;
    height: 28px;
  }

  .brand-name {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .navbar-right {
    gap: 0.5rem;
  }

  .item-count .icon {
    display: none;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
