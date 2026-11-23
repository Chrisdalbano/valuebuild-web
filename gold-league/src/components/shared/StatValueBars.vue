<script setup lang="ts">
import { computed } from "vue";
import { number, statAmount, type Item } from "../../domain/items";
import { seriesColor, statShares } from "../../domain/verdict";
/** Where an item's stat value comes from: one bar per priced stat. */
const props = defineProps<{ item: Item; scale?: number }>();
const rows = computed(() => statShares(props.item));
const peak = computed(
  () => props.scale || Math.max(1, ...rows.value.map((row) => row.value)),
);
</script>
<template>
  <ul class="stat-value-bars">
    <li v-for="(stat, index) in rows" :key="stat.key" :style="{ '--i': index }">
      <span class="stat-name"
        ><i :style="{ background: seriesColor(stat.key, index) }" aria-hidden="true" />{{
          stat.label
        }}
        <span class="muted">+{{ statAmount(stat.key, stat.amount) }}</span></span
      >
      <span class="bar-track"
        ><span
          class="bar-fill"
          :style="{
            width: `${(stat.value / peak) * 100}%`,
            background: seriesColor(stat.key, index),
          }"
      /></span>
      <strong>{{ number(stat.value) }} G</strong>
      <small>{{ number(stat.share) }}%</small>
    </li>
  </ul>
</template>
