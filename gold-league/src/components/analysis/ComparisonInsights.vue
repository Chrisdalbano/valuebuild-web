<script setup lang="ts">
import { computed } from 'vue';
import { number, totals, type Item } from '../../domain/items';
const props = defineProps<{ items: readonly Item[] }>();
const sum = computed(() => totals(props.items));
const ranked = computed(() => [...props.items].sort((a,b) => b.efficiency-a.efficiency));
const peak = computed(() => Math.max(1,...props.items.flatMap(i=>[i.cost,i.value])));
</script>
<template>
  <section v-if="items.length" class="comparison-insights"><h2>Cost and stat value</h2>
    <p v-if="ranked[0]">{{ ranked[0].name }} has the highest base-stat efficiency in this selection at {{ number(ranked[0].efficiency) }}%. Effects and champion interactions can change which purchase is useful.</p>
    <dl class="insight-metrics"><div><dt>Combined cost</dt><dd>{{ number(sum.cost) }} G</dd></div><div><dt>Combined stat value</dt><dd>{{ number(sum.value) }} G</dd></div><div><dt>Stat value minus cost</dt><dd>{{ number(sum.value-sum.cost) }} G</dd></div><div><dt>Average purchase</dt><dd>{{ number(sum.cost/items.length) }} G</dd></div></dl>
    <div class="purchase-bars"><div v-for="item in items" :key="item.id"><strong>{{ item.name }}</strong><div class="purchase-bar-row"><span>Cost</span><i :style="{width:`${item.cost/peak*100}%`}" aria-hidden="true"/><small>{{ number(item.cost) }} G</small></div><div class="purchase-bar-row value"><span>Stat value</span><i :style="{width:`${item.value/peak*100}%`}" aria-hidden="true"/><small>{{ number(item.value) }} G</small></div><p class="fineprint">{{ item.from?.length || 0 }} direct recipe components</p></div></div>
  </section>
</template>
