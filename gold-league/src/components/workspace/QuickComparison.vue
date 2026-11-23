<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { FzButton } from '@chrisdalbano/forza-ui';
import { useWorkspace } from '../../state/workspace';
import { type Item, number } from '../../domain/items';
import ItemPreview from './ItemPreview.vue';
import ItemArtwork from './ItemArtwork.vue';
const { items, compareIds, inspect } = useWorkspace();
const router = useRouter(), selection = ref<Item[]>([]);
function shuffle() {
 const pool=items.value.filter(i=>i.cost>=2000 && i.efficiency>=90 && !i.tags.includes('GoldPer'));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j]!,pool[i]!];}
 selection.value=pool.slice(0,3);
}
watch(items,shuffle,{immediate:true});
const ranked=computed(()=>[...selection.value].sort((a,b)=>b.efficiency-a.efficiency));
const lead=computed(()=>ranked.value[0]);
const gap=computed(()=>ranked.value.length>1?ranked.value[0]!.efficiency-ranked.value[1]!.efficiency:0);
function compare(){compareIds.value=selection.value.map(i=>i.id);void router.push('/compare');}
</script>
<template><section class="quick-comparison" aria-label="Quick comparison"><div class="panel-heading"><h2>A quick comparison</h2><FzButton size="sm" variant="ghost" @click="shuffle">Shuffle items</FzButton></div><p class="fineprint">Explore three purchases from the current catalog. These are examples, not a recommended build.</p><div class="quick-purchases"><ItemPreview v-for="item in selection" :key="item.id" :item="item"><button class="swap-result" @click="inspect(item)"><ItemArtwork :name="item.name" :src="item.imageUrl" /><span><strong>{{ item.name }}</strong><small>{{ number(item.cost) }} G · {{ number(item.efficiency) }}% stats<template v-if="item.id === lead?.id"> · highest of the three<template v-if="gap > 0">, by {{ number(gap) }} pts</template></template></small></span></button></ItemPreview></div><FzButton size="sm" variant="secondary" :disabled="selection.length<2" @click="compare">Compare these items</FzButton></section></template>
