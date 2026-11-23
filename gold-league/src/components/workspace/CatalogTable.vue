<script setup lang="ts">
import { FzButton } from "@chrisdalbano/forza-ui";
import { number, type Item } from "../../domain/items";
import ItemPreview from "./ItemPreview.vue";
import ItemArtwork from "./ItemArtwork.vue";
import EfficiencyMark from "../shared/EfficiencyMark.vue";
import { itemTier } from "../../domain/verdict";
defineProps<{
  items: readonly Item[];
  buildIds: readonly string[];
  compareIds: readonly string[];
  sort?: string;
}>();
const columns = [
  { key: "name", label: "Item" },
  { key: "cost", label: "Cost" },
  { key: "value", label: "Stat value" },
  { key: "efficiency", label: "Efficiency" },
];
const direction = (sort: string | undefined, key: string) =>
  sort === `${key}-asc` || (key === "name" && sort === "name")
    ? "ascending"
    : sort === `${key}-desc` || (key === "efficiency" && sort === "efficiency")
      ? "descending"
      : "none";
defineEmits<{
  inspect: [item: Item];
  compare: [item: Item];
  add: [item: Item];
  sort: [key: string];
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
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :aria-sort="direction(sort, column.key)"
          >
            <button class="sort-header" @click="$emit('sort', column.key)">
              {{ column.label
              }}<span aria-hidden="true">{{
                direction(sort, column.key) === "ascending"
                  ? "↑"
                  : direction(sort, column.key) === "descending"
                    ? "↓"
                    : "↕"
              }}</span>
            </button>
          </th>
          <th scope="col">Rating</th>
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
                <ItemArtwork :name="item.name" :src="item.imageUrl" /><span
                  ><strong>{{ item.name }}</strong
                  ><small>{{ itemTier(item).label }}</small></span
                >
              </button></ItemPreview
            >
          </td>
          <td>{{ number(item.cost) }} G</td>
          <td>{{ number(item.value) }} G</td>
          <td><EfficiencyMark :value="item.efficiency" /></td>
          <td>
            <EfficiencyMark :value="item.efficiency" verdict class="verdict-only" />
          </td>
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
