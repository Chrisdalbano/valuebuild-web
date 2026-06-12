<script setup>
defineProps({
  splash: { type: String, required: true },
})
</script>

<template>
  <div>
    <div class="app-hero-splash" :style="{ backgroundImage: `url(${splash})` }"></div>
    <div class="app-hero-fade"></div>
  </div>
</template>

<style scoped>
.app-hero-splash {
  position: fixed;
  top: 60px; /* Below navbar */
  left: 0;
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center 20%;
  background-repeat: no-repeat;
  z-index: 0;
  pointer-events: none;
}

.app-hero-fade {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  height: 300px;
  /* legacy hand-tuned navy fade, kept verbatim */
  background: linear-gradient(to bottom,
    rgba(10, 13, 20, 0.4) 0%,
    rgba(10, 13, 20, 0.7) 50%,
    rgba(10, 13, 20, 0.9) 80%,
    var(--bg-canvas) 100%);
  z-index: 1;
  pointer-events: none;
}
</style>
