<script setup lang="ts">
import ItemSwap from "./ItemSwap.vue";
import ItemPreview from "./ItemPreview.vue";
import { shallowRef } from "vue";
import {
  FzField,
  FzButton,
  FzIcon,
  FzDialog,
  FzList,
} from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number } from "../../domain/items";
import ItemArtwork from "./ItemArtwork.vue";
import BuildInsights from "../analysis/BuildInsights.vue";
import BuildComposition from "../analysis/BuildComposition.vue";
import StatSummary from "./StatSummary.vue";
const {
  build,
  compareIds,
  addCompared,
  name,
  add,
  remove,
  clear,
  undo,
  undoIds,
  save,
  shareUrl,
  inspect,
  announce,
} = useWorkspace();
const shareOpen = shallowRef(false),
  link = shallowRef("");
function openShare() {
  link.value = shareUrl();
  shareOpen.value = true;
}
async function copy() {
  try {
    await navigator.clipboard.writeText(link.value);
    announce("Build link copied.");
  } catch {
    announce("Copy the link from the field below.");
  }
}
</script>
<template>
  <section class="build-editor">
    <div class="build-editor-heading">
      <FzField
        v-model="name"
        label="Build name"
        placeholder="Give this build a name"
        :maxlength="80"
      />
      <div class="inline-actions">
        <FzButton
          variant="secondary"
          :disabled="!build.length"
          @click="openShare"
          >Share <FzIcon name="arrowUpRight" :size="16" /></FzButton
        ><FzButton :disabled="!build.length" @click="save">Save build</FzButton>
      </div>
    </div>
    <FzList :items="build" label="Build items" class="build-slot-list"
      ><template #default="{ item, index }"
        ><div class="build-slot">
          <span class="slot-number">0{{ index + 1 }}</span
          ><ItemPreview :item="item"><button class="slot-inspect" @click="inspect(item)">
            <ItemArtwork
              :name="item.name"
              :src="item.imageUrl"
              large
            /><strong>{{ item.name }}</strong
            ><span class="gold">{{ number(item.cost) }} G</span></button
          ></ItemPreview><ItemSwap :item="item" target="build" /><FzButton
            size="sm"
            variant="ghost"
            :aria-label="`Remove ${item.name}`"
            @click="remove(item.id)"
            ><FzIcon name="minus" :size="16" />Remove</FzButton
          >
        </div></template
      ><template #empty
        ><p class="empty-hint">
          Pick your first item from the explorer below.
        </p></template
      ></FzList
    >
    <div
      v-if="build.length < 6"
      class="available-slots"
      aria-label="Available slots"
    >
      <a
        v-for="n in 6 - build.length"
        :key="n"
        href="#build-explorer"
        class="available-slot"
        ><span class="slot-number">0{{ build.length + n }}</span
        ><FzIcon name="plus" /><span>Add an item</span></a
      >
    </div>
    <BuildInsights :items="build" /><StatSummary :items="build" /><BuildComposition
      v-if="build.length"
      :items="build"
    />
    <FzButton variant="secondary" size="sm" :disabled="!compareIds.length || build.length >= 6" @click="addCompared">Add compared items</FzButton>
    <div class="editor-footer">
      <span class="fineprint"
        >Draft autosaves on this device. Six unique items maximum.</span
      >
      <div class="inline-actions">
        <FzButton v-if="undoIds" variant="ghost" size="sm" @click="undo"
          ><FzIcon name="undo" :size="14" />Undo</FzButton
        ><FzButton
          :disabled="!build.length"
          variant="ghost"
          size="sm"
          @click="clear"
          >Clear draft</FzButton
        >
      </div>
    </div>
    <FzDialog
      v-model="shareOpen"
      title="Share this build"
      description="The link contains item IDs. Names and private notes stay on your device. Values use the patch available when opened."
      ><FzField
        v-model="link"
        label="Build link"
        readonly
        @focus="($event.target as HTMLInputElement).select()"
      /><template #footer
        ><FzButton @click="copy">Copy link</FzButton></template
      ></FzDialog
    >
  </section>
</template>
