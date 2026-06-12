<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function handleScroll() {
  visible.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <transition name="fade-slide">
    <button v-if="visible" @click="scrollToTop" class="scroll-to-top" title="Scroll to top" aria-label="Scroll to top">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  </transition>
</template>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 2px solid var(--border-strong);
  color: var(--fg-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: var(--z-toast);
  backdrop-filter: blur(10px);
}

.scroll-to-top:hover {
  background: var(--accent-lead);
  border-color: var(--accent-lead);
  color: var(--bg-canvas);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--accent-lead) 40%, transparent);
}

.scroll-to-top:active { transform: translateY(-2px); }

.scroll-to-top svg { width: 24px; height: 24px; transition: transform 0.3s; }
.scroll-to-top:hover svg { transform: translateY(-2px); }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(16px) scale(0.8); }
.fade-slide-enter-to, .fade-slide-leave-from { opacity: 1; transform: translateY(0) scale(1); }

@media (max-width: 768px) {
  .scroll-to-top { bottom: 1rem; right: 1rem; width: 44px; height: 44px; }
  .scroll-to-top svg { width: 20px; height: 20px; }
}
</style>
