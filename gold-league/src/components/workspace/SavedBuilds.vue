<script setup lang="ts">
import { shallowRef } from "vue";
import { FzButton, FzIcon, FzDialog, FzList } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
const { saved, load, discard } = useWorkspace();
const pending = shallowRef(""),
  confirm = shallowRef(false);
function requestDelete(id: string) {
  pending.value = id;
  confirm.value = true;
}
</script>
<template>
  <aside class="saved-builds">
    <div class="panel-heading">
      <h2>Saved builds</h2>
      <span class="mono">{{ saved.length }}/30</span>
    </div>
    <p class="fineprint">
      Stored in this browser. Share a link to take a build elsewhere.
    </p>
    <FzList :items="saved" label="Saved builds"
      ><template #default="{ item }"
        ><div class="saved-row">
          <button class="saved-load" @click="load(item)">
            <strong>{{ item.name }}</strong
            ><small
              >{{ item.items.length }} items · Patch {{ item.patch }}</small
            ></button
          ><FzButton
            variant="ghost"
            size="sm"
            :aria-label="`Delete ${item.name}`"
            @click="requestDelete(item.id)"
            ><FzIcon name="trash" :size="16"
          /></FzButton></div></template
      ><template #empty
        ><p class="empty-hint">
          Your experiments belong here. Name a draft and save it.
        </p></template
      ></FzList
    ><FzDialog
      v-model="confirm"
      title="Delete saved build?"
      description="This removes the saved copy from this browser. Your current draft stays intact."
      ><template #footer
        ><FzButton variant="secondary" @click="confirm = false">Cancel</FzButton
        ><FzButton
          @click="
            discard(pending);
            confirm = false;
          "
          >Delete build</FzButton
        ></template
      ></FzDialog
    >
  </aside>
</template>
