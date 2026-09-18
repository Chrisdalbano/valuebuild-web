<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { FzDrawer, FzButton, FzBadge } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number, statAmount } from "../../domain/items";
import ItemAnalysis from "../analysis/ItemAnalysis.vue";
import ItemArtwork from "./ItemArtwork.vue";
const {
  selected,
  detailOpen,
  items,
  add,
  compare,
  buildIds,
  compareIds,
  inspect,
} = useWorkspace();
const analysisPanel = useTemplateRef<HTMLElement>("analysisPanel");
function showAnalysis() {
  analysisPanel.value?.scrollIntoView({ block: "start" });
}
const recipe = computed(() =>
  items.value.filter((item) => selected.value?.from?.includes(item.id)),
);
const upgrades = computed(() =>
  items.value.filter((item) => selected.value?.into?.includes(item.id)),
);
</script>
<template>
  <FzDrawer
    v-model="detailOpen"
    :title="selected?.name || 'Item details'"
    description="Inspect stats, effects, and the purchase path."
    ><template v-if="selected"
      ><div class="detail-identity">
        <ItemArtwork :name="selected.name" :src="selected.imageUrl" large />
        <div>
          <strong>{{ number(selected.cost) }} G</strong>
          <p>Sell for {{ number(selected.gold.sell) }} G</p>
        </div>
        <FzBadge>{{ number(selected.efficiency) }}% stats</FzBadge>
      </div>
      <FzButton size="sm" variant="secondary" @click="showAnalysis">AI effect analysis &amp; champion synergies</FzButton>
      <p class="item-description">{{ selected.text }}</p>
      <h3>Priced base stats</h3>
      <dl class="stat-lines">
        <div v-for="stat in selected.breakdown" :key="stat.key">
          <dt>
            {{ stat.label }}
            <span class="muted">+{{ statAmount(stat.key, stat.amount) }}</span>
          </dt>
          <dd>{{ number(stat.value) }} G</dd>
        </div>
      </dl>
      <p v-if="!selected.breakdown.length" class="fineprint">
        No supported base stats are priced for this item. Its effects can still
        be valuable.
      </p>
      <p class="fineprint">
        This estimate excludes passives and unsupported stats.
      </p>
      <div ref="analysisPanel"><ItemAnalysis :key="selected.id" :id="selected.id" /></div>
      <template
        v-for="group in [
          { title: 'Builds from', entries: recipe },
          { title: 'Builds into', entries: upgrades },
        ]"
        :key="group.title"
        ><h3 v-if="group.entries.length">{{ group.title }}</h3>
        <div class="recipe-list">
          <button
            v-for="item in group.entries"
            :key="item.id"
            class="recipe-item"
            @click="inspect(item)"
          >
            <ItemArtwork :name="item.name" :src="item.imageUrl" /><span
              >{{ item.name }}<small>{{ number(item.cost) }} G</small></span
            >
          </button>
        </div></template
      ></template
    ><template #footer
      ><FzButton
        v-if="selected"
        :disabled="buildIds.includes(selected.id) || buildIds.length >= 6"
        @click="add(selected)"
        >Add to build</FzButton
      ><FzButton
        v-if="selected"
        variant="secondary"
        @click="compare(selected)"
        >{{
          compareIds.includes(selected.id)
            ? "Remove comparison"
            : "Compare item"
        }}</FzButton
      ></template
    ></FzDrawer
  >
</template>
