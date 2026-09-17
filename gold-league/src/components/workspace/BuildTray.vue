<script setup lang="ts">
import { FzButton, FzIcon, FzList } from '@chrisdalbano/forza-ui';
import { useWorkspace } from '../../state/workspace';
import ItemArtwork from './ItemArtwork.vue';
import StatSummary from './StatSummary.vue';
import { number } from '../../domain/items';
const { build, remove, inspect, clear } = useWorkspace();
</script>
<template><aside class="build-tray"><div class="panel-heading"><h2>Your build</h2><span class="mono">{{ build.length }} / 6</span></div><FzList :items="build" label="Current build"><template #default="{ item }"><div class="build-row"><button class="item-identity" @click="inspect(item)"><ItemArtwork :src="item.imageUrl" :name="item.name" /><span>{{ item.name }}<small>{{ number(item.cost) }} G</small></span></button><FzButton size="sm" variant="ghost" :aria-label="`Remove ${item.name}`" @click="remove(item.id)"><FzIcon name="minus" :size="16" /></FzButton></div></template><template #empty><p class="empty-hint">Start with an item. Your totals follow every change.</p></template></FzList><div class="empty-slots" aria-hidden="true"><span v-for="n in 6 - build.length" :key="n"><FzIcon name="plus" :size="14" /></span></div><StatSummary :items="build" /><div class="tray-actions"><RouterLink to="/builds" class="text-link">Open build lab <FzIcon name="arrowRight" :size="16" /></RouterLink><FzButton v-if="build.length" variant="ghost" size="sm" @click="clear">Clear</FzButton></div></aside></template>
