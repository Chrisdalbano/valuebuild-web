<script setup lang="ts">
import LandingHero from "../components/landing/LandingHero.vue";
import ProductStory from "../components/landing/ProductStory.vue";
import { defineAsyncComponent } from "vue";
const TftInvite = defineAsyncComponent(
  () => import("../components/landing/TftInvite.vue"),
);
</script>
<template>
  <div><LandingHero /><ProductStory /><TftInvite /></div>
</template>
