<script setup lang="ts">
import { computed } from "vue";
import { FzBadge } from "@chrisdalbano/forza-ui";
import { useRemote } from "../../composables/useRemote";
import { type Analysis, type Champion } from "../../domain/api";
import { useWorkspace } from "../../state/workspace";
import { number } from "../../domain/items";
import RemoteState from "./RemoteState.vue";
import ItemSet from "./ItemSet.vue";
import BuildComposition from "./BuildComposition.vue";
const props = defineProps<{ champion: Champion }>();
const { data, loading, error, reload } = useRemote<Analysis>(
  () => `/champions/${encodeURIComponent(props.champion.id)}/ai`,
);
const { items, dataset } = useWorkspace();
const core = computed(() =>
  (data.value?.coreBuild?.itemIds || []).flatMap(
    (id) => items.value.find((i) => i.id === id) || [],
  ),
);
const stages = computed(() =>
  (data.value?.progression || []).map((stage) => ({
    ...stage,
    cost: stage.itemIds.reduce(
      (sum, id) => sum + (items.value.find((i) => i.id === id)?.cost || 0),
      0,
    ),
  })),
);
</script>
<template>
  <section class="champion-detail">
    <div class="champion-detail-heading">
      <img
        :src="`https://ddragon.leagueoflegends.com/cdn/${champion.patch}/img/champion/${champion.id}.png`"
        :alt="champion.name"
        width="64"
        height="64"
      />
      <div>
        <h2>{{ champion.name }}</h2>
        <p>{{ champion.tags.join(" / ") }} · {{ champion.rangeType }}</p>
      </div>
      <FzBadge>AI-generated study</FzBadge>
    </div>
    <RemoteState
      :loading="loading"
      :error="error"
      :pending="data?.status !== 'ready'"
      @retry="reload"
      ><template v-if="data"
        ><p class="analysis-disclosure">
          Speculative suggestions, not match statistics. Analysis patch
          {{ data.patch || "unknown" }}; catalog patch {{ dataset.version }}.
        </p>
        <section v-if="data.coreBuild">
          <h3>Core build</h3>
          <ItemSet
            :ids="data.coreBuild.itemIds"
            :name="`${champion.name} core build`"
            tryable
          />
          <p>{{ data.coreBuild.rationale }}</p>
          <BuildComposition :items="core" />
        </section>
        <section v-if="stages.length">
          <h3>Purchase progression</h3>
          <div class="progression-grid">
            <article v-for="(stage, index) in stages" :key="stage.stage">
              <span class="mono accent">0{{ index + 1 }}</span>
              <h4>{{ stage.stage }}</h4>
              <ItemSet :ids="stage.itemIds" />
              <p>{{ stage.note }}</p>
              <span class="fineprint"
                >Listed item cost: {{ number(stage.cost) }} G</span
              >
            </article>
          </div>
          <div class="method-table">
            <table>
              <caption>
                Illustrative time to afford each listed set, starting at 500 G.
                Not a cumulative purchase simulation.
              </caption>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>255 G/min</th>
                  <th>345 G/min</th>
                  <th>445 G/min</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stage in stages" :key="stage.stage">
                  <th>{{ stage.stage }}</th>
                  <td v-for="rate in [255, 345, 445]" :key="rate">
                    ~{{ Math.max(0, (stage.cost - 500) / rate).toFixed(1) }} min
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section v-if="data.situational?.length">
          <h3>Adjust to the matchup</h3>
          <div class="analysis-cards">
            <article v-for="entry in data.situational" :key="entry.when">
              <h4>{{ entry.when }}</h4>
              <ItemSet :ids="entry.itemIds" />
              <p>{{ entry.why }}</p>
            </article>
          </div>
        </section>
        <section v-if="data.experimental">
          <h3>{{ data.experimental.title }}</h3>
          <ItemSet
            :ids="data.experimental.itemIds"
            :name="`${champion.name}: ${data.experimental.title}`"
            tryable
          />
          <p>{{ data.experimental.rationale }}</p>
        </section>
        <div v-if="data.economy" class="analysis-cards">
          <article>
            <h4>When ahead</h4>
            <p>{{ data.economy.ahead }}</p>
          </article>
          <article>
            <h4>When behind</h4>
            <p>{{ data.economy.behind }}</p>
          </article>
        </div>
        <p class="fineprint">{{ data.caveats }}</p></template
      ></RemoteState
    >
  </section>
</template>
