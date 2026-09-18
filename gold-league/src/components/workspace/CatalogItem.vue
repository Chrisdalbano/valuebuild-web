<script setup lang="ts">
import ItemPreview from "./ItemPreview.vue";
import { FzButton, FzIcon } from "@chrisdalbano/forza-ui";
import { number, type Item } from "../../domain/items";
import ItemArtwork from "./ItemArtwork.vue";
defineProps<{
  item: Item;
  inBuild: boolean;
  inComparison: boolean;
  buildFull: boolean;
}>();
defineEmits<{
  inspect: [item: Item];
  compare: [item: Item];
  add: [item: Item];
}>();
</script>
<template>
  <ItemPreview :item="item"><article class="catalog-item" :class="{ 'in-build': inBuild }">
    <button
      class="item-open"
      :aria-label="`Inspect ${item.name}`"
      @click="$emit('inspect', item)"
    >
      <ItemArtwork :src="item.imageUrl" :name="item.name" /><span
        class="item-heading"
        ><strong>{{ item.name }}</strong
        ><span>{{ number(item.cost) }} <span class="gold">G</span></span></span
      ><span class="item-arrow"><FzIcon name="arrowUpRight" :size="16" /></span>
    </button>
    <p class="item-subtitle">
      {{
        item.plaintext || item.tags.slice(0, 2).join(" / ") || "Utility item"
      }}
    </p>
    <div class="item-metrics">
      <span>Base-stat efficiency</span
      ><strong :class="item.efficiency >= 100 ? 'mint' : ''"
        >{{ number(item.efficiency) }}%</strong
      >
    </div>
    <div class="item-actions">
      <FzButton
        variant="ghost"
        size="sm"
        :aria-label="`Compare ${item.name}`"
        :aria-pressed="inComparison"
        @click="$emit('compare', item)"
        ><FzIcon
          :name="inComparison ? 'check' : 'sort'"
          :size="14"
        />Compare</FzButton
      ><FzButton
        size="sm"
        variant="secondary"
        :aria-label="`Add ${item.name} to build`"
        :disabled="inBuild || buildFull"
        @click="$emit('add', item)"
        ><FzIcon :name="inBuild ? 'check' : 'plus'" :size="14" />{{
          inBuild ? "Added" : "Build"
        }}</FzButton
      >
    </div>
  </article></ItemPreview>
</template>
