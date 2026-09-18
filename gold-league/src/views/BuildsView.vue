<script setup lang="ts">
import BuildSuggestions from "../components/workspace/BuildSuggestions.vue";
import BudgetPlanner from "../components/workspace/BudgetPlanner.vue";
import BuildEditor from "../components/workspace/BuildEditor.vue";
import SavedBuilds from "../components/workspace/SavedBuilds.vue";
import ItemExplorer from "../components/workspace/ItemExplorer.vue";
</script>
<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>Six slots. Make them count.</h1>
        <p>A place to try a build before committing your gold.</p>
      </div>
    </div>
    <div class="workspace-columns">
      <div>
        <BuildEditor /><BudgetPlanner /><BuildSuggestions />
        <section id="build-explorer" class="build-browser">
          <h2>Find the next piece.</h2>
          <ItemExplorer compact />
        </section>
      </div>
      <SavedBuilds />
    </div>
  </div>
</template>
