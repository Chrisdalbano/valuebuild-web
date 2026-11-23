<script setup lang="ts">
import ItemSwap from "./ItemSwap.vue";
import ItemPreview from "./ItemPreview.vue";
import { computed } from "vue";
import { FzButton, FzIcon } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number, statDefinitions, statAmount } from "../../domain/items";
import ItemArtwork from "./ItemArtwork.vue";
import EfficiencyMark from "../shared/EfficiencyMark.vue";
import StatValueBars from "../shared/StatValueBars.vue";
import ItemAnalysis from "../analysis/ItemAnalysis.vue";
import { combineCost, componentsOf } from "../../domain/verdict";
import { ref } from "vue";
const { comparison, compare, add, inspect, buildIds, items } = useWorkspace();
// AI studies are requested per item, and only when asked for.
const analysed = ref<string[]>([]);
const scale = computed(() =>
  Math.max(1, ...comparison.value.flatMap((item) => item.breakdown.map((s) => s.value))),
);
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
            ><ItemPreview :item="item"><button class="compare-identity" @click="inspect(item)">
              <ItemArtwork
                :src="item.imageUrl"
                :name="item.name"
                large
              /><strong>{{ item.name }}</strong></button
            ></ItemPreview><ItemSwap :item="item" target="comparison" /><FzButton
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
            <EfficiencyMark :value="item.efficiency" verdict /><small
              v-if="item !== baseline && baseline"
              >{{ item.efficiency - baseline.efficiency >= 0 ? "+" : ""
              }}{{ number(item.efficiency - baseline.efficiency) }} pts</small
            >
            <div class="stat-bar" :data-band="item.efficiency >= 120 ? 'excellent' : item.efficiency >= 100 ? 'good' : item.efficiency >= 80 ? 'fair' : 'low'">
              <span
                :style="{ width: `${Math.min(item.efficiency / 2, 100)}%` }"
              />
            </div>
          </td>
        </tr>
        <tr>
          <th scope="row">Stat value</th>
          <td v-for="item in comparison" :key="item.id">
            <strong>{{ number(item.value) }} G</strong
            ><small
              >{{ item.value - item.cost >= 0 ? "+" : ""
              }}{{ number(item.value - item.cost) }} G against cost</small
            >
          </td>
        </tr>
        <tr>
          <th scope="row">Where the value comes from</th>
          <td v-for="item in comparison" :key="item.id">
            <StatValueBars
              v-if="item.breakdown.length"
              :item="item"
              :scale="scale"
            /><span v-else class="muted">No priced stats</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Recipe</th>
          <td v-for="item in comparison" :key="item.id">
            <template v-if="componentsOf(item, items).length">
              <div class="compare-recipe">
                <ItemPreview
                  v-for="part in componentsOf(item, items)"
                  :key="part.id"
                  :item="part"
                  ><button
                    :aria-label="`Inspect ${part.name}, component of ${item.name}`"
                    @click="inspect(part)"
                  >
                    <ItemArtwork :name="part.name" :src="part.imageUrl" />
                  </button></ItemPreview
                >
              </div>
              <small
                >{{
                  number(
                    componentsOf(item, items).reduce((s, part) => s + part.cost, 0),
                  )
                }}
                G in components + {{ number(combineCost(item)) }} G to
                combine</small
              >
            </template>
            <span v-else class="muted">Bought whole</span>
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
          <th scope="row">AI effect analysis</th>
          <td v-for="item in comparison" :key="item.id" class="compare-analysis">
            <ItemAnalysis v-if="analysed.includes(item.id)" :id="item.id" />
            <FzButton
              v-else
              size="sm"
              variant="ghost"
              :aria-label="`Show AI analysis for ${item.name}`"
              @click="analysed.push(item.id)"
              >Show cached analysis</FzButton
            >
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
