<script setup lang="ts">
import { computed } from "vue";
import { FzSegmented } from "@chrisdalbano/forza-ui";
import type { TftUnit } from "../../domain/tft/types";
import TftIcon from "./TftIcon.vue";
/** Choose one unit: a cost switch, then that cost's units as tiles. */
const props = defineProps<{ units: readonly TftUnit[]; label: string }>();
const model = defineModel<string>({ required: true });
const cost = defineModel<string>("cost", { required: true });
const costs = computed(() =>
  [...new Set(props.units.map((unit) => unit.cost))]
    .sort((a, b) => a - b)
    .map((value) => ({ value: String(value), label: `${value}-cost` })),
);
const shown = computed(() =>
  props.units.filter((unit) => String(unit.cost) === cost.value),
);
</script>
<template>
  <div class="unit-picker">
    <FzSegmented v-model="cost" label="Unit cost" :options="costs" />
    <div class="unit-tiles" role="group" :aria-label="label">
      <button
        v-for="unit in shown"
        :key="unit.id"
        type="button"
        class="unit-tile"
        :data-cost="unit.cost"
        :aria-pressed="model === unit.id"
        @click="model = unit.id"
      >
        <TftIcon :src="unit.icon" :name="unit.name" :cost="unit.cost" /><span>{{
          unit.name
        }}</span>
      </button>
    </div>
  </div>
</template>
