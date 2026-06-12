<script setup>
import { ref, onMounted } from 'vue'
import ParticlesBg from '../atoms/ParticlesBg.vue'
import NumberTicker from '../atoms/NumberTicker.vue'
import { itemsApi } from '@/api/items'

// The opening moment: app identity + live dataset stats over faint gold particles.
const props = defineProps({
  itemCount: { type: Number, required: true },
})

const patch = ref('')
const patchMajor = ref(0)
const patchMinor = ref(0)
const patchTail = ref('') // ".1" hotfix suffix, shown statically

onMounted(async () => {
  try {
    const meta = await itemsApi.getMetadata()
    if (meta.patch) {
      patch.value = meta.patch
      const [maj, min, ...rest] = meta.patch.split('.')
      patchMajor.value = Number(maj) || 0
      patchMinor.value = Number(min) || 0
      patchTail.value = rest.length ? '.' + rest.join('.') : ''
    }
  } catch {
    /* hero degrades gracefully without metadata */
  }
})
</script>

<template>
  <section class="explorer-hero">
    <ParticlesBg :count="36" :opacity="0.4" />
    <div class="hero-inner">
      <h1 class="hero-title">Build<span class="title-accent">Value</span></h1>
      <p class="hero-tagline">Gold efficiency analytics for every League of Legends item — know what your gold is really buying.</p>
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="stat-number"><NumberTicker :value="itemCount" /></span>
          <span class="stat-caption">items analyzed</span>
        </div>
        <div class="stat-sep" aria-hidden="true"></div>
        <div class="hero-stat">
          <span class="stat-number">
            <template v-if="patch"><NumberTicker :value="patchMajor" /><span>.</span><NumberTicker :value="patchMinor" /><span>{{ patchTail }}</span></template>
            <template v-else>—</template>
          </span>
          <span class="stat-caption">current patch</span>
        </div>
        <div class="stat-sep" aria-hidden="true"></div>
        <div class="hero-stat">
          <span class="stat-number gold-tick"><NumberTicker :value="100" suffix="%" /></span>
          <span class="stat-caption">backend-computed math</span>
        </div>
      </div>
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
  margin: 0 auto 1.75rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 4vw, 2.5rem);
  flex-wrap: wrap;
}

.hero-stat { display: flex; flex-direction: column; gap: 0.25rem; min-width: 96px; }

.stat-number {
  color: var(--accent-lead);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  line-height: 1;
}

.stat-caption {
  color: var(--fg-muted);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stat-sep { width: 1px; height: 2.25rem; background: var(--border-strong); }

@media (max-width: 768px) {
  .explorer-hero { padding: 2.25rem 1.25rem 1.75rem; }
  .stat-sep { display: none; }
  .hero-stats { gap: 1.5rem; }
}
</style>
