<script setup lang="ts">
import { FzButton, FzIcon } from '@chrisdalbano/forza-ui';
import { useWorkspace } from '../state/workspace';
import ComparisonBoard from '../components/workspace/ComparisonBoard.vue';
const { comparison, compareIds } = useWorkspace();
</script>
<template><div class="workspace-page"><div class="page-heading"><div><h1>Every item is a tradeoff.</h1><p>Compare up to six items. The first selection becomes your baseline.</p></div><div class="inline-actions"><FzButton v-if="comparison.length" size="sm" variant="ghost" @click="compareIds = []">Clear comparison</FzButton><RouterLink to="/items" class="button-link">Add items <FzIcon name="plus" :size="16" /></RouterLink></div></div><ComparisonBoard v-if="comparison.length" /><div v-else class="empty-state large-empty"><FzIcon name="sort" :size="40" /><h2>Put two possibilities side by side.</h2><p>Choose Compare on any item in the explorer. Your selections stay here.</p><RouterLink to="/items" class="button-link">Explore items <FzIcon name="arrowRight" /></RouterLink></div><p class="method-note">A higher percentage is not a recommendation. Consider the item's effects and your champion. <RouterLink to="/about">Read the method ↗</RouterLink></p></div></template>
