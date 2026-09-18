<script setup lang="ts">
import { FzButton } from "@chrisdalbano/forza-ui";
import { number, type Item } from "../../domain/items";
import ItemPreview from "./ItemPreview.vue";
import ItemArtwork from "./ItemArtwork.vue";
defineProps<{
  items: readonly Item[];
  buildIds: readonly string[];
  compareIds: readonly string[];
}>();
defineEmits<{
  inspect: [item: Item];
  compare: [item: Item];
  add: [item: Item];
}>();
</script>
<template>
  <div
    class="catalog-table-scroll"
    tabindex="0"
    aria-label="Item table, scroll for actions"
  >
    <table class="catalog-table">
      <caption class="sr-only">
        Filtered items and base-stat values
      </caption>
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Cost</th>
          <th scope="col">Stat value</th>
          <th scope="col">Efficiency</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>
            <ItemPreview :item="item"
              ><button
                class="item-identity"
                :aria-label="`Inspect ${item.name}`"
                @click="$emit('inspect', item)"
              >
                <ItemArtwork :name="item.name" :src="item.imageUrl" /><strong>{{
                  item.name
                }}</strong>
              </button></ItemPreview
            >
          </td>
          <td>{{ number(item.cost) }} G</td>
          <td>{{ number(item.value) }} G</td>
          <td>{{ number(item.efficiency) }}%</td>
          <td>
            <div class="inline-actions">
              <FzButton
                size="sm"
                variant="ghost"
                :aria-label="`Compare ${item.name}`"
                :aria-pressed="compareIds.includes(item.id)"
                @click="$emit('compare', item)"
                >Compare</FzButton
              ><FzButton
                size="sm"
                variant="secondary"
                :aria-label="`Add ${item.name} to build`"
                :disabled="buildIds.includes(item.id) || buildIds.length >= 6"
                @click="$emit('add', item)"
                >{{ buildIds.includes(item.id) ? "Added" : "Build" }}</FzButton
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
