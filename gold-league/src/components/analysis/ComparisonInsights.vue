<script setup lang="ts">
import { computed } from "vue";
import { number, totals, type Item } from "../../domain/items";
import { combineCost, componentsOf, efficiencyVerdict } from "../../domain/verdict";
import { useWorkspace } from "../../state/workspace";
import BarChart, { type BarRow } from "../charts/BarChart.vue";
const props = defineProps<{ items: readonly Item[] }>();
const { items: catalog } = useWorkspace();
const sum = computed(() => totals(props.items));
const ranked = computed(() =>
  [...props.items].sort((a, b) => b.efficiency - a.efficiency),
);
const lead = computed(() =>
  ranked.value.length > 1
    ? ranked.value[0]!.efficiency - ranked.value[1]!.efficiency
    : 0,
);
const band = (efficiency: number) =>
  `var(--bv-band-${efficiencyVerdict(efficiency).key})`;
const efficiencyRows = computed<BarRow[]>(() =>
  ranked.value.map((item) => ({
    key: item.id,
    label: item.name,
    parts: [{ value: item.efficiency, color: band(item.efficiency) }],
    display: `${number(item.efficiency)}%`,
    note: efficiencyVerdict(item.efficiency).label,
  })),
);
const costRows = computed<BarRow[]>(() =>
  props.items.map((item) => {
    const parts = componentsOf(item, catalog.value).reduce(
      (total, part) => total + part.cost,
      0,
    );
    const combine = parts ? combineCost(item) : 0;
    return {
      key: item.id,
      label: item.name,
      parts: parts
        ? [
            { label: "Components", value: parts, color: "var(--bv-series-4)" },
            { label: "Combine cost", value: combine, color: "var(--bv-series-1)" },
          ]
        : [{ label: "Bought whole", value: item.cost, color: "var(--bv-series-6)" }],
      display: `${number(item.cost)} G`,
      note: parts
        ? `${number(parts)} G components + ${number(combine)} G`
        : "No recipe",
    };
  }),
);
const valueRows = computed<BarRow[]>(() =>
  props.items.flatMap((item) => [
    {
      key: `${item.id}-cost`,
      label: `${item.name}: cost`,
      parts: [{ value: item.cost, color: "var(--fz-accent)" }],
      display: `${number(item.cost)} G`,
    },
    {
      key: `${item.id}-value`,
      label: `${item.name}: stat value`,
      parts: [{ value: item.value, color: "var(--fz-positive)" }],
      display: `${number(item.value)} G`,
    },
  ]),
);
</script>
<template>
  <section v-if="items.length" class="comparison-insights">
    <h2>Cost and stat value</h2>
    <div v-if="ranked[0]" class="winner-card">
      <span class="winner-label">Highest base-stat efficiency</span>
      <strong>{{ ranked[0].name }}</strong>
      <span
        >{{ number(ranked[0].efficiency) }}%<template v-if="lead > 0">
          · ahead of {{ ranked[1]!.name }} by {{ number(lead) }} pts</template
        ></span
      >
    </div>
    <p v-if="ranked[0]">
      {{ ranked[0].name }} has the highest base-stat efficiency in this
      selection at {{ number(ranked[0].efficiency) }}%. Effects and champion
      interactions can change which purchase is useful.
    </p>
    <dl class="insight-metrics">
      <div>
        <dt>Combined cost</dt>
        <dd>{{ number(sum.cost) }} G</dd>
      </div>
      <div>
        <dt>Combined stat value</dt>
        <dd>{{ number(sum.value) }} G</dd>
      </div>
      <div>
        <dt>Stat value minus cost</dt>
        <dd>{{ number(sum.value - sum.cost) }} G</dd>
      </div>
      <div>
        <dt>Average purchase</dt>
        <dd>{{ number(sum.cost / items.length) }} G</dd>
      </div>
    </dl>
    <div class="chart-grid-2">
      <div>
        <h3>Base-stat efficiency</h3>
        <BarChart
          label="Base-stat efficiency of each compared item"
          :rows="efficiencyRows"
          :reference="100"
          reference-label="100% = stats cover the cost"
        />
      </div>
      <div>
        <h3>Components and combine cost</h3>
        <BarChart
          label="What each item costs in components and combine cost"
          :rows="costRows"
          :legend="[
            { label: 'Components', color: 'var(--bv-series-4)' },
            { label: 'Combine cost', color: 'var(--bv-series-1)' },
          ]"
        />
      </div>
    </div>
    <h3>Cost against stat value</h3>
    <BarChart label="Cost against stat value for each item" :rows="valueRows" />
  </section>
</template>
