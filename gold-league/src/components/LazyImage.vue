<template>
  <img
    :src="loaded ? src : placeholder"
    :alt="alt"
    :class="{ 'lazy-loaded': loaded, 'lazy-loading': !loaded }"
    ref="imgRef"
    @error="handleError"
  />
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3C/svg%3E'
    }
  },
  data() {
    return {
      loaded: false,
      observer: null
    }
  },
  mounted() {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.loaded) {
            this.loadImage()
          }
        })
      }, {
        rootMargin: '50px' // Start loading 50px before entering viewport
      })
      
      this.observer.observe(this.$refs.imgRef)
    } else {
      // Fallback: load immediately
      this.loadImage()
    }
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  methods: {
    loadImage() {
      const img = new Image()
      img.onload = () => {
        this.loaded = true
      }
      img.onerror = this.handleError
      img.src = this.src
    },
    handleError() {
      this.$emit('error')
      // Could set a fallback error image here
    }
  }
}
</script>

<style scoped>
.lazy-loading {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.lazy-loaded {
  opacity: 1;
  transition: opacity 0.3s ease;
}
</style>

