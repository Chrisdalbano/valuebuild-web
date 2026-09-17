<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { VgField, VgBadge, VgButton, VgStat, VgDialog } from "../../vantage";
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
        <span class="eyebrow">03 / IN CONTEXT</span>
        <h2>Your next move, made clearer.</h2>
      </div>
      <VgBadge tone="warning">BuildValue concept / fictional data</VgBadge>
    </div>
    <div class="lab-shell">
      <div class="lab-header">
        <div class="lab-title">
          <span class="brandmark small">V/</span>
          <div><strong>BUILDVALUE</strong><span>THE ITEM WORKBENCH</span></div>
        </div>
        <span class="mono">SANDBOX / 04 ITEMS</span>
      </div>
      <div class="lab-tools">
        <VgField
          v-model="query"
          label="Search sample items"
          placeholder="Find your next advantage..."
          type="search"
        />
        <div class="filters" role="group" aria-label="Item category">
          <button
            v-for="c in ['All', 'Offense', 'Defense', 'Utility']"
            :key="c"
            :aria-pressed="category === c"
            @click="category = c"
          >
            {{ c }}
          </button>
        </div>
      </div>
      <div class="item-grid">
        <ItemCard
          v-for="item in visible"
          :key="item.id"
          :item="item"
          :selected="selected.includes(item.id)"
          :disabled="selected.length >= 3"
          @toggle="toggle"
        />
        <div v-if="!visible.length" class="empty-state">
          <h3>No items match.</h3>
          <p>Try a different name or clear your filters.</p>
          <VgButton
            variant="secondary"
            @click="
              query = '';
              category = 'All';
            "
            >Clear filters</VgButton
          >
        </div>
      </div>
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
          <VgButton
            variant="ghost"
            size="sm"
            :disabled="!selected.length"
            @click="selected = []"
            >Clear</VgButton
          ><VgButton :disabled="selected.length < 2" @click="compare = true"
            >Compare items &#8599;</VgButton
          >
        </div>
      </div>
    </div>
    <p class="lab-footnote">
      Fictional names and sample values demonstrate the system. This preview
      does not use or change BuildValue’s live item data.
    </p>
    <VgDialog v-model="compare" title="Side by side"
      ><p class="muted">
        Raw stat value is one input. Passives, timing, and matchups need their
        own judgment.
      </p>
      <div class="comparison-stats">
        <VgStat
          label="Total cost"
          :value="cost.toLocaleString()"
          detail="Sample gold"
        /><VgStat
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
        ><VgButton variant="secondary" @click="compare = false"
          >Back to the lab</VgButton
        ></template
      ></VgDialog
    >
  </section>
</template>
