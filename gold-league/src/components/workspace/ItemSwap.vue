<script setup lang="ts">
import { computed, ref } from "vue";
import { FzButton, FzDialog, FzField } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number, type Item } from "../../domain/items";
import { matchesQuery } from "../../domain/discovery";
import ItemPreview from "./ItemPreview.vue";
import ItemArtwork from "./ItemArtwork.vue";
const props = defineProps<{ item: Item; target: "build" | "comparison" }>();
const { items, buildIds, compareIds, swapItem } = useWorkspace();
const open = ref(false),
  query = ref("");
const selected = computed(() =>
  props.target === "build" ? buildIds.value : compareIds.value,
);
const matches = computed(() =>
  items.value
    .filter(
      (item) =>
        !selected.value.includes(item.id) && matchesQuery(item, query.value),
    )
    .slice(0, 40),
);
function pick(item: Item) {
  swapItem(props.target, props.item.id, item);
  open.value = false;
}
</script>
<template>
  <FzButton
    size="sm"
    variant="ghost"
    :aria-label="`Swap ${item.name}`"
    @click="
      query = '';
      open = true;
    "
    >Swap</FzButton
  >
  <FzDialog
    v-model="open"
    :title="`Replace ${item.name}`"
    description="Choose a replacement. Other items keep their place."
  >
    <FzField
      v-model="query"
      label="Find a replacement"
      type="search"
      placeholder="Name or stat, such as armor"
    />
    <div class="swap-results">
      <ItemPreview
        v-for="candidate in matches"
        :key="candidate.id"
        :item="candidate"
        ><button class="swap-result" @click="pick(candidate)">
          <ItemArtwork :name="candidate.name" :src="candidate.imageUrl" /><span
            ><strong>{{ candidate.name }}</strong
            ><small
              >{{ number(candidate.cost) }} G ·
              {{ number(candidate.efficiency) }}% stats</small
            ></span
          >
        </button></ItemPreview
      >
    </div>
    <p v-if="!matches.length">
      No available items match. Try another name or stat.
    </p>
  </FzDialog>
</template>
