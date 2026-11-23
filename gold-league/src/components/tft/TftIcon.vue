<script setup lang="ts">
import { shallowRef, watch } from "vue";
/** A unit, item or trait picture from Community Dragon, with a text fallback. */
const props = defineProps<{
  src: string | null;
  name: string;
  cost?: number;
  size?: number;
}>();
const failed = shallowRef(false);
watch(
  () => props.src,
  () => (failed.value = false),
);
</script>
<template>
  <span
    class="tft-icon"
    :data-cost="cost"
    :style="size ? { width: `${size}px`, height: `${size}px` } : undefined"
    ><img
      v-if="src && !failed"
      :src="src"
      alt=""
      :width="size || 44"
      :height="size || 44"
      loading="lazy"
      @error="failed = true" /><span v-else aria-hidden="true">{{
      name.slice(0, 2)
    }}</span></span
  >
</template>
