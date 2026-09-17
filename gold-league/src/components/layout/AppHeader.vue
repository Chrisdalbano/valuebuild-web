<script setup lang="ts">
import { useWorkspace } from '../../state/workspace';
import BuildValueMark from './BuildValueMark.vue';
const { build, comparison, dataset } = useWorkspace();
</script>
<template><header class="site-header"><RouterLink to="/" class="brand" aria-label="BuildValue home"><BuildValueMark /><span>BUILD<span class="accent">VALUE</span></span></RouterLink><nav aria-label="Main navigation"><RouterLink to="/items">Explore</RouterLink><RouterLink to="/compare">Compare <span class="nav-count">{{ comparison.length }}</span></RouterLink><RouterLink to="/builds">Build lab <span class="nav-count">{{ build.length }}/6</span></RouterLink></nav><RouterLink to="/about" class="patch-label">Patch {{ dataset.version }}<span class="status-dot" /></RouterLink></header></template>

