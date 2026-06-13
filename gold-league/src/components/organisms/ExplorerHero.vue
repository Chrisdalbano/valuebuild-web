<script setup>
import ParticlesBg from '../atoms/ParticlesBg.vue'

// The opening moment: app identity over faint gold particles. Dataset stats
// (items / patch / computed-math) live in the footer now, not blasted here.
defineProps({
  itemCount: { type: Number, default: 0 },
})
</script>

<template>
  <section class="explorer-hero">
    <ParticlesBg :count="36" :opacity="0.4" />
    <div class="hero-inner">
      <h1 class="hero-title">Build<span class="title-accent">Value</span></h1>
      <p class="hero-tagline">Gold efficiency analytics for every League of Legends item — know what your gold is really buying.</p>
    </div>
  </section>
</template>

<style scoped>
.explorer-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(ellipse 80% 120% at 50% -20%, color-mix(in srgb, var(--accent-lead) 8%, transparent), transparent 60%),
    var(--bg-surface);
  padding: 3rem 2rem 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.hero-inner { position: relative; z-index: var(--z-raised); }

.hero-title {
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--fg-primary);
  line-height: 1.05;
  margin-bottom: 0.625rem;
}

.title-accent {
  background: linear-gradient(120deg, var(--accent-lead-hover), var(--accent-lead) 55%, var(--accent-warm-hover));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-tagline {
  color: var(--fg-secondary);
  font-size: clamp(0.9375rem, 1.6vw, 1.0625rem);
  max-width: 56ch;
  margin: 0 auto;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .explorer-hero { padding: 2.25rem 1.25rem 1.75rem; }
}
</style>
