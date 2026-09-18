<script setup lang="ts">
import { FzButton, FzBadge } from "@chrisdalbano/forza-ui";
import { useRemote } from "../../composables/useRemote";
import type { Analysis } from "../../domain/api";
import EffectValuation from "./EffectValuation.vue";
const props = defineProps<{ id: string }>();
const { data, loading, error, reload } = useRemote<Analysis>(
  () => `/items/${encodeURIComponent(props.id)}/ai`,
);
</script>
<template>
  <section class="item-ai" aria-label="AI item analysis">
    <div class="panel-heading">
      <h3>AI effect analysis</h3>
      <FzBadge>Estimated</FzBadge>
    </div>
    <p class="analysis-disclosure">
      Effect values and champion synergies are AI estimates. Your base-stat
      efficiency and build totals remain formula-based.
    </p>
    <p v-if="loading" role="status">Loading this item's cached analysis...</p>
    <div v-else-if="error">
      <p role="alert">{{ error }}</p>
      <FzButton size="sm" variant="secondary" @click="reload"
        >Retry analysis</FzButton
      >
    </div>
    <div v-else-if="data?.status !== 'ready'" class="analysis-pending">
      <h4>
        {{
          data?.configured === false
            ? "AI analysis is not configured"
            : "Not analyzed for this patch yet"
        }}
      </h4>
      <p>
        There is no current cached estimate for this item. Estimates appear when
        the analysis pipeline runs; refreshing this panel only checks for an
        existing result.
      </p>
      <FzButton size="sm" variant="secondary" @click="reload"
        >Check again</FzButton
      >
    </div>
    <template v-else>
      <p v-if="data.patch" class="fineprint">
        Analysis patch {{ data.patch
        }}<template v-if="data.generatedAt">
          · Generated
          {{ new Date(data.generatedAt).toLocaleDateString() }}</template
        >
      </p>
      <p v-if="data.summary">{{ data.summary }}</p>
      <EffectValuation
        v-for="(effect, index) in data.effects"
        :key="`${effect.name}-${index}`"
        :effect="effect"
      />
      <p v-if="!data.effects?.length">
        No non-stat effects were valued in this analysis.
      </p>
      <p v-if="data.caveats" class="fineprint">{{ data.caveats }}</p>
      <h3>Best on: champion synergies</h3>
      <article
        v-for="champion in data.bestOn?.champions"
        :key="champion.name"
        class="champion-synergy"
      >
        <div class="panel-heading">
          <h4>{{ champion.name }}</h4>
          <FzBadge v-if="champion.confidence"
            >{{ champion.confidence }} confidence</FzBadge
          >
        </div>
        <p v-if="champion.synergyStat" class="synergy-stat">
          {{ champion.synergyStat }}
        </p>
        <p>{{ champion.why }}</p>
      </article>
      <p v-if="!data.bestOn?.champions?.length">
        No champion synergy estimates are available for this item yet.
      </p>
      <p v-if="data.bestOn?.caveats" class="fineprint">
        {{ data.bestOn.caveats }}
      </p>
    </template>
  </section>
</template>
