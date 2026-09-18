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
import CatalogTable from "./CatalogTable.vue";
import { matchesQuery, matchesTier } from "../../domain/discovery";
import CatalogItem from "./CatalogItem.vue";
const props = withDefaults(defineProps<{ compact?: boolean }>(), {
  compact: false,
});
const { items, buildIds, compareIds, add, compare, inspect } = useWorkspace();
const search = shallowRef(""),
  category = shallowRef("all"),
  sort = shallowRef("cost-desc"),
  maxCost = shallowRef("all");
const view = shallowRef("grid"), tier = shallowRef("all"), hideSupport = shallowRef(false);
const tiers = [{value:"all",label:"All tiers"},{value:"legendary",label:"Legendary"},{value:"epic",label:"Epic"},{value:"component",label:"Components"},{value:"basic",label:"Basic"}];
const completed = shallowRef(false),
  page = shallowRef(1);
const categories = [
  { value: "all", label: "All items" },
  { value: "Damage", label: "Attack" },
  { value: "SpellDamage", label: "Magic" },
  { value: "Armor", label: "Defense" },
  { value: "Health", label: "Health" },
  { value: "Boots", label: "Boots" },
  { value: "GoldPer", label: "Support" },
  { value: "SpellBlock", label: "Magic resist" },
  { value: "AttackSpeed", label: "Attack speed" },
  { value: "CriticalStrike", label: "Critical strike" },
  { value: "ArmorPenetration", label: "Lethality" },
  { value: "MagicPenetration", label: "Magic penetration" },
  { value: "OnHit", label: "On-hit" },
  { value: "CooldownReduction", label: "Ability haste" },
  { value: "Consumable", label: "Consumables" },
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
        matchesQuery(item, query) && matchesTier(item, tier.value) &&
        (!hideSupport.value || !item.tags.includes("GoldPer") || category.value === "GoldPer") &&
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
watch([search, category, sort, maxCost, completed, tier, hideSupport], () => (page.value = 1));
function reset() {
  search.value = "";
  category.value = "all";
  maxCost.value = "all";
  completed.value = false;
  tier.value = "all"; hideSupport.value = false;
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
    <div class="catalog-options"><FzSelect v-model="tier" label="Item tier" :options="tiers" /><FzCheckbox v-model="hideSupport" label="Hide gold-income items" /><FzSegmented v-model="view" label="Catalog view" :options="[{value:'grid',label:'Cards'},{value:'table',label:'Table'}]" /></div>
    <div class="result-heading">
      <span
        >{{ filtered.length }} items
        <span class="muted">/ Summoner's Rift</span></span
      ><span class="muted">Efficiency = priced stats / cost</span>
    </div>
    <CatalogTable v-if="view === 'table'" :items="visible" :build-ids="buildIds" :compare-ids="compareIds" @inspect="inspect" @compare="compare" @add="add" />
    <div v-else class="item-grid">
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
