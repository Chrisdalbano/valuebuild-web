<script setup lang="ts">
import { useTft } from "../../state/tft";
/** Header label on TFT pages. Loaded only there, with the TFT data. */
const { data } = useTft();
</script>
<template>
  <RouterLink to="/about" class="patch-label"
    >Set {{ data.set.number }}<span class="status-dot"
  /></RouterLink>
</template>
