<template>
  <nav class="main-navigation" :class="{ 'scrolled': isScrolled, 'menu-open': isMobileMenuOpen }">
    <div class="nav-container">
      <!-- Logo/Brand -->
      <router-link to="/" class="nav-brand">
        <img 
          src="https://raw.communitydragon.org/15.8/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/kleptomancy/kleptomancy.png"
          alt="BuildValue Logo" 
          class="brand-icon" 
        />
        <h1 class="brand-title">BuildValue</h1>
      </router-link>

      <!-- Hamburger Menu Button (Mobile) -->
      <button 
        class="hamburger-btn" 
        @click="toggleMobileMenu"
        :class="{ 'active': isMobileMenuOpen }"
        aria-label="Toggle navigation menu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Navigation Links -->
      <div class="nav-links" :class="{ 'mobile-open': isMobileMenuOpen }">
        <router-link 
          v-for="route in routes" 
          :key="route.path"
          :to="route.path"
          @click="closeMobileMenu"
          :class="['nav-link']"
          active-class="active"
        >
          <span class="nav-label">{{ route.name }}</span>
          <span v-if="getBadge(route.name)" class="nav-badge">{{ getBadge(route.name) }}</span>
        </router-link>
      </div>

      <!-- Stats Bar (Desktop) -->
      <div class="nav-stats">
        <div class="stat-item">
          <span class="stat-label">Items</span>
          <span class="stat-value">{{ itemCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Patch</span>
          <span class="stat-value">15.19</span>
        </div>
      </div>
    </div>

    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
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
.main-navigation {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.main-navigation.scrolled {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-bottom-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  min-height: 70px;
}

/* Brand Section */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  text-decoration: none;
  cursor: pointer;
}

.brand-icon {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.3));
  transition: transform 0.3s ease;
}

.brand-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
}


/* Hamburger Button */
.hamburger-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
  transition: transform 0.3s ease;
}

.hamburger-btn:hover {
  transform: scale(1.1);
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background: #ffd700;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: translateX(-20px);
}

.hamburger-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.nav-link.active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 237, 78, 0.15) 100%);
  border-color: #ffd700;
  color: #ffd700;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}


.nav-label {
  font-weight: 600;
}

.nav-badge {
  background: #ff4757;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
}


/* Stats Bar */
.nav-stats {
  display: flex;
  gap: 1.5rem;
  padding-left: 1.5rem;
  border-left: 1px solid rgba(255, 215, 0, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(255, 215, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.1rem;
  color: #ffd700;
  font-weight: 700;
}

/* Mobile Overlay */
.mobile-overlay {
  display: none;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-label {
    display: none;
  }
  
  .nav-link {
    padding: 0.75rem;
  }
  
  .nav-stats {
    padding-left: 1rem;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0.75rem 1rem;
    min-height: 60px;
  }

  .brand-title {
    font-size: 1.25rem;
  }

  .brand-icon {
    width: 32px;
    height: 32px;
  }

  .hamburger-btn {
    display: flex;
    margin-left: auto;
  }

  .nav-links {
    position: fixed;
    top: 60px;
    right: -100%;
    width: 280px;
    max-width: 85vw;
    height: calc(100vh - 60px);
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    border-left: 2px solid rgba(255, 215, 0, 0.3);
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 1.5rem;
    transition: right 0.3s ease;
    overflow-y: auto;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
    z-index: 1001;
  }

  .nav-links.mobile-open {
    right: 0;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem 1.25rem;
  }

  .nav-link .nav-label {
    display: block;
  }

  .nav-badge {
    margin-left: auto;
  }

  .nav-stats {
    display: none;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 999;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}

@media (max-width: 480px) {
  .nav-links {
    width: 100%;
    max-width: 100vw;
    border-left: none;
    border-top: 2px solid rgba(255, 215, 0, 0.3);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* Dark mode optimization */
@media (prefers-color-scheme: dark) {
  .main-navigation {
    background: linear-gradient(135deg, #0f0f1e 0%, #0a0a1a 100%);
  }
}
</style>

