<script setup lang="ts">
import { computed } from "vue";
import {
  totals,
  number,
  statDefinitions,
  statAmount,
  type Item,
} from "../../domain/items";
const props = defineProps<{ items: readonly Item[] }>();
const summary = computed(() => totals(props.items));
</script>
<template>
  <div class="stat-summary">
    <div class="summary-numbers">
      <div>
        <span>Total cost</span
        ><strong>{{ number(summary.cost) }}<small> G</small></strong>
      </div>
      <div>
        <span>Base-stat value</span
        ><strong>{{ number(summary.value) }}<small> G</small></strong>
      </div>
      <div>
        <span>Stat efficiency</span
        ><strong class="mint"
          >{{ number(summary.efficiency) }}<small>%</small></strong
        >
      </div>
    </div>
    <dl class="stat-lines">
      <div v-for="(amount, key) in summary.stats" :key="key">
        <dt>{{ statDefinitions[key]?.label }}</dt>
        <dd>+{{ statAmount(String(key), amount) }}</dd>
      </div>
    </dl>
    <p class="fineprint">
      Base stats only. Passives, actives, and champion interactions are not
      priced.
    </p>
  </div>
</template>
