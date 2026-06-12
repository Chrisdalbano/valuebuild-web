<script setup>
import { ref, onMounted } from 'vue'
import AboutHero from '../molecules/AboutHero.vue'
import AboutFeatureGrid from '../molecules/AboutFeatureGrid.vue'
import AboutTechStack from '../molecules/AboutTechStack.vue'
import AboutFormulaSection from '../molecules/AboutFormulaSection.vue'
import AboutShowcase from '../molecules/AboutShowcase.vue'
import AboutCta from '../molecules/AboutCta.vue'
import { useChampionSplash } from '@/composables/useChampionSplash'
import { itemsApi } from '@/api/items'

// Session-persistent splash
const { splash } = useChampionSplash()

// Last update timestamp (shown in the footer CTA)
const lastUpdate = ref(null)

onMounted(async () => {
  try {
    const data = await itemsApi.getMetadata()
    if (data && data.lastUpdate) {
      lastUpdate.value = data.lastUpdate
    }
  } catch {
    /* already logged by the api layer */
  }
})
</script>

<template>
  <div class="about-landing">
    <AboutHero :splash="splash" />
    <AboutFeatureGrid />
    <AboutTechStack />
    <AboutFormulaSection />
    <AboutShowcase />
    <AboutCta :last-update="lastUpdate" />
  </div>
</template>

<style scoped>
.about-landing { min-height: 100vh; background: var(--bg-canvas); }
</style>
