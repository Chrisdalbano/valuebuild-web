<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useWorkspace } from "../../state/workspace";
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
} from "reka-ui";
import { number, statAmount, type Item } from "../../domain/items";
import ItemArtwork from "./ItemArtwork.vue";
import EfficiencyMark from "../shared/EfficiencyMark.vue";
import { itemTier } from "../../domain/verdict";
defineProps<{ item: Item }>();
const { detailOpen } = useWorkspace();
const wanted = ref(false);
// A quick click starts the hover timer and opens the drawer in the same
// gesture; the preview must not then appear on top of the drawer it led to.
const open = computed({
  get: () => wanted.value && !detailOpen.value,
  set: (value) => (wanted.value = value && !detailOpen.value),
});
const id = useId();
</script>
<template>
  <HoverCardRoot v-model:open="open" :open-delay="180" :close-delay="160">
    <HoverCardTrigger
      as-child
      @click.capture="open = false"
      @focusin="open = true"
      @focusout="open = false"
      :aria-describedby="open ? id : undefined"
    >
      <slot />
    </HoverCardTrigger>
    <HoverCardPortal to=".bv-app">
      <HoverCardContent
        :id="id"
        role="tooltip"
        class="item-preview"
        side="right"
        :side-offset="12"
        :collision-padding="16"
        :avoid-collisions="true"
        @escape-key-down.prevent.stop="open = false"
      >
        <header class="preview-heading">
          <ItemArtwork :name="item.name" :src="item.imageUrl" />
          <div>
            <strong>{{ item.name }}</strong
            ><span class="preview-tier">{{ itemTier(item).label }}</span>
          </div>
          <span class="preview-efficiency"
            ><EfficiencyMark :value="item.efficiency" verdict /><small
              >base-stat efficiency</small
            ></span
          >
        </header>
        <dl class="preview-values">
          <div>
            <dt>Cost</dt>
            <dd>{{ number(item.cost) }} G</dd>
          </div>
          <div>
            <dt>Stat value</dt>
            <dd>{{ number(item.value) }} G</dd>
          </div>
        </dl>
        <h4 v-if="item.breakdown.length" class="preview-section">Stats</h4>
        <dl class="preview-stats">
          <div v-for="stat in item.breakdown" :key="stat.key">
            <dt>{{ stat.label }}</dt>
            <dd>{{ statAmount(stat.key, stat.amount) }}</dd>
          </div>
        </dl>
        <h4 v-if="item.text" class="preview-section">Effects</h4>
        <p v-if="item.text" class="preview-effects">{{ item.text }}</p>
        <p class="fineprint">
          Open the item for recipes, AI effect estimates, and champion
          synergies.
        </p>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>
<style>
.item-preview {
  z-index: 110;
  width: min(350px, calc(100vw - 32px));
  max-height: min(560px, var(--reka-hover-card-content-available-height));
  overflow: auto;
  overscroll-behavior: contain;
  padding: 20px;
  color: var(--fz-text);
  background: var(--fz-surface);
  border: 1px solid var(--fz-border);
  box-shadow: 0 20px 60px #0008;
  font-size: 13px;
  line-height: 1.6;
  animation: preview-in 160ms ease-out;
}
.item-preview[data-state="closed"] {
  animation: preview-out 120ms ease-in;
}
.preview-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.preview-heading strong {
  display: block;
  font-size: 16px;
}
.preview-heading > div {
  flex: 1;
  min-width: 0;
}
.preview-tier {
  font: 11px var(--fz-font-mono);
  color: var(--fz-warning);
}
.preview-efficiency {
  display: grid;
  justify-items: end;
  text-align: right;
}
.preview-efficiency small {
  color: var(--fz-muted);
  font-size: 11px;
}
.preview-section {
  margin: 14px 0 6px;
  font: 600 12px var(--fz-font-body);
  color: var(--fz-muted);
}
.preview-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-block: 14px;
  border-block: 1px solid var(--fz-border);
}
.preview-values dt {
  color: var(--fz-muted);
}
.preview-values dd {
  margin: 0;
  font: 20px var(--fz-font-display);
}
.preview-stats div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.preview-stats dd {
  margin: 0;
  font-family: var(--fz-font-mono);
}
.preview-effects {
  white-space: pre-line;
  margin: 0 0 16px;
  max-height: 132px;
  overflow: auto;
}
.item-preview .fineprint {
  margin-bottom: 0;
}
@keyframes preview-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes preview-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .item-preview {
    animation: none !important;
  }
}
</style>
