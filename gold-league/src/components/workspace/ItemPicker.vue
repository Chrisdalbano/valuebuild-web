<script setup lang="ts">
import { computed, ref } from "vue";
import { FzButton, FzDialog, FzField, FzIcon } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number, type Item } from "../../domain/items";
import { matchesQuery } from "../../domain/discovery";
import ItemPreview from "./ItemPreview.vue";
import ItemArtwork from "./ItemArtwork.vue";
/** Add an item to the comparison without leaving the page. */
const { items, compareIds, compare } = useWorkspace();
const open = ref(false),
  query = ref("");
const full = computed(() => compareIds.value.length >= 6);
const matches = computed(() =>
  items.value
    .filter(
      (item) =>
        !compareIds.value.includes(item.id) && matchesQuery(item, query.value),
    )
    .slice(0, 40),
);
function pick(item: Item) {
  compare(item);
  if (compareIds.value.length >= 6) open.value = false;
}
</script>
<template>
  <FzButton
    size="sm"
    variant="secondary"
    :disabled="full"
    @click="
      query = '';
      open = true;
    "
    ><FzIcon name="search" :size="14" />Find an item to add</FzButton
  >
  <FzDialog
    v-model="open"
    title="Add to comparison"
    description="Pick up to six items. The dialog stays open so you can add several."
  >
    <FzField
      v-model="query"
      label="Find an item to compare"
      type="search"
      placeholder="Name or stat, such as armor"
    />
    <div class="swap-results">
      <ItemPreview v-for="candidate in matches" :key="candidate.id" :item="candidate"
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
    <p v-if="!matches.length">No available items match.</p>
    <template #footer
      ><FzButton variant="secondary" @click="open = false"
        >Done ({{ compareIds.length }}/6)</FzButton
      ></template
    >
  </FzDialog>
</template>
