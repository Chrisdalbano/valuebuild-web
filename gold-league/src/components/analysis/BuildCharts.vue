<script setup lang="ts">
import { computed } from "vue";
import { number, type Item } from "../../domain/items";
import { efficiencyVerdict, seriesColor, statMix } from "../../domain/verdict";
import DonutChart from "../charts/DonutChart.vue";
import BarChart, { type BarRow } from "../charts/BarChart.vue";
/**
 * Two calculated views of a set of items: which stats the gold buys, and each
 * item's base-stat efficiency. Both read backend values; no AI is involved.
 */
const props = defineProps<{ items: readonly Item[] }>();
const mix = computed(() =>
  statMix(props.items).map((entry, index) => ({
    ...entry,
    color: seriesColor(entry.key, index),
  })),
);
const rows = computed<BarRow[]>(() =>
  props.items.map((item) => ({
    key: item.id,
    label: item.name,
    parts: [
      {
        value: item.efficiency,
        color: `var(--bv-band-${efficiencyVerdict(item.efficiency).key})`,
      },
    ],
    display: `${number(item.efficiency)}%`,
  })),
);
</script>
<template>
  <div v-if="items.length" class="chart-grid-2 build-charts">
    <div v-if="mix.length">
      <h4>Stat value by stat</h4>
      <DonutChart
        label="Share of the build's stat value by stat"
        :segments="mix"
        center-label="stat value"
      />
    </div>
    <div>
      <h4>Efficiency per item</h4>
      <BarChart
        label="Base-stat efficiency of each item in the build"
        :rows="rows"
        :reference="100"
        reference-label="100% = stats cover the cost"
      />
    </div>
  </div>
</template>
