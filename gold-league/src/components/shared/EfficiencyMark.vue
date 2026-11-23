<script setup lang="ts">
import { computed } from "vue";
import { efficiencyVerdict } from "../../domain/verdict";
import { number } from "../../domain/items";
import { useCountUp } from "../../composables/useCountUp";
const props = withDefaults(
  defineProps<{ value: number; verdict?: boolean; suffix?: string }>(),
  { verdict: false, suffix: "%" },
);
const band = computed(() => efficiencyVerdict(props.value));
const shown = useCountUp(() => props.value);
</script>
<template>
  <span class="efficiency-mark" :data-band="band.key"
    ><strong>{{ number(shown) }}{{ suffix }}</strong
    ><span v-if="verdict" class="verdict-pill">{{ band.label }}</span></span
  >
</template>
