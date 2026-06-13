<script setup>
import { computed, toRef } from 'vue'
import { useRouter } from 'vue-router'
import BuildItemRow from './BuildItemRow.vue'
import ChampionTimelineChart from './ChampionTimelineChart.vue'
import ChampionBuildCharts from './ChampionBuildCharts.vue'
import { useChampionAnalysis } from '@/composables/useChampionAnalysis'

// Per-champion itemization analysis. Speculative suggestions — itemIds resolve
// to real items (icons/efficiency stay formula-driven); the AI text is labeled.
const props = defineProps({
  champion: { type: Object, required: true },
  allItems: { type: Array, default: () => [] },
})

const router = useRouter()
const championId = computed(() => props.champion?.id)
const { analysis, loading, error, pending } = useChampionAnalysis(championId)

const byId = computed(() => new Map(props.allItems.map(i => [i.id, i])))
const resolve = ids => (ids || []).map(id => byId.value.get(id)).filter(Boolean)

// cumulative gold per progression stage (exact, from real item costs) for the chart
const timelineStages = computed(() =>
  (analysis.value?.progression || [])
    .map(s => ({ name: s.stage, gold: resolve(s.itemIds).reduce((sum, it) => sum + (it.cost || 0), 0) }))
    .filter(s => s.gold > 0)
)
const tryBuild = ids => {
  const valid = resolve(ids).map(i => i.id)
  if (valid.length) router.push({ path: '/builds', query: { b: valid.join(',') } })
}
</script>

<template>
  <section class="champ-analysis">
    <div class="ca-head">
      <h3>Itemization &amp; Situations</h3>
      <span class="ai-disclaimer">Speculative · estimated</span>
    </div>

    <div v-if="loading" class="ca-skeleton"><div class="sk"></div><div class="sk short"></div><div class="sk"></div></div>
    <p v-else-if="error" class="ca-note">Champion analysis is temporarily unavailable.</p>
    <p v-else-if="pending || !analysis" class="ca-note">
      This champion hasn't been analyzed for the current patch yet. Suggestions are generated per patch and
      appear here once enrichment runs.
    </p>

    <template v-else>
      <div class="ca-block">
        <div class="ca-label">Core build</div>
        <BuildItemRow :items="resolve(analysis.coreBuild?.itemIds)" tryable @try="tryBuild" />
        <p v-if="analysis.coreBuild?.rationale" class="ca-text">{{ analysis.coreBuild.rationale }}</p>
        <ChampionBuildCharts :items="resolve(analysis.coreBuild?.itemIds)" />
      </div>

      <div v-if="analysis.progression?.length" class="ca-block">
        <div class="ca-label">Build progression</div>
        <div class="ca-progression">
          <div v-for="(s, i) in analysis.progression" :key="i" class="prog-stage">
            <div class="prog-head">
              <span class="prog-name">{{ s.stage }}</span>
              <span v-if="s.gold" class="prog-gold">{{ s.gold }}</span>
            </div>
            <BuildItemRow :items="resolve(s.itemIds)" />
            <p v-if="s.note" class="ca-text">{{ s.note }}</p>
          </div>
        </div>
        <ChampionTimelineChart v-if="timelineStages.length >= 2" :stages="timelineStages" />
      </div>

      <div v-if="analysis.situational?.length" class="ca-block">
        <div class="ca-label">Situational</div>
        <div v-for="(s, i) in analysis.situational" :key="i" class="ca-sit">
          <span class="sit-when">{{ s.when }}</span>
          <BuildItemRow :items="resolve(s.itemIds)" />
          <p class="ca-text">{{ s.why }}</p>
        </div>
      </div>

      <div v-if="analysis.experimental?.itemIds?.length" class="ca-block experimental">
        <div class="ca-label">Experimental <span class="exp-tag">off-meta</span></div>
        <div class="exp-title">{{ analysis.experimental.title }}</div>
        <BuildItemRow :items="resolve(analysis.experimental.itemIds)" tryable @try="tryBuild" />
        <p v-if="analysis.experimental.rationale" class="ca-text">{{ analysis.experimental.rationale }}</p>
      </div>

      <div v-if="analysis.economy" class="ca-block ca-econ">
        <div class="econ-cell"><span class="econ-k">When ahead</span><p>{{ analysis.economy.ahead }}</p></div>
        <div class="econ-cell"><span class="econ-k">When behind</span><p>{{ analysis.economy.behind }}</p></div>
      </div>

      <p v-if="analysis.caveats" class="ca-caveats">⚠ {{ analysis.caveats }}</p>
    </template>
  </section>
</template>

<style scoped>
.champ-analysis { background: var(--bg-elevated); border: 1px solid color-mix(in srgb, var(--accent-support) 30%, var(--border)); border-radius: var(--radius-md); padding: 1.5rem; }
.ca-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.ca-head h3 { color: var(--accent-support); font-size: 1.125rem; font-weight: 600; margin: 0; }
.ai-disclaimer { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-support); background: var(--accent-support-tint); border: 1px solid color-mix(in srgb, var(--accent-support) 30%, transparent); padding: 0.25rem 0.625rem; border-radius: 999px; }

.ca-note { color: var(--fg-secondary); font-size: 0.9375rem; line-height: 1.6; margin: 0; }
.ca-skeleton { display: flex; flex-direction: column; gap: 0.75rem; }
.sk { height: 1.5rem; border-radius: var(--radius-sm); background: var(--accent-support-tint); animation: ca-sh 1.4s ease-in-out infinite; }
.sk.short { width: 60%; }
@keyframes ca-sh { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

.ca-block { padding: 1rem 0; border-top: 1px solid var(--border); }
.ca-block:first-of-type { border-top: none; padding-top: 0; }
.ca-label { color: var(--fg-muted); font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
.ca-text { color: var(--fg-secondary); font-size: 0.875rem; line-height: 1.55; margin: 0.625rem 0 0; }

.ca-progression { display: flex; flex-direction: column; gap: 0.875rem; }
.prog-stage { padding: 0.75rem 0.875rem; background: var(--bg-surface); border: 1px solid var(--border); border-left: 3px solid var(--accent-lead); border-radius: var(--radius-sm); }
.prog-head { display: flex; align-items: baseline; gap: 0.625rem; margin-bottom: 0.625rem; }
.prog-name { color: var(--fg-primary); font-size: 0.875rem; font-weight: 700; }
.prog-gold { color: var(--accent-lead); font-size: 0.75rem; font-weight: 700; font-variant-numeric: tabular-nums; }

.ca-sit { padding: 0.75rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 0.625rem; }
.sit-when { display: inline-block; color: var(--accent-support); font-weight: 700; font-size: 0.8125rem; margin-bottom: 0.5rem; }

.experimental .exp-tag { color: var(--accent-warm); background: color-mix(in srgb, var(--accent-warm) 15%, transparent); padding: 0.0625rem 0.5rem; border-radius: 999px; margin-left: 0.375rem; }
.exp-title { color: var(--fg-primary); font-weight: 700; font-size: 0.9375rem; margin-bottom: 0.625rem; }

.ca-econ { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.econ-cell { padding: 0.75rem 1rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); }
.econ-k { color: var(--accent-lead); font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.econ-cell p { color: var(--fg-secondary); font-size: 0.8125rem; line-height: 1.5; margin: 0.375rem 0 0; }

.ca-caveats { margin: 1rem 0 0; color: var(--fg-muted); font-size: 0.8125rem; font-style: italic; }

@media (max-width: 600px) { .ca-econ { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .sk { animation: none; } }
</style>
