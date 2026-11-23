<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { FzDrawer, FzButton } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number } from "../../domain/items";
import {
  combineCost,
  componentsOf,
  effectParts,
  itemTier,
  seriesColor,
  statShares,
} from "../../domain/verdict";
import ItemAnalysis from "../analysis/ItemAnalysis.vue";
import ItemArtwork from "./ItemArtwork.vue";
import EfficiencyMark from "../shared/EfficiencyMark.vue";
import StatValueBars from "../shared/StatValueBars.vue";
import DonutChart from "../charts/DonutChart.vue";
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
  selected.value ? componentsOf(selected.value, items.value) : [],
);
const upgrades = computed(() =>
  items.value.filter((item) => selected.value?.into?.includes(item.id)),
);
const componentsTotal = computed(() =>
  recipe.value.reduce((sum, item) => sum + item.cost, 0),
);
const effects = computed(() =>
  selected.value ? effectParts(selected.value.description) : [],
);
const segments = computed(() =>
  selected.value
    ? statShares(selected.value).map((stat, index) => ({
        key: stat.key,
        label: stat.label,
        value: stat.value,
        color: seriesColor(stat.key, index),
      }))
    : [],
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
          <p>
            {{ itemTier(selected).label }} item · Sell for
            {{ number(selected.gold.sell) }} G
          </p>
        </div>
        <EfficiencyMark :value="selected.efficiency" verdict />
      </div>
      <dl class="detail-overview">
        <div>
          <dt>Base-stat efficiency</dt>
          <dd><EfficiencyMark :value="selected.efficiency" /></dd>
        </div>
        <div>
          <dt>Total cost</dt>
          <dd>{{ number(selected.cost) }} G</dd>
        </div>
        <div>
          <dt>Stat value</dt>
          <dd>{{ number(selected.value) }} G</dd>
        </div>
        <div>
          <dt>Combine cost</dt>
          <dd>{{ number(combineCost(selected)) }} G</dd>
        </div>
      </dl>
      <FzButton size="sm" variant="secondary" @click="showAnalysis"
        >AI effect analysis &amp; champion synergies</FzButton
      >
      <h3>Effects</h3>
      <div v-if="effects.length" class="effect-parts">
        <p v-for="(part, index) in effects" :key="index" :data-kind="part.kind">
          <span v-if="part.kind !== 'text'" class="effect-kind">{{
            part.kind === "passive" ? "Passive" : "Active"
          }}</span
          ><strong v-if="part.name">{{ part.name }}</strong> {{ part.text }}
        </p>
      </div>
      <p v-else class="item-description">{{ selected.text }}</p>
      <h3>Priced base stats</h3>
      <StatValueBars v-if="selected.breakdown.length" :item="selected" />
      <DonutChart
        v-if="segments.length > 1"
        :label="`Share of ${selected.name}'s stat value by stat`"
        :segments="segments"
        center-label="stat value"
      />
      <p v-if="!selected.breakdown.length" class="fineprint">
        No supported base stats are priced for this item. Its effects can still
        be valuable.
      </p>
      <p class="fineprint">
        This estimate excludes passives and unsupported stats.
      </p>
      <div ref="analysisPanel">
        <ItemAnalysis :key="selected.id" :id="selected.id" />
      </div>
      <template v-if="recipe.length">
        <h3>Builds from</h3>
        <div class="recipe-list">
          <button
            v-for="item in recipe"
            :key="item.id"
            class="recipe-item"
            @click="inspect(item)"
          >
            <ItemArtwork :name="item.name" :src="item.imageUrl" /><span
              >{{ item.name
              }}<small
                >{{ number(item.cost) }} G ·
                {{ number(item.efficiency) }}% stats</small
              ></span
            >
          </button>
        </div>
        <dl class="cost-breakdown">
          <div>
            <dt>Components</dt>
            <dd>{{ number(componentsTotal) }} G</dd>
          </div>
          <div>
            <dt>Combine cost</dt>
            <dd>+ {{ number(combineCost(selected)) }} G</dd>
          </div>
          <div class="total">
            <dt>Final cost</dt>
            <dd>{{ number(selected.cost) }} G</dd>
          </div>
        </dl>
      </template>
      <template v-if="upgrades.length">
        <h3>Builds into</h3>
        <div class="recipe-list">
          <button
            v-for="item in upgrades"
            :key="item.id"
            class="recipe-item"
            @click="inspect(item)"
          >
            <ItemArtwork :name="item.name" :src="item.imageUrl" /><span
              >{{ item.name }}<small>{{ number(item.cost) }} G</small></span
            >
          </button>
        </div>
      </template></template
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
