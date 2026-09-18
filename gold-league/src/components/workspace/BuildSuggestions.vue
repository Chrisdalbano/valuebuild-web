<script setup lang="ts">
import { computed, ref } from "vue";
import { FzSelect } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { matchesRole, roles } from "../../domain/discovery";
import CatalogItem from "./CatalogItem.vue";
const { items, buildIds, compareIds, add, compare, inspect } = useWorkspace();
const role = ref("all");
const suggestions = computed(() =>
  items.value
    .filter(
      (item) =>
        item.cost >= 2000 &&
        item.efficiency >= 85 &&
        !buildIds.value.includes(item.id) &&
        matchesRole(item, role.value),
    )
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 6),
);
</script>
<template>
  <section class="build-suggestions">
    <div class="panel-heading">
      <h2>Find a useful next item.</h2>
      <FzSelect v-model="role" label="Suggested role" :options="roles" />
    </div>
    <p class="fineprint">
      Stat-based suggestions, ranked by base-stat efficiency. Role matching is a
      starting point; passives, team composition, and champion abilities still
      matter.
    </p>
    <div class="item-grid">
      <CatalogItem
        v-for="item in suggestions"
        :key="item.id"
        :item="item"
        :in-build="false"
        :in-comparison="compareIds.includes(item.id)"
        :build-full="buildIds.length >= 6"
        @inspect="inspect"
        @compare="compare"
        @add="add"
      />
    </div>
    <p v-if="!suggestions.length">
      No further items match this role and stat-value threshold.
    </p>
  </section>
</template>
