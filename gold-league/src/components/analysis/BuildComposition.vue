<script setup lang="ts">
import { computed } from "vue";
import { number, totals, type Item } from "../../domain/items";
const props = defineProps<{ items: readonly Item[] }>();
const sum = computed(() => totals(props.items));
</script>
<template>
  <div class="composition-chart">
    <h3>Where the gold goes</h3>
    <div class="composition-bars">
      <div v-for="item in items" :key="item.id">
        <span>{{ item.name }}</span
        ><span class="composition-track"
          ><i
            :style="{
              width: `${sum.cost ? (item.cost / sum.cost) * 100 : 0}%`,
            }" /></span
        ><span>{{ number(item.cost) }} G</span>
      </div>
    </div>
    <div class="composition-total">
      <span>{{ number(sum.cost) }} G spent</span
      ><span>{{ number(sum.value) }} G in priced stats</span
      ><strong class="mint">{{ number(sum.efficiency) }}%</strong>
    </div>
  </div>
</template>
