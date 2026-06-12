import { ref, onMounted, onUnmounted } from 'vue'

// Reactive viewport breakpoint check (defaults to the app's mobile breakpoint).
export function useIsMobile(maxWidth = 768) {
  const isMobile = ref(false)

  function check() {
    isMobile.value = window.innerWidth <= maxWidth
  }

  onMounted(() => {
    check()
    window.addEventListener('resize', check)
  })
  onUnmounted(() => window.removeEventListener('resize', check))

  return isMobile
}
