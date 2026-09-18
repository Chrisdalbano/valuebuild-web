<script setup lang="ts">
import { FzButton, FzIcon } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../state/workspace";
import QuickComparison from "../components/workspace/QuickComparison.vue";
import ItemExplorer from "../components/workspace/ItemExplorer.vue";
import BuildTray from "../components/workspace/BuildTray.vue";
const { dataset, source, refresh, loading } = useWorkspace();
</script>
<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>Find your next purchase.</h1>
        <p>
          Inspect the stats. Compare the tradeoffs. Keep your build in view.
        </p>
      </div>
      <FzButton
        variant="secondary"
        size="sm"
        :loading="loading"
        @click="refresh"
        ><FzIcon name="undo" :size="14" />Refresh data</FzButton
      >
    </div>
    <div class="data-status">
      <span class="status-dot" />Patch {{ dataset.version
      }}<span>{{ source }}</span>
    </div>
    <div class="workspace-columns"><div><ItemExplorer /><QuickComparison /></div><BuildTray /></div>
  </div>
</template>
