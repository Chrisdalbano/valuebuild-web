<script setup lang="ts">
import { VgButton, VgBadge, VgMeter } from "../vantage";
import type { DemoItem } from "./data/items";
defineProps<{ item: DemoItem; selected: boolean; disabled?: boolean }>();
defineEmits<{ toggle: [id: string] }>();
</script>
<template>
  <article class="item-card" :class="{ selected }">
    <div class="item-card-top">
      <span
        class="item-icon"
        :class="item.category.toLowerCase()"
        aria-hidden="true"
        >{{ item.symbol }}</span
      ><span class="mono item-number">/ {{ item.id }}</span
      ><VgBadge :tone="selected ? 'positive' : 'neutral'">{{
        selected ? "Selected" : item.category
      }}</VgBadge>
    </div>
    <h3>{{ item.name }}</h3>
    <p class="item-description">
      {{ item.category }} / {{ item.cost.toLocaleString() }} gold
    </p>
    <div class="efficiency">
      <strong>{{ item.efficiency }}<small>%</small></strong
      ><span>STAT<br />EFFICIENCY</span>
    </div>
    <VgMeter
      :value="item.efficiency"
      :max="150"
      :label="item.name + ' stat efficiency'"
    />
    <div class="item-statline">
      <span>{{ item.attack }} attack</span><span>{{ item.health }} health</span>
    </div>
    <VgButton
      :variant="selected ? 'secondary' : 'ghost'"
      :disabled="disabled && !selected"
      :aria-pressed="selected"
      :aria-label="(selected ? 'Remove ' : 'Compare ') + item.name"
      @click="$emit('toggle', item.id)"
      >{{ selected ? "In comparison" : "+ Compare item" }}</VgButton
    >
  </article>
</template>
