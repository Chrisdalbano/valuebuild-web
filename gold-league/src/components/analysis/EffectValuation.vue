<script setup lang="ts">
import { FzBadge } from "@chrisdalbano/forza-ui";
import type { Analysis } from "../../domain/api";
import { number } from "../../domain/items";
defineProps<{ effect: NonNullable<Analysis["effects"]>[number] }>();
</script>
<template>
  <article class="effect-valuation">
    <div class="panel-heading">
      <h4>{{ effect.name }}</h4>
      <FzBadge>{{ effect.confidence || "Unspecified" }} confidence</FzBadge>
    </div>
    <p v-if="typeof effect.estimatedGoldValue === 'number'" class="effect-gold">
      Estimated effect value:
      <strong>{{ number(effect.estimatedGoldValue) }} G</strong>
    </p>
    <p v-if="effect.baseStatEquivalence">{{ effect.baseStatEquivalence }}</p>
    <div
      v-if="effect.comparisons?.length"
      class="equivalence-grid"
      aria-label="Alternative stat equivalents"
    >
      <div v-for="entry in effect.comparisons" :key="entry.stat">
        <strong>{{ number(entry.amount) }} {{ entry.stat }}</strong
        ><small>{{ number(entry.gold) }} G equivalent</small>
      </div>
    </div>
    <p v-if="effect.comparisons?.length" class="fineprint">
      Alternative ways to express the same estimate; these values are not added
      together.
    </p>
    <ul v-if="effect.reasoning?.length" class="effect-reasoning">
      <li v-for="step in effect.reasoning" :key="step">{{ step }}</li>
    </ul>
    <p v-else-if="effect.description || effect.explanation">
      {{ effect.description || effect.explanation }}
    </p>
  </article>
</template>
