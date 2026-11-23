<script setup lang="ts">
import { computed } from "vue";
import { number } from "../../domain/items";
import LineChart, { type LineSeries } from "../charts/LineChart.vue";
/**
 * When each purchase stage comes online under three farm paces. Stage gold is
 * the listed cost of that stage's items; the timings come from a flat
 * gold-per-minute model starting at 500 G, which is an illustration and not
 * observed match data.
 */
const props = defineProps<{ stages: readonly { name: string; gold: number }[] }>();
const START = 500;
const paces = [
  { key: "behind", label: "Behind · about 5 CS/min", rate: 255, color: "var(--fz-accent)" },
  { key: "even", label: "Even · about 7.5 CS/min", rate: 345, color: "var(--fz-warning)" },
  { key: "ahead", label: "Ahead · about 10 CS/min", rate: 445, color: "var(--fz-positive)" },
] as const;
const rows = computed(() => props.stages.filter((stage) => stage.gold > 0));
const time = (gold: number, rate: number) => Math.max(0, (gold - START) / rate);
const maxGold = computed(() => Math.max(START, ...rows.value.map((r) => r.gold)));
const xMax = computed(() => Math.ceil(time(maxGold.value, paces[0].rate)) + 1);
const yMax = computed(() => Math.ceil((START + paces[2].rate * xMax.value) / 1000) * 1000);
const series = computed<LineSeries[]>(() =>
  paces.map((pace) => ({
    key: pace.key,
    label: pace.label,
    color: pace.color,
    points: [
      { x: 0, y: START },
      { x: xMax.value, y: START + pace.rate * xMax.value },
    ],
  })),
);
const markers = computed(() =>
  rows.value.map((stage) => ({
    x: time(stage.gold, paces[1].rate),
    y: stage.gold,
    label: stage.name,
  })),
);
</script>
<template>
  <LineChart
    v-if="rows.length"
    label="Gold over game time at three farm paces, with each purchase stage marked on the even pace"
    :series="series"
    :markers="markers"
    x-label="Minute"
    y-label="Gold"
    :x-max="xMax"
    :y-max="yMax"
    :format-x="(v: number) => v.toFixed(1)"
    :format-y="(v: number) => `${number(v)} G`"
  >
    <ol class="timeline-stages">
      <li v-for="stage in rows" :key="stage.name">
        <strong>{{ stage.name }}</strong> {{ number(stage.gold) }} G: about
        {{ time(stage.gold, 345).toFixed(1) }} min at an even pace ({{
          time(stage.gold, 445).toFixed(1)
        }}
        ahead, {{ time(stage.gold, 255).toFixed(1) }} behind)
      </li>
    </ol>
  </LineChart>
</template>
