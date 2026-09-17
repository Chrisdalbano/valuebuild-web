<script setup lang="ts">
import { computed } from "vue";
import { FzButton, FzBadge } from "@chrisdalbano/forza-ui";
import { useRemote } from "../composables/useRemote";
import { type Analysis } from "../domain/api";
import { useWorkspace } from "../state/workspace";
import RemoteState from "../components/analysis/RemoteState.vue";
import ItemSet from "../components/analysis/ItemSet.vue";
const { data, loading, error, reload } = useRemote<Analysis>("/research");
const signals = useRemote<{
  status: string;
  patch?: string;
  championCount: number;
  topItems: { itemId: string; count: number }[];
  experiments: {
    champion: string;
    title: string;
    itemIds: string[];
    rationale: string;
  }[];
}>("/research/champions");
const { items, dataset } = useWorkspace();
const top = computed(() =>
  (signals.data.value?.topItems || []).slice(0, 8).flatMap((row) => {
    const item = items.value.find((i) => i.id === row.itemId);
    return item ? [{ ...row, item }] : [];
  }),
);
</script>
<template>
  <div class="workspace-page research-page">
    <div class="page-heading">
      <div>
        <h1>Questions worth testing.</h1>
        <p>
          Patch research, effect hypotheses, and experiments from cached
          champion studies.
        </p>
      </div>
      <FzButton
        variant="secondary"
        :loading="loading"
        @click="
          reload();
          signals.reload();
        "
        >Refresh studies</FzButton
      >
    </div>
    <p class="analysis-disclosure">
      AI-generated research. Claims and effect estimates may be wrong. These are
      not win rates or observed player builds. Catalog patch
      {{ dataset.version }}.
    </p>
    <RemoteState
      :loading="loading"
      :error="error"
      :pending="data?.status !== 'ready'"
      @retry="reload"
      ><template v-if="data"
        ><div class="panel-heading">
          <h2>Stat-value outliers</h2>
          <FzBadge>Analysis patch {{ data.patch }}</FzBadge>
        </div>
        <div class="analysis-cards">
          <article v-for="entry in data.outliers" :key="entry.itemId">
            <ItemSet :ids="[entry.itemId]" />
            <p>{{ entry.claim }}</p>
            <span class="fineprint">AI hypothesis · {{ entry.direction }}</span>
          </article>
        </div>
        <h2>Effects under the microscope</h2>
        <div class="analysis-cards">
          <article v-for="entry in data.effectSpotlights" :key="entry.itemId">
            <ItemSet :ids="[entry.itemId]" />
            <p>{{ entry.insight || entry.analysis }}</p>
          </article>
        </div>
        <h2>Experimental builds</h2>
        <div class="analysis-cards">
          <article v-for="entry in data.experimentalBuilds" :key="entry.title">
            <h3>{{ entry.title }}</h3>
            <ItemSet :ids="entry.itemIds" :name="entry.title" tryable />
            <p>{{ entry.rationale }}</p>
          </article>
        </div></template
      ></RemoteState
    >
    <section class="champion-signals">
      <h2>Across champion studies</h2>
      <RemoteState
        :loading="signals.loading.value"
        :error="signals.error.value"
        :pending="signals.data.value?.status !== 'ready'"
        @retry="signals.reload"
        ><p class="fineprint">
          Occurrences in {{ signals.data.value?.championCount }} cached
          analyses. This measures generated recommendations, not player
          popularity.
        </p>
        <div class="signal-grid">
          <article v-for="entry in top" :key="entry.itemId">
            <ItemSet :ids="[entry.itemId]" /><span class="mono"
              >{{ entry.count }} studies</span
            >
            <div class="stat-bar">
              <span
                :style="{
                  width: `${(entry.count / Math.max(...top.map((i) => i.count))) * 100}%`,
                }"
              />
            </div>
          </article>
        </div>
        <div class="analysis-cards">
          <article
            v-for="entry in signals.data.value?.experiments?.slice(0, 6)"
            :key="entry.champion + entry.title"
          >
            <h3>{{ entry.title }}</h3>
            <p class="fineprint">{{ entry.champion }}</p>
            <ItemSet :ids="entry.itemIds" :name="entry.title" tryable />
            <p>{{ entry.rationale }}</p>
          </article>
        </div></RemoteState
      >
    </section>
  </div>
</template>
