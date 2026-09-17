<script setup lang="ts">
import { computed, shallowRef } from "vue";
import {
  FzField,
  FzBadge,
  FzButton,
  FzStat,
  FzDialog,
  FzIcon,
  FzList,
  FzSegmented,
} from "../../forza";
import ForzaMark from "../ForzaMark.vue";
import ItemCard from "../ItemCard.vue";
import { demoItems } from "../data/items";
const query = shallowRef("");
const category = shallowRef("All");
const selected = shallowRef<string[]>(["01"]);
const compare = shallowRef(false);
const visible = computed(() =>
  demoItems.filter(
    (item) =>
      (category.value === "All" || item.category === category.value) &&
      item.name.toLowerCase().includes(query.value.toLowerCase()),
  ),
);
const chosen = computed(() =>
  demoItems.filter((item) => selected.value.includes(item.id)),
);
const cost = computed(() =>
  chosen.value.reduce((sum, item) => sum + item.cost, 0),
);
const efficiency = computed(() =>
  cost.value
    ? chosen.value.reduce((sum, item) => sum + item.efficiency * item.cost, 0) /
      cost.value
    : 0,
);
function toggle(id: string) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : selected.value.length < 3
      ? [...selected.value, id]
      : selected.value;
}
</script>
<template>
  <section id="build-lab" class="section lab-section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">BuildValue</span>
        <h2>The item workbench.</h2>
      </div>
      <FzBadge tone="warning">BuildValue concept / fictional data</FzBadge>
    </div>
    <div class="lab-shell">
      <div class="lab-header">
        <div class="lab-title">
          <span class="brandmark small"><ForzaMark /></span>
          <div><strong>BUILDVALUE</strong><span>THE ITEM WORKBENCH</span></div>
        </div>
        <span class="mono">SANDBOX / 04 ITEMS</span>
      </div>
      <div class="lab-tools">
        <FzField
          v-model="query"
          label="Search sample items"
          placeholder="Find your next advantage..."
          type="search"
        />
        <FzSegmented
          v-model="category"
          label="Item category"
          :options="
            ['All', 'Offense', 'Defense', 'Utility'].map((value) => ({
              value,
              label: value,
            }))
          "
        />
      </div>
      <FzList class="item-grid" :items="visible" label="Sample items"
        ><template #default="{ item }">
          <ItemCard
            :item="item"
            :selected="selected.includes(item.id)"
            :disabled="selected.length >= 3"
            @toggle="toggle"
          /> </template
        ><template #empty
          ><div class="empty-state">
            <h3>No items match.</h3>
            <p>Try a different name or clear your filters.</p>
            <FzButton
              variant="secondary"
              @click="
                query = '';
                category = 'All';
              "
              >Clear filters</FzButton
            >
          </div>
        </template></FzList
      >
      <div class="comparison-bar">
        <div role="status">
          <span class="selection-count"
            >{{ selected.length }}<small>/3</small></span
          ><span
            >Items in comparison<br /><small>{{
              selected.length === 3
                ? "Comparison full. Remove an item to swap."
                : "Pick up to three to find your advantage."
            }}</small></span
          >
        </div>
        <div class="comparison-actions">
          <FzButton
            variant="ghost"
            size="sm"
            :disabled="!selected.length"
            @click="selected = []"
            >Clear</FzButton
          ><FzButton :disabled="selected.length < 2" @click="compare = true"
            >Compare items <FzIcon name="arrowRight" :size="17"
          /></FzButton>
        </div>
      </div>
    </div>
    <p class="lab-footnote">
      Fictional names and sample values demonstrate the system. This preview
      does not use or change BuildValue’s live item data.
    </p>
    <FzDialog
      v-model="compare"
      title="Side by side"
      description="Compare the raw stat value of your selected sample items."
      ><p class="muted">
        Raw stat value is one input. Passives, timing, and matchups need their
        own judgment.
      </p>
      <div class="comparison-stats">
        <FzStat
          label="Total cost"
          :value="cost.toLocaleString()"
          detail="Sample gold"
        /><FzStat
          label="Weighted efficiency"
          :value="efficiency.toFixed(1) + '%'"
          detail="Cost-weighted sample value"
        />
      </div>
      <table class="compare-table">
        <caption class="sr-only">
          Selected sample item statistics
        </caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Gold</th>
            <th scope="col">Efficiency</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in chosen" :key="item.id">
            <th scope="row">{{ item.name }}</th>
            <td>{{ item.cost }}</td>
            <td>{{ item.efficiency }}%</td>
          </tr>
        </tbody>
      </table>
      <template #footer
        ><FzButton variant="secondary" @click="compare = false"
          >Back to the lab</FzButton
        ></template
      ></FzDialog
    >
  </section>
</template>
