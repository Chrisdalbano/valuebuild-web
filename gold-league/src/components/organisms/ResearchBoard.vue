<script setup>
import { computed } from 'vue'
import ResearchOutliers from '../molecules/ResearchOutliers.vue'
import ResearchEffectSpotlights from '../molecules/ResearchEffectSpotlights.vue'
import ResearchExperimentalBuilds from '../molecules/ResearchExperimentalBuilds.vue'
import { useResearch } from '@/composables/useResearch'

// The AI Research tab — per-patch Gemini discoveries. Everything here is
// explicitly speculative (hypotheses), separate from the canonical efficiency.
defineProps({
  allItems: { type: Array, default: () => [] },
})

const { digest, loading, error, pending } = useResearch()

const generatedAt = computed(() => {
  const ts = digest.value?.generatedAt
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
})

const hasContent = computed(() => {
  const d = digest.value
  return d && ((d.outliers || []).length || (d.effectSpotlights || []).length || (d.experimentalBuilds || []).length)
})
</script>

<template>
  <div class="research-board">
    <header class="research-header">
      <div>
        <h1>AI Research</h1>
        <p class="research-sub">
          Gemini-generated discoveries for the current patch — mispriced items, what effects are really
          worth, and builds the numbers say are worth testing.
        </p>
      </div>
      <div v-if="digest?.patch" class="patch-chip">
        Patch {{ digest.patch }}<span v-if="generatedAt"> · {{ generatedAt }}</span>
      </div>
    </header>

    <div class="honesty-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      <span>
        These are <strong>AI-generated hypotheses</strong>, not ground truth. The gold-efficiency numbers
        elsewhere in the app stay formula-only; nothing here changes them.
      </span>
    </div>

    <div v-if="loading" class="research-skeleton">
      <div class="sk-block"></div><div class="sk-block"></div>
    </div>

    <div v-else-if="error" class="research-state">AI research is temporarily unavailable.</div>

    <div v-else-if="pending || !hasContent" class="research-state">
      <h2>Not generated yet</h2>
      <p v-if="digest && digest.configured === false">
        AI enrichment isn't enabled on the server yet. Once a Gemini key with available quota is
        configured and enrichment runs, this patch's discoveries appear here.
      </p>
      <p v-else>
        The research digest for patch <strong>{{ digest?.patch || 'current' }}</strong> is being
        generated. Check back shortly.
      </p>
    </div>

    <template v-else>
      <ResearchOutliers :outliers="digest.outliers || []" :all-items="allItems" />
      <ResearchEffectSpotlights :spotlights="digest.effectSpotlights || []" :all-items="allItems" />
      <ResearchExperimentalBuilds :builds="digest.experimentalBuilds || []" :all-items="allItems" />
    </template>
  </div>
</template>

<style scoped>
.research-board { width: 100%; }

.research-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.research-header h1 { font-size: clamp(1.75rem, 4vw, 2.25rem); font-weight: 800; color: var(--fg-primary); letter-spacing: -0.02em; margin-bottom: 0.5rem; }
.research-sub { color: var(--fg-secondary); font-size: 1rem; line-height: 1.6; max-width: 60ch; }

.patch-chip {
  flex-shrink: 0;
  padding: 0.5rem 0.875rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-lead);
  font-variant-numeric: tabular-nums;
}

.honesty-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  margin-bottom: 2.5rem;
  background: var(--accent-support-tint);
  border: 1px solid color-mix(in srgb, var(--accent-support) 30%, transparent);
  border-radius: var(--radius-md);
  color: var(--fg-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}
.honesty-banner svg { width: 20px; height: 20px; color: var(--accent-support); flex-shrink: 0; }
.honesty-banner strong { color: var(--fg-primary); }

.research-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-surface);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
}
.research-state h2 { color: var(--fg-primary); font-size: 1.5rem; margin-bottom: 0.75rem; }
.research-state p { color: var(--fg-secondary); max-width: 540px; margin: 0 auto; line-height: 1.6; }

.research-skeleton { display: flex; flex-direction: column; gap: 1.5rem; }
.sk-block {
  height: 180px;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--bg-surface) 0%, var(--bg-elevated) 50%, var(--bg-surface) 100%);
  background-size: 200% 100%;
  animation: research-shimmer 1.5s ease-in-out infinite;
}
@keyframes research-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .sk-block { animation: none; } }
</style>
