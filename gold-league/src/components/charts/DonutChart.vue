<script setup lang="ts">
import { computed } from "vue";
/**
 * Share-of-total ring drawn as SVG arcs. The legend carries every label and
 * value as text, so the picture is never the only way to read the numbers.
 */
const props = withDefaults(
  defineProps<{
    label: string;
    segments: readonly { key: string; label: string; value: number; color: string }[];
    unit?: string;
    centerLabel?: string;
  }>(),
  { unit: "G", centerLabel: "" },
);
const format = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
const total = computed(() =>
  props.segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0),
);
const radius = 42,
  circumference = 2 * Math.PI * radius;
const arcs = computed(() => {
  let offset = 0;
  return props.segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const share = total.value ? segment.value / total.value : 0;
      const arc = {
        ...segment,
        share,
        dash: `${Math.max(0, share * circumference - 1.5)} ${circumference}`,
        offset: -offset * circumference,
      };
      offset += share;
      return arc;
    });
});
</script>
<template>
  <figure class="bv-chart donut-chart">
    <svg viewBox="0 0 100 100" role="img" :aria-label="label">
      <circle class="donut-track" cx="50" cy="50" :r="radius" />
      <circle
        v-for="(arc, index) in arcs"
        :key="arc.key"
        class="donut-arc"
        cx="50"
        cy="50"
        :r="radius"
        :stroke="arc.color"
        :stroke-dasharray="arc.dash"
        :stroke-dashoffset="arc.offset"
        :style="{ '--i': index }"
      />
      <text class="donut-total" x="50" y="49" text-anchor="middle">
        {{ format(total) }}
      </text>
      <text class="donut-caption" x="50" y="60" text-anchor="middle">
        {{ centerLabel || unit }}
      </text>
    </svg>
    <figcaption>
      <ul class="chart-legend">
        <li v-for="arc in arcs" :key="arc.key">
          <i :style="{ background: arc.color }" aria-hidden="true" /><span>{{
            arc.label
          }}</span
          ><strong>{{ format(arc.value) }} {{ unit }}</strong
          ><small>{{ Math.round(arc.share * 100) }}%</small>
        </li>
      </ul>
    </figcaption>
  </figure>
</template>
