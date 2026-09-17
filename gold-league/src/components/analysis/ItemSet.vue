<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { FzButton, FzIcon } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import ItemArtwork from "../workspace/ItemArtwork.vue";
const props = withDefaults(
  defineProps<{ ids: readonly string[]; name?: string; tryable?: boolean }>(),
  { name: "Research build", tryable: false },
);
const { items, inspect, replaceBuild } = useWorkspace();
const router = useRouter();
const resolved = computed(() =>
  props.ids.flatMap((id) => items.value.find((item) => item.id === id) || []),
);
function load() {
  replaceBuild(
    resolved.value.map((i) => i.id),
    props.name,
  );
  void router.push("/builds");
}
</script>
<template>
  <div class="analysis-item-set">
    <button
      v-for="item in resolved"
      :key="item.id"
      :aria-label="`Inspect ${item.name}`"
      @click="inspect(item)"
    >
      <ItemArtwork :name="item.name" :src="item.imageUrl" /><span>{{
        item.name
      }}</span></button
    ><FzButton
      v-if="tryable"
      variant="secondary"
      size="sm"
      :disabled="!resolved.length"
      @click="load"
      >Try build <FzIcon name="arrowRight" :size="14"
    /></FzButton>
  </div>
  <p v-if="resolved.length < ids.length" class="fineprint">
    Some items are unavailable in the displayed catalog.
  </p>
</template>
