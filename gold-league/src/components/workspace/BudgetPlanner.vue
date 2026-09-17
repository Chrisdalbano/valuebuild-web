<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import { FzSlider, FzSelect, FzButton } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { optimizeBuild } from "../../domain/optimizer";
import { totals, number, type Item } from "../../domain/items";
import ItemSet from "../analysis/ItemSet.vue";
const { items } = useWorkspace();
const budget = shallowRef(12000),
  category = shallowRef("all"),
  suggestion = shallowRef<Item[]>([]),
  ran = shallowRef(false);
const options = [
  { value: "all", label: "All stat profiles" },
  { value: "Damage", label: "Attack damage" },
  { value: "SpellDamage", label: "Ability power" },
  { value: "Armor", label: "Armor" },
  { value: "Health", label: "Health" },
];
const sum = computed(() => totals(suggestion.value));
watch([budget, category, items], () => {
  ran.value = false;
  suggestion.value = [];
});
function run() {
  suggestion.value = optimizeBuild(items.value, budget.value, category.value);
  ran.value = true;
}
</script>
<template>
  <section class="budget-planner">
    <h2>Make the budget work.</h2>
    <p class="fineprint">
      Find up to six unique completed items that maximize priced base-stat
      value. This does not enforce unique passives or champion-specific build
      rules.
    </p>
    <div class="budget-controls">
      <FzSlider
        v-model="budget"
        label="Gold available"
        :min="500"
        :max="25000"
        :step="250"
      /><FzSelect
        v-model="category"
        label="Stat profile"
        :options="options"
      /><FzButton @click="run">Find a starting point</FzButton>
    </div>
    <template v-if="ran"
      ><div v-if="suggestion.length" class="budget-result">
        <p>
          {{ number(sum.cost) }} / {{ number(budget) }} G ·
          {{ number(sum.value) }} G in priced stats
        </p>
        <ItemSet
          :ids="suggestion.map((i) => i.id)"
          name="Budget study"
          tryable
        />
      </div>
      <p v-else class="empty-hint">
        No completed items fit this budget and profile. Try a higher budget.
      </p></template
    >
  </section>
</template>
