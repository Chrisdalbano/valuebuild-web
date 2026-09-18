<script setup lang="ts">
import { ref, useId } from "vue";
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
} from "reka-ui";
import { number, statAmount, type Item } from "../../domain/items";
import ItemArtwork from "./ItemArtwork.vue";
defineProps<{ item: Item }>();
const open = ref(false);
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
        @escape-key-down="open = false"
      >
        <header class="preview-heading">
          <ItemArtwork :name="item.name" :src="item.imageUrl" />
          <div>
            <strong>{{ item.name }}</strong
            ><span>{{ number(item.efficiency) }}% base-stat efficiency</span>
          </div>
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
        <dl class="preview-stats">
          <div v-for="stat in item.breakdown" :key="stat.key">
            <dt>{{ stat.label }}</dt>
            <dd>{{ statAmount(stat.key, stat.amount) }}</dd>
          </div>
        </dl>
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
  z-index: 70;
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
.preview-heading span {
  color: var(--fz-positive);
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
  margin: 16px 0;
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
