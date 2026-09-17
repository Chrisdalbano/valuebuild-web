<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import {
  FzField,
  FzSelect,
  FzButton,
  FzIcon,
  FzPagination,
  FzCheckbox,
  FzSegmented,
} from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import CatalogItem from "./CatalogItem.vue";
const props = withDefaults(defineProps<{ compact?: boolean }>(), {
  compact: false,
});
const { items, buildIds, compareIds, add, compare, inspect } = useWorkspace();
const search = shallowRef(""),
  category = shallowRef("all"),
  sort = shallowRef("cost-desc"),
  maxCost = shallowRef("all");
const completed = shallowRef(false),
  page = shallowRef(1);
const categories = [
  { value: "all", label: "All items" },
  { value: "Damage", label: "Attack" },
  { value: "SpellDamage", label: "Magic" },
  { value: "Armor", label: "Defense" },
  { value: "Health", label: "Health" },
  { value: "Boots", label: "Boots" },
];
const sorts = [
  { value: "cost-desc", label: "Cost: high to low" },
  { value: "cost-asc", label: "Cost: low to high" },
  { value: "efficiency", label: "Stat efficiency" },
  { value: "name", label: "Name: A to Z" },
];
const budgets = [
  { value: "all", label: "Any price" },
  { value: "500", label: "Up to 500 G" },
  { value: "1000", label: "Up to 1,000 G" },
  { value: "2000", label: "Up to 2,000 G" },
  { value: "3000", label: "Up to 3,000 G" },
];
const filtered = computed(() =>
  items.value
    .filter((item) => {
      const query = search.value.trim().toLowerCase();
      return (
        (!query ||
          `${item.name} ${item.plaintext} ${item.colloq}`
            .toLowerCase()
            .includes(query)) &&
        (category.value === "all" || item.tags.includes(category.value)) &&
        (maxCost.value === "all" || item.cost <= Number(maxCost.value)) &&
        (!completed.value ||
          !item.into?.some((id) =>
            items.value.some((other) => other.id === id),
          ))
      );
    })
    .sort((a, b) =>
      sort.value === "name"
        ? a.name.localeCompare(b.name)
        : sort.value === "efficiency"
          ? b.efficiency - a.efficiency
          : sort.value === "cost-asc"
            ? a.cost - b.cost
            : b.cost - a.cost,
    ),
);
const pageSize = computed(() => (props.compact ? 8 : 15));
const visible = computed(() =>
  filtered.value.slice(
    (page.value - 1) * pageSize.value,
    page.value * pageSize.value,
  ),
);
watch([search, category, sort, maxCost, completed], () => (page.value = 1));
function reset() {
  search.value = "";
  category.value = "all";
  maxCost.value = "all";
  completed.value = false;
}
</script>
<template>
  <section
    class="item-explorer"
    :class="{ compact }"
    aria-label="Item explorer"
  >
    <div class="explorer-controls">
      <FzField
        v-model="search"
        label="Find an item"
        type="search"
        placeholder="Name or keyword..."
      /><FzSelect v-model="sort" label="Sort by" :options="sorts" /><FzSelect
        v-model="maxCost"
        label="Gold budget"
        :options="budgets"
      />
    </div>
    <div class="filter-row">
      <div class="category-scroll">
        <FzSegmented
          v-model="category"
          label="Item category"
          :options="categories"
        />
      </div>
      <FzCheckbox v-model="completed" label="Final items only" />
    </div>
    <div class="result-heading">
      <span
        >{{ filtered.length }} items
        <span class="muted">/ Summoner's Rift</span></span
      ><span class="muted">Efficiency = priced stats / cost</span>
    </div>
    <div class="item-grid">
      <CatalogItem
        v-for="item in visible"
        :key="item.id"
        :item="item"
        :in-build="buildIds.includes(item.id)"
        :in-comparison="compareIds.includes(item.id)"
        :build-full="buildIds.length >= 6"
        @inspect="inspect"
        @compare="compare"
        @add="add"
      />
    </div>
    <div v-if="!filtered.length" class="empty-state">
      <FzIcon name="search" :size="28" />
      <h3>No items match.</h3>
      <p>Try another name, category, or budget.</p>
      <FzButton variant="secondary" @click="reset">Reset filters</FzButton>
    </div>
    <div class="pagination-row">
      <span class="fineprint"
        >{{ filtered.length ? (page - 1) * pageSize + 1 : 0 }}–{{
          Math.min(page * pageSize, filtered.length)
        }}
        of {{ filtered.length }}</span
      ><FzPagination
        v-model="page"
        :total="filtered.length"
        :page-size="pageSize"
      />
    </div>
  </section>
</template>
