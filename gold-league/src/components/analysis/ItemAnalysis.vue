<script setup lang="ts">
import { useRemote } from "../../composables/useRemote";
import { type Analysis } from "../../domain/api";
import RemoteState from "./RemoteState.vue";
const props = defineProps<{ id: string }>();
const { data, loading, error, reload } = useRemote<Analysis>(
  () => `/items/${encodeURIComponent(props.id)}/ai`,
);
</script>
<template>
  <section class="item-ai">
    <h3>Effect study</h3>
    <p class="analysis-disclosure">
      AI-generated estimates. Separate from the formula-based stat values above.
    </p>
    <RemoteState
      :loading="loading"
      :error="error"
      :pending="data?.status !== 'ready'"
      @retry="reload"
      ><template v-if="data"
        ><p>{{ data.summary }}</p>
        <article v-for="effect in data.effects" :key="effect.name">
          <h4>{{ effect.name }}</h4>
          <p>
            {{ effect.description || effect.reasoning?.join(' ') || effect.explanation }}
          </p>
          <p v-if="typeof effect.estimatedGoldValue === 'number'" class="fineprint">
            Estimated effect value: {{ effect.estimatedGoldValue }} G ·
            {{ effect.confidence || "confidence unspecified" }}
          </p>
          <p v-if="effect.baseStatEquivalence" class="fineprint">{{ effect.baseStatEquivalence }}</p>
        </article>
        <h4 v-if="data.bestOn?.champions?.length">Champion hypotheses</h4>
        <p v-for="champion in data.bestOn?.champions" :key="champion.name">
          <strong>{{ champion.name }}</strong> · {{ champion.why }}
        </p>
        <p class="fineprint">
          {{ data.caveats }} {{ data.bestOn?.caveats }}
        </p></template
      ></RemoteState
    >
  </section>
</template>
