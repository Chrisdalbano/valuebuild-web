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

// Live dataset stats for the research hero + closing CTA
const itemCount = ref(0)
const patch = ref('')
const lastUpdate = ref(null)

onMounted(async () => {
  try {
    const data = await itemsApi.getMetadata()
    if (data) {
      if (data.itemCount) itemCount.value = data.itemCount
      if (data.patch) patch.value = data.patch
      if (data.lastUpdate || data.lastUpdated) lastUpdate.value = data.lastUpdate || data.lastUpdated
    }
  } catch {
    /* already logged by the api layer */
  }
})
</script>

<template>
  <div class="about-landing">
    <AboutHero :splash="splash" :item-count="itemCount" :patch="patch" />
    <AboutResearchAreas />
    <AboutFormulaSection />
    <AboutTheGap />
    <AboutCta :last-update="lastUpdate" />
  </div>
</template>

<style scoped>
.about-landing { min-height: 100vh; background: var(--bg-canvas); }
</style>
