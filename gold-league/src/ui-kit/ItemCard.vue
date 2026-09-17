<script setup lang="ts">
import { FzButton, FzBadge, FzMeter, FzIcon } from "../forza";
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
        ><FzIcon :name="item.icon" :size="22" /></span
      ><span class="mono item-number">/ {{ item.id }}</span
      ><FzBadge :tone="selected ? 'positive' : 'neutral'">{{
        selected ? "Selected" : item.category
      }}</FzBadge>
    </div>
    <h3>{{ item.name }}</h3>
    <p class="item-description">
      {{ item.category }} / {{ item.cost.toLocaleString() }} gold
    </p>
    <div class="efficiency">
      <strong>{{ item.efficiency }}<small>%</small></strong
      ><span>STAT<br />EFFICIENCY</span>
    </div>
    <FzMeter
      :value="item.efficiency"
      :max="150"
      :label="item.name + ' stat efficiency'"
    />
    <div class="item-statline">
      <span>{{ item.attack }} attack</span><span>{{ item.health }} health</span>
    </div>
    <FzButton
      :variant="selected ? 'secondary' : 'ghost'"
      :disabled="disabled && !selected"
      :aria-pressed="selected"
      :aria-label="(selected ? 'Remove ' : 'Compare ') + item.name"
      @click="$emit('toggle', item.id)"
      ><FzIcon :name="selected ? 'check' : 'plus'" :size="15" />{{
        selected ? "In comparison" : "Compare item"
      }}</FzButton
    >
  </article>
</template>
