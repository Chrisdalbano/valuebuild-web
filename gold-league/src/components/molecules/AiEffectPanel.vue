<script setup>
import { toRef } from 'vue'
import AiBadge from '@/components/atoms/AiBadge.vue'
import { useAiAnalysis } from '@/composables/useAiAnalysis'

// Per-item effect valuation. Lazy (fetches when the modal opens). The
// canonical gold-efficiency number lives elsewhere and stays formula-only;
// everything here is explicitly a speculative AI estimate.
const props = defineProps({
  item: { type: Object, required: true },
})

const { analysis, loading, error, pending } = useAiAnalysis(toRef(props, 'item'))

// round 26.65 -> 27, keep small decimals readable
const formatAmount = n => (typeof n === 'number' ? Math.round(n) : n)
</script>

<template>
  <section class="ai-effect-panel">
    <div class="ai-head">
      <h3>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ai-icon">
          <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4 2.5 5 .5.5.5 1 .5 2h8c0-1 0-1.5.5-2 1-1 2.5-2.5 2.5-5a7 7 0 0 0-7-7Z"/>
          <path d="M9 21h6"/>
        </svg>
        Effect Analysis
      </h3>
      <span class="ai-disclaimer">Speculative estimate · not the efficiency number</span>
    </div>

    <!-- loading -->
    <div v-if="loading" class="ai-skeleton">
      <div class="sk-line"></div><div class="sk-line short"></div><div class="sk-line"></div>
    </div>

    <!-- not analyzed yet (no key / no quota / pre-enrichment) -->
    <p v-else-if="pending" class="ai-note">
      This item hasn't been analyzed for the current patch yet. AI effect valuations are generated
      per patch and appear here once enrichment runs.
    </p>

    <p v-else-if="error" class="ai-note">AI analysis is temporarily unavailable.</p>

    <p v-else-if="!analysis.effects || analysis.effects.length === 0" class="ai-note">
      No non-stat effects to value — this item's worth is fully captured by the stat breakdown above.
    </p>

    <!-- ready: the effect → base-stat → gold map -->
    <template v-else>
      <div class="effect-map">
        <div v-for="(eff, i) in analysis.effects" :key="i" class="effect-row">
          <div class="effect-flow">
            <span class="flow-effect">{{ eff.name }}</span>
            <span class="flow-arrow" aria-hidden="true">→</span>
            <span class="flow-equiv">{{ eff.baseStatEquivalence }}</span>
            <span class="flow-arrow" aria-hidden="true">→</span>
            <AiBadge :value="eff.estimatedGoldValue" :confidence="eff.confidence" />
          </div>
          <div v-if="eff.comparisons && eff.comparisons.length" class="effect-compares">
            <span class="compare-lead">≈ worth</span>
            <span v-for="(c, k) in eff.comparisons" :key="k" class="compare-chip">
              <strong>{{ formatAmount(c.amount) }}</strong> {{ c.stat }}
            </span>
          </div>
          <ul v-if="eff.reasoning && eff.reasoning.length" class="effect-reasoning">
            <li v-for="(step, j) in eff.reasoning" :key="j">{{ step }}</li>
          </ul>
        </div>
      </div>

      <p v-if="analysis.summary" class="ai-summary">{{ analysis.summary }}</p>
      <p v-if="analysis.caveats" class="ai-caveats">⚠ {{ analysis.caveats }}</p>
    </template>
  </section>
</template>

<style scoped>
.ai-effect-panel {
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

.effect-map { display: flex; flex-direction: column; gap: 1rem; }

.effect-row { padding: 1rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); }

.effect-flow { display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap; }
.flow-effect { color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; }
.flow-arrow { color: var(--accent-support); font-weight: 700; }
.flow-equiv { color: var(--fg-secondary); font-size: 0.875rem; }

.effect-compares { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem; }
.compare-lead { color: var(--fg-muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.compare-chip {
  font-size: 0.8125rem;
  color: var(--fg-secondary);
  background: var(--accent-support-tint);
  border: 1px solid color-mix(in srgb, var(--accent-support) 25%, transparent);
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
}
.compare-chip strong { color: var(--accent-support); font-weight: 700; }

.effect-reasoning { margin: 0.75rem 0 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
.effect-reasoning li { color: var(--fg-muted); font-size: 0.8125rem; line-height: 1.5; }

.ai-summary { margin: 1.25rem 0 0; color: var(--fg-secondary); font-size: 0.9375rem; line-height: 1.6; }
.ai-caveats { margin: 0.625rem 0 0; color: var(--fg-muted); font-size: 0.8125rem; line-height: 1.5; font-style: italic; }

@media (prefers-reduced-motion: reduce) { .sk-line { animation: none; } }
</style>
