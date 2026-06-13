<script setup>
import { toRef } from 'vue'
import { useAiAnalysis } from '@/composables/useAiAnalysis'
import { useChampions } from '@/composables/useChampions'

// "Best on" — names the champions who get the most value from this item and why,
// grounded in the champion roster. Speculative synergy hypotheses, NOT a
// statement about the canonical gold-efficiency number.
const props = defineProps({
  item: { type: Object, required: true },
})

const { bestOn, loading, error, pending } = useAiAnalysis(toRef(props, 'item'))
const { championIcon } = useChampions()

const confidenceClass = c => ({ high: 'conf-high', medium: 'conf-med', low: 'conf-low' }[c] || 'conf-med')
</script>

<template>
  <section class="item-best-on-panel">
    <div class="ai-head">
      <h3>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ai-icon">
          <path d="M20 7h-9M14 17H5M17 3l3 4-3 4M7 21l-3-4 3-4"/>
        </svg>
        Best On
      </h3>
      <span class="ai-disclaimer">Speculative synergy · AI estimate</span>
    </div>

    <div v-if="loading" class="ai-skeleton">
      <div class="sk-line"></div><div class="sk-line short"></div><div class="sk-line"></div>
    </div>

    <p v-else-if="pending" class="ai-note">
      Champion synergies for this item haven't been generated for the current patch yet. They appear
      here once enrichment runs.
    </p>

    <p v-else-if="error" class="ai-note">Champion synergy analysis is temporarily unavailable.</p>

    <p v-else-if="!bestOn || !bestOn.champions || bestOn.champions.length === 0" class="ai-note">
      No standout champion synergies surfaced for this item.
    </p>

    <template v-else>
      <ul class="champ-list">
        <li v-for="(c, i) in bestOn.champions" :key="i" class="champ-row">
          <img
            v-if="championIcon(c.name)"
            :src="championIcon(c.name)"
            :alt="c.name"
            class="champ-portrait"
            loading="lazy"
            @error="e => (e.target.style.display = 'none')"
          />
          <div class="champ-main">
          <div class="champ-head">
            <span class="champ-name">{{ c.name }}</span>
            <span v-if="c.synergyStat" class="champ-stat">{{ c.synergyStat }}</span>
            <span class="champ-conf" :class="confidenceClass(c.confidence)">{{ c.confidence }}</span>
          </div>
          <p class="champ-why">{{ c.why }}</p>
          </div>
        </li>
      </ul>
      <p v-if="bestOn.caveats" class="ai-caveats">⚠ {{ bestOn.caveats }}</p>
    </template>
  </section>
</template>

<style scoped>
.item-best-on-panel {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--accent-support) 30%, var(--border));
  border-radius: var(--radius-md);
}

.ai-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.ai-head h3 { display: flex; align-items: center; gap: 0.5rem; color: var(--accent-support); font-size: 1.125rem; font-weight: 600; margin: 0; }
.ai-icon { width: 18px; height: 18px; }

.ai-disclaimer {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-support);
  background: var(--accent-support-tint);
  border: 1px solid color-mix(in srgb, var(--accent-support) 30%, transparent);
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
}

.ai-note { color: var(--fg-secondary); font-size: 0.9375rem; line-height: 1.6; margin: 0; }

.ai-skeleton { display: flex; flex-direction: column; gap: 0.75rem; }
.sk-line {
  height: 1rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--accent-support-tint) 0%,
    color-mix(in srgb, var(--accent-support) 20%, transparent) 50%, var(--accent-support-tint) 100%);
  background-size: 200% 100%;
  animation: ai-shimmer 1.4s ease-in-out infinite;
}
.sk-line.short { width: 60%; }
@keyframes ai-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.champ-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }

.champ-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 1rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); }

.champ-portrait {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  object-fit: cover;
}
.champ-main { flex: 1; min-width: 0; }

.champ-head { display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; margin-bottom: 0.375rem; }
.champ-name { color: var(--fg-primary); font-weight: 700; font-size: 0.9375rem; }
.champ-stat { color: var(--accent-support); font-size: 0.75rem; font-weight: 600; background: var(--accent-support-tint); padding: 0.125rem 0.5rem; border-radius: 999px; }

.champ-conf { margin-left: auto; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.125rem 0.5rem; border-radius: var(--radius-sm); }
.conf-high { color: var(--eff-positive); background: color-mix(in srgb, var(--eff-positive) 14%, transparent); }
.conf-med { color: var(--accent-support); background: var(--accent-support-tint); }
.conf-low { color: var(--fg-muted); background: var(--bg-elevated); }

.champ-why { margin: 0; color: var(--fg-secondary); font-size: 0.8125rem; line-height: 1.55; }

.ai-caveats { margin: 1rem 0 0; color: var(--fg-muted); font-size: 0.8125rem; line-height: 1.5; font-style: italic; }

@media (prefers-reduced-motion: reduce) { .sk-line { animation: none; } }
</style>
