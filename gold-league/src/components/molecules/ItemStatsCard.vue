<script setup>
import { computed } from 'vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import GoldValue from '@/components/atoms/GoldValue.vue'
import { formatStatName, formatStatValue } from '@/api/items'
import { itemTier, sanitizeDescription } from '@/utils/itemHelpers'

// THE stats card — the one popover body every item icon extends into.
const props = defineProps({
  item: { type: Object, required: true },
})

const tier = computed(() => itemTier(props.item))
const hasStats = computed(
  () => props.item.statBreakdown && Object.keys(props.item.statBreakdown).length > 0
)
</script>

<template>
  <div class="item-stats-card">
    <div class="card-head">
      <ItemIcon :item="item" size="lg" :alt="item.name" :lazy="false" class="head-icon" />
      <div class="head-text">
        <h4>{{ item.name }}</h4>
        <span class="head-tier">{{ tier.label }}</span>
      </div>
      <div class="head-eff">
        <EfficiencyBadge :value="item.goldEfficiency" />
      </div>
    </div>

    <div class="card-meta">
      <div class="meta-cell">
        <span class="meta-label">Cost</span>
        <GoldValue :amount="item.cost" class="meta-value" />
      </div>
      <div class="meta-cell">
        <span class="meta-label">Stat Value</span>
        <GoldValue :amount="item.totalGoldValue" class="meta-value" />
      </div>
    </div>

    <div v-if="hasStats" class="card-stats">
      <div class="section-title">Stats</div>
      <div class="stats-list">
        <div v-for="(stat, key) in item.statBreakdown" :key="key" class="stat-line">
          <span class="stat-name">{{ formatStatName(key) }}</span>
          <span class="stat-amount">{{ formatStatValue(key, stat.amount) }}</span>
        </div>
      </div>
    </div>

    <div v-if="item.description" class="card-effects">
      <div class="section-title">Effects</div>
      <div class="effects-text">{{ sanitizeDescription(item.description) }}</div>
    </div>
  </div>
</template>

<style scoped>
.item-stats-card {
  width: 320px;
  max-width: calc(100vw - 2rem);
  background: var(--bg-canvas);
  border: 1px solid color-mix(in srgb, var(--accent-lead) 45%, var(--border));
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.75),
    0 0 0 1px color-mix(in srgb, var(--accent-lead) 12%, transparent);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.875rem;
  margin-bottom: 0.875rem;
  border-bottom: 1px solid var(--border);
}

.head-icon { border: 2px solid var(--accent-lead); border-radius: var(--radius-md); }

.head-text { flex: 1; min-width: 0; }

.head-text h4 {
  color: var(--fg-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  line-height: 1.25;
}

.head-tier {
  color: var(--accent-lead);
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.head-eff { font-size: 1.0625rem; font-weight: 700; }

.card-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.875rem; }

.meta-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem 0.625rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.meta-label {
  color: var(--fg-muted);
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.meta-value { font-size: 0.875rem; font-weight: 700; }

.section-title {
  color: var(--accent-lead);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.card-stats { margin-bottom: 0.875rem; }

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.625rem;
}

.stat-line { display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; }
.stat-name { color: var(--fg-secondary); font-weight: 500; }

.stat-amount {
  color: var(--accent-lead);
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.effects-text {
  color: var(--fg-secondary);
  font-size: 0.78125rem;
  line-height: 1.55;
  max-height: 132px;
  overflow-y: auto;
  padding-right: 0.375rem;
}

.effects-text::-webkit-scrollbar { width: 4px; }
.effects-text::-webkit-scrollbar-track { background: var(--bg-elevated); border-radius: 2px; }
.effects-text::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }
</style>
