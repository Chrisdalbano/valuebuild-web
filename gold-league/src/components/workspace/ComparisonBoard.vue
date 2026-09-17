<script setup lang="ts">
import { computed } from "vue";
import { FzButton, FzIcon } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number, statDefinitions, statAmount } from "../../domain/items";
import ItemArtwork from "./ItemArtwork.vue";
const { comparison, compare, add, inspect, buildIds } = useWorkspace();
const rows = computed(() =>
  Object.keys(statDefinitions).filter((key) =>
    comparison.value.some((item) => item.stats[key]),
  ),
);
const baseline = computed(() => comparison.value[0]);
</script>
<template>
  <div
    class="comparison-scroll"
    tabindex="0"
    aria-label="Item comparison, scroll horizontally for more items"
  >
    <table class="comparison-table">
      <caption>
        The first item is your baseline. Deltas compare cost and stat
        efficiency.
      </caption>
      <thead>
        <tr>
          <th scope="col">The tradeoffs</th>
          <th v-for="(item, i) in comparison" :key="item.id" scope="col">
            <span class="comparison-label">{{
              i === 0 ? "Baseline" : `Option ${i + 1}`
            }}</span
            ><button class="compare-identity" @click="inspect(item)">
              <ItemArtwork
                :src="item.imageUrl"
                :name="item.name"
                large
              /><strong>{{ item.name }}</strong></button
            ><FzButton
              size="sm"
              variant="ghost"
              :aria-label="`Remove ${item.name} from comparison`"
              @click="compare(item)"
              ><FzIcon name="close" :size="14" />Remove</FzButton
            >
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Total cost</th>
          <td v-for="item in comparison" :key="item.id">
            <strong class="gold">{{ number(item.cost) }} G</strong
            ><small v-if="item !== baseline && baseline"
              >{{ item.cost - baseline.cost >= 0 ? "+" : ""
              }}{{ number(item.cost - baseline.cost) }} G</small
            >
          </td>
        </tr>
        <tr>
          <th scope="row">Base-stat efficiency</th>
          <td v-for="item in comparison" :key="item.id">
            <strong class="mint">{{ number(item.efficiency) }}%</strong
            ><small v-if="item !== baseline && baseline"
              >{{ item.efficiency - baseline.efficiency >= 0 ? "+" : ""
              }}{{ number(item.efficiency - baseline.efficiency) }} pts</small
            >
            <div class="stat-bar">
              <span
                :style="{ width: `${Math.min(item.efficiency / 2, 100)}%` }"
              />
            </div>
          </td>
        </tr>
        <tr v-for="key in rows" :key="key">
          <th scope="row">{{ statDefinitions[key]?.label }}</th>
          <td v-for="item in comparison" :key="item.id">
            {{ item.stats[key] ? statAmount(key, item.stats[key]!) : "—" }}
          </td>
        </tr>
        <tr>
          <th scope="row">Effects & description</th>
          <td
            v-for="item in comparison"
            :key="item.id"
            class="compare-description"
          >
            {{ item.text }}
          </td>
        </tr>
        <tr>
          <th scope="row">Add to draft</th>
          <td v-for="item in comparison" :key="item.id">
            <FzButton
              size="sm"
              variant="secondary"
              :disabled="buildIds.includes(item.id) || buildIds.length >= 6"
              @click="add(item)"
              ><FzIcon name="plus" :size="14" />{{
                buildIds.includes(item.id) ? "In build" : "Add to build"
              }}</FzButton
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
