<script setup lang="ts">
import { computed, ref } from "vue";
import { FzSelect } from "../../forza";
import { componentCatalog } from "../componentCatalog";
const selected = ref("FzStepper");
const options = componentCatalog.map((c) => ({ value: c.name, label: c.name }));
const component = computed(() =>
  componentCatalog.find((c) => c.name === selected.value)!,
);
</script>
<template>
  <section class="api-reference">
    <div>
      <h3 class="docs-title">The component contract.</h3>
      <p class="muted">25 exports. Explicit state. Predictable composition.</p>
      <FzSelect v-model="selected" label="Component API" :options="options" />
    </div>
    <div class="api-detail">
      <h3>{{ component.name }}</h3>
      <dl>
        <dt>Props</dt>
        <dd>{{ component.props }}</dd>
        <dt>State / events</dt>
        <dd>{{ component.state }}</dd>
        <dt>Slots</dt>
        <dd>{{ component.slots }}</dd>
      </dl>
      <pre
        v-if="component.example"
        tabindex="0"
        aria-label="Component usage example"
      ><code>{{component.example}}</code></pre>
    </div>
  </section>
</template>
<style scoped>
.api-reference {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 48px;
  margin: 60px 0;
  padding-top: 48px;
  border-top: 1px solid var(--fz-border);
}
.api-detail {
  min-width: 0;
  padding: 24px;
  background: var(--fz-surface);
  border: 1px solid var(--fz-border);
  border-radius: 6px;
}
.api-detail h3 {
  font: 500 34px var(--fz-font-display);
  margin: 0 0 16px;
}
.api-detail dl {
  font-size: 12px;
  line-height: 1.7;
}
.api-detail dt {
  color: var(--fz-muted);
  margin-top: 12px;
}
.api-detail dd {
  margin: 2px 0;
  overflow-wrap: anywhere;
}
.api-detail pre {
  font: 11px/1.8 var(--fz-font-mono);
  overflow: auto;
  padding-top: 20px;
  border-top: 1px solid var(--fz-border);
}
@media (max-width: 700px) {
  .api-reference {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
