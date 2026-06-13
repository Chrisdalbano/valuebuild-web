<script setup>
import { ref, onMounted } from 'vue'
import AboutHero from '../molecules/AboutHero.vue'
import AboutResearchAreas from '../molecules/AboutResearchAreas.vue'
import AboutFormulaSection from '../molecules/AboutFormulaSection.vue'
import AboutTheGap from '../molecules/AboutTheGap.vue'
import AboutCta from '../molecules/AboutCta.vue'
import { useChampionSplash } from '@/composables/useChampionSplash'
import { itemsApi } from '@/api/items'

// Session-persistent splash
const { splash } = useChampionSplash()

// Only the "items studied" count is shown on the hero now; patch + freshness
// live in the footer, so we don't repeat them here.
const itemCount = ref(0)

onMounted(async () => {
  try {
    const data = await itemsApi.getMetadata()
    if (data?.itemCount) itemCount.value = data.itemCount
  } catch {
    /* already logged by the api layer */
  }
})
</script>

<template>
  <div class="about-landing">
    <AboutHero :splash="splash" :item-count="itemCount" />
    <AboutResearchAreas />
    <AboutFormulaSection />
    <AboutTheGap />
    <AboutCta />
  </div>
</template>

<style scoped>
.about-landing { min-height: 100vh; background: var(--bg-canvas); }
</style>
