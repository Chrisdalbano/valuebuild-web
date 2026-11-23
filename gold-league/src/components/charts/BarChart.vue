<script setup lang="ts">
import { computed } from "vue";
/**
 * Horizontal bars with an optional reference line (100% break-even) and
 * optional stacked parts. Rows are real text; bars are decoration over them.
 */
export interface BarRow {
  key: string;
  label: string;
  /** One value, or stacked parts that are summed for the row's length. */
  parts: readonly { label?: string; value: number; color: string }[];
  display: string;
  note?: string;
}
const props = withDefaults(
  defineProps<{
    label: string;
    rows: readonly BarRow[];
    max?: number;
    reference?: number;
    referenceLabel?: string;
    legend?: readonly { label: string; color: string }[];
  }>(),
  { max: 0, reference: 0, referenceLabel: "", legend: () => [] },
);
const peak = computed(() =>
  Math.max(
    1,
    props.max,
    props.reference * 1.15,
    ...props.rows.map((row) =>
      row.parts.reduce((sum, part) => sum + Math.max(0, part.value), 0),
    ),
  ),
);
</script>
<template>
  <figure class="bv-chart bar-chart" :aria-label="label">
    <ul v-if="legend.length" class="chart-legend inline">
      <li v-for="entry in legend" :key="entry.label">
        <i :style="{ background: entry.color }" aria-hidden="true" /><span>{{
          entry.label
        }}</span>
      </li>
      <li v-if="reference && referenceLabel">
        <i class="reference-key" aria-hidden="true" /><span>{{
          referenceLabel
        }}</span>
      </li>
    </ul>
    <ol class="bar-rows">
      <li v-for="(row, index) in rows" :key="row.key" :style="{ '--i': index }">
        <span class="bar-label">{{ row.label }}</span>
        <span class="bar-track"
          ><span
            v-for="(part, at) in row.parts"
            :key="at"
            class="bar-fill"
            :title="part.label"
            :style="{
              width: `${(Math.max(0, part.value) / peak) * 100}%`,
              background: part.color,
            }" /><span
            v-if="reference"
            class="bar-reference"
            :style="{ left: `${(reference / peak) * 100}%` }"
            aria-hidden="true"
        /></span>
        <strong class="bar-value">{{ row.display }}</strong>
        <small v-if="row.note" class="bar-note">{{ row.note }}</small>
      </li>
    </ol>
  </figure>
</template>
