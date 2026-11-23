<script setup lang="ts">
import { computed, shallowRef } from "vue";
/**
 * Small SVG line chart: several series over a shared numeric x axis, optional
 * labelled points and one vertical marker. Pointer or arrow keys move a
 * readout along x; the readout is plain text below the plot.
 */
export interface LineSeries {
  key: string;
  label: string;
  color: string;
  points: readonly { x: number; y: number }[];
  dashed?: boolean;
}
const props = withDefaults(
  defineProps<{
    label: string;
    series: readonly LineSeries[];
    markers?: readonly { x: number; y: number; label: string }[];
    xLabel: string;
    yLabel: string;
    xMax: number;
    yMax: number;
    cursor?: number | null;
    formatX?: (value: number) => string;
    formatY?: (value: number) => string;
    interactive?: boolean;
  }>(),
  {
    markers: () => [],
    cursor: null,
    formatX: (value: number) => String(Math.round(value)),
    formatY: (value: number) => String(Math.round(value)),
    interactive: true,
  },
);
const emit = defineEmits<{ "update:cursor": [value: number] }>();
const W = 640,
  H = 300,
  pad = { left: 46, right: 14, top: 14, bottom: 34 };
const plotW = W - pad.left - pad.right,
  plotH = H - pad.top - pad.bottom;
const sx = (x: number) => pad.left + (x / Math.max(1e-9, props.xMax)) * plotW;
const sy = (y: number) =>
  pad.top + plotH - (y / Math.max(1e-9, props.yMax)) * plotH;
const paths = computed(() =>
  props.series.map((series) => ({
    ...series,
    d: series.points
      .map(
        (point, index) =>
          `${index ? "L" : "M"}${sx(point.x).toFixed(1)} ${sy(Math.min(point.y, props.yMax)).toFixed(1)}`,
      )
      .join(" "),
  })),
);
const ticks = (max: number, count: number) =>
  Array.from({ length: count + 1 }, (_, index) => (max / count) * index);
const xTicks = computed(() => ticks(props.xMax, 5)),
  yTicks = computed(() => ticks(props.yMax, 4));
const local = shallowRef<number | null>(null);
const at = computed(() => props.cursor ?? local.value);
function valueAt(series: LineSeries, x: number): number | null {
  const points = series.points;
  if (!points.length || x < points[0]!.x) return null;
  for (let index = 1; index < points.length; index++) {
    const a = points[index - 1]!,
      b = points[index]!;
    if (x <= b.x)
      return b.x === a.x ? b.y : a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
  }
  return points[points.length - 1]!.y;
}
const readout = computed(() =>
  at.value === null
    ? []
    : props.series.flatMap((series) => {
        const y = valueAt(series, at.value!);
        return y === null ? [] : [{ ...series, y }];
      }),
);
function set(x: number) {
  const bounded = Math.max(0, Math.min(props.xMax, x));
  local.value = bounded;
  emit("update:cursor", bounded);
}
function pointer(event: PointerEvent) {
  if (props.cursor !== null && event.type === "pointermove" && !event.buttons)
    return;
  const box = (event.currentTarget as SVGElement).getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width) * W;
  set(((x - pad.left) / plotW) * props.xMax);
}
function key(event: KeyboardEvent) {
  const step = props.xMax / 40;
  if (event.key === "ArrowRight") set((at.value ?? 0) + step);
  else if (event.key === "ArrowLeft") set((at.value ?? 0) - step);
  else return;
  event.preventDefault();
}
</script>
<template>
  <figure class="bv-chart line-chart">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      role="img"
      :aria-label="label"
      :tabindex="interactive ? 0 : undefined"
      @pointermove="interactive && pointer($event)"
      @pointerdown="interactive && pointer($event)"
      @keydown="interactive && key($event)"
    >
      <g class="chart-grid">
        <line
          v-for="tick in yTicks"
          :key="`y${tick}`"
          :x1="pad.left"
          :x2="W - pad.right"
          :y1="sy(tick)"
          :y2="sy(tick)"
        />
      </g>
      <g class="chart-axis">
        <text
          v-for="tick in yTicks"
          :key="`yt${tick}`"
          :x="pad.left - 8"
          :y="sy(tick) + 4"
          text-anchor="end"
        >
          {{ formatY(tick) }}
        </text>
        <text
          v-for="tick in xTicks"
          :key="`xt${tick}`"
          :x="sx(tick)"
          :y="H - 14"
          text-anchor="middle"
        >
          {{ formatX(tick) }}
        </text>
      </g>
      <path
        v-for="(path, index) in paths"
        :key="path.key"
        class="chart-line"
        :class="{ dashed: path.dashed }"
        :d="path.d"
        :stroke="path.color"
        pathLength="1"
        :style="{ '--i': index }"
      />
      <g v-for="marker in markers" :key="marker.label" class="chart-marker">
        <circle :cx="sx(marker.x)" :cy="sy(marker.y)" r="5" />
      </g>
      <g v-if="at !== null" class="chart-cursor">
        <line :x1="sx(at)" :x2="sx(at)" :y1="pad.top" :y2="pad.top + plotH" />
        <circle
          v-for="entry in readout"
          :key="entry.key"
          :cx="sx(at)"
          :cy="sy(Math.min(entry.y, yMax))"
          r="4"
          :fill="entry.color"
        />
      </g>
    </svg>
    <figcaption>
      <p class="chart-axes-note">{{ yLabel }} against {{ xLabel }}.</p>
      <ul class="chart-legend inline">
        <li v-for="entry in series" :key="entry.key">
          <i :style="{ background: entry.color }" aria-hidden="true" /><span>{{
            entry.label
          }}</span>
        </li>
      </ul>
      <p v-if="at !== null && readout.length" class="chart-readout" aria-live="off">
        <span>{{ xLabel }} {{ formatX(at) }}</span>
        <span v-for="entry in readout" :key="entry.key"
          ><i :style="{ background: entry.color }" aria-hidden="true" />{{
            entry.label
          }}: <strong>{{ formatY(entry.y) }}</strong></span
        >
      </p>
      <slot />
    </figcaption>
  </figure>
</template>
