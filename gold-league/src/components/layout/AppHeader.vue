<script setup lang="ts">
import { useWorkspace } from "../../state/workspace";
import BuildValueMark from "./BuildValueMark.vue";
import { computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
// The TFT data stays out of the main bundle; this loads with the TFT pages.
const TftSetLabel = defineAsyncComponent(
  () => import("../tft/TftSetLabel.vue"),
);
const { build, comparison, dataset } = useWorkspace();
const route = useRoute();
const tft = computed(() => route.meta.game === "tft");

</script>
<template>
  <header class="site-header">
    <RouterLink to="/" class="brand" aria-label="BuildValue home"
      ><BuildValueMark /><span
        >BUILD<span class="accent">VALUE</span></span
      ></RouterLink
    >
    <div class="game-switch" role="group" aria-label="Game">
      <RouterLink to="/items" :class="{ current: !tft }" :aria-current="!tft ? 'true' : undefined"
        >League</RouterLink
      ><RouterLink to="/tft" :class="{ current: tft }" :aria-current="tft ? 'true' : undefined"
        >TFT</RouterLink
      >
    </div>
    <nav v-if="tft" aria-label="Main navigation">
      <RouterLink to="/tft" exact-active-class="router-link-active" active-class=""
        >Roll odds</RouterLink
      ><RouterLink to="/tft/items">Item ledger</RouterLink
      ><RouterLink to="/tft/traits">Trait prices</RouterLink
      ><RouterLink to="/tft/review">Game review</RouterLink>
    </nav>
    <nav v-else aria-label="Main navigation">
      <RouterLink to="/items">Explore</RouterLink
      ><RouterLink to="/compare"
        >Compare
        <span :key="comparison.length" class="nav-count">{{
          comparison.length
        }}</span></RouterLink
      ><RouterLink to="/builds"
        >Build lab
        <span :key="build.length" class="nav-count"
          >{{ build.length }}/6</span
        ></RouterLink
      ><RouterLink to="/champions">Champions</RouterLink
      ><RouterLink to="/research">Research</RouterLink>
    </nav>
    <TftSetLabel v-if="tft" />
    <RouterLink v-else to="/about" class="patch-label"
      >Patch {{ dataset.version }}<span class="status-dot"
    /></RouterLink>
  </header>
</template>
