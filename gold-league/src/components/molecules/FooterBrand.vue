<script setup>
import { ref, computed, onMounted } from 'vue'
import { itemsApi } from '@/api/items'

const itemCount = ref(200)
const lastUpdateDate = ref(null)

const lastUpdate = computed(() => {
  if (!lastUpdateDate.value) return 'Fetching...'
  const diff = new Date() - lastUpdateDate.value
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return 'Just now'
})

onMounted(async () => {
  try {
    const data = await itemsApi.getMetadata()
    if (data.lastUpdated) lastUpdateDate.value = new Date(data.lastUpdated)
    if (data.itemCount) itemCount.value = data.itemCount
  } catch (error) {
    console.error('Failed to fetch ETL metadata:', error)
  }
})
</script>

<template>
  <div class="footer-brand">
    <div class="brand-logo">
      <img src="/20px-Gold_colored_icon.png" alt="Gold" class="brand-icon" />
      <h3>BuildValue</h3>
    </div>
    <p class="brand-tagline">
      Advanced gold efficiency analytics for League of Legends items.
      Make smarter build decisions with data-driven insights.
    </p>
    <div class="footer-stats">
      <div class="stat-item">
        <span class="stat-value">{{ itemCount }}+</span>
        <span class="stat-label">Items Analyzed</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ lastUpdate }}</span>
        <span class="stat-label">Last Updated</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-brand { padding-right: 2rem; }

.brand-logo { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }

.brand-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--footer-accent) 60%, transparent));
}

.brand-logo h3 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--footer-accent-bright), var(--footer-accent));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.brand-tagline {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.footer-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--footer-accent) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--footer-accent) 20%, transparent);
  border-radius: 8px;
}

.stat-item { display: flex; flex-direction: column; gap: 0.25rem; }

.stat-value { font-size: 1.25rem; font-weight: 700; color: var(--footer-accent-bright); }

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider { width: 1px; height: 40px; background: color-mix(in srgb, var(--footer-accent) 20%, transparent); }

@media (max-width: 768px) {
  .footer-brand {
    padding-right: 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid color-mix(in srgb, var(--footer-accent) 15%, transparent);
  }
  .footer-stats { flex-direction: column; align-items: stretch; }
  .stat-divider { width: 100%; height: 1px; }
}
</style>
