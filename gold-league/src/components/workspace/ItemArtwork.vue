<script setup lang="ts">
import { shallowRef, watch } from "vue";
defineProps<{ name: string; src: string; large?: boolean }>();
const failed = shallowRef(false);
</script>
<template>
  <span class="item-art" :class="{ large }"
    ><img
      v-if="!failed"
      :src="src"
      :alt="name"
      width="48"
      height="48"
      loading="lazy"
      @error="failed = true"
    /><span v-else aria-hidden="true">{{ name.slice(0, 2) }}</span></span
  >
</template>
