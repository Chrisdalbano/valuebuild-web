<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { FzField, FzSelect } from "@chrisdalbano/forza-ui";
import { useTft } from "../../state/tft";
import { priceTraits } from "../../domain/tft/traits";
import TftShell from "../../components/tft/TftShell.vue";
import TftIcon from "../../components/tft/TftIcon.vue";
const { data } = useTft();
const search = shallowRef(""),
  sort = shallowRef("entry"),
  open = shallowRef("");
const prices = computed(() => priceTraits(data.value));
const sorts = [
  { value: "entry", label: "Cheapest to switch on" },
  { value: "top", label: "Most expensive to finish" },
  { value: "steps", label: "Most breakpoints" },
  { value: "name", label: "Name: A to Z" },
];
const top = (price: (typeof prices.value)[number]) =>
  [...price.steps].reverse().find((step) => step.gold !== null)?.gold ?? 0;
const shown = computed(() =>
  prices.value
    .filter((price) =>
      `${price.trait.name} ${price.members.map((unit) => unit.name).join(" ")}`
        .toLowerCase()
        .includes(search.value.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort.value === "name"
        ? a.trait.name.localeCompare(b.trait.name)
        : sort.value === "steps"
          ? b.steps.length - a.steps.length || a.trait.name.localeCompare(b.trait.name)
          : sort.value === "top"
            ? top(b) - top(a)
            : (a.entry ?? 99) - (b.entry ?? 99) ||
              a.trait.name.localeCompare(b.trait.name),
    ),
);
const peak = computed(() => Math.max(1, ...prices.value.map(top)));
</script>
<template>
  <TftShell
    title="What does a trait cost to switch on?"
    lead="The cheapest gold that reaches each breakpoint, and what the next step adds. A price list, not a tier list."
  >
    <div class="trait-controls">
      <FzField
        v-model="search"
        label="Find a trait or unit"
        type="search"
        placeholder="Trait or unit name"
      /><FzSelect v-model="sort" label="Sort traits by" :options="sorts" />
    </div>
    <p class="fineprint">
      Gold is the one-star price of the cheapest units that carry the trait.
      Emblems, augments and units that count twice can lower it. Reaching a
      breakpoint cheaply says nothing about whether that board wins.
    </p>
    <ol class="trait-list">
      <li
        v-for="(price, index) in shown"
        :key="price.trait.id"
        class="trait-card"
        :style="{ '--i': Math.min(index, 14) }"
      >
        <button
          type="button"
          class="trait-head"
          :aria-expanded="open === price.trait.id"
          @click="open = open === price.trait.id ? '' : price.trait.id"
        >
          <TftIcon :src="price.trait.icon" :name="price.trait.name" :size="28" />
          <strong>{{ price.trait.name }}</strong>
          <small
            >{{ price.members.length }}
            {{ price.members.length === 1 ? "unit" : "units" }}</small
          >
        </button>
        <ol class="trait-steps" :aria-label="`${price.trait.name} breakpoints`">
          <li
            v-for="step in price.steps"
            :key="step.units"
            :data-style="step.style"
            :data-short="step.gold === null"
          >
            <span class="step-units">{{ step.units }}</span>
            <span class="step-gold" v-if="step.gold !== null"
              ><strong>{{ step.gold }} gold</strong
              ><small v-if="step.added !== step.gold"
                >+{{ step.added }} on the last step</small
              ><small v-else>first breakpoint</small></span
            >
            <span class="step-gold" v-else
              ><strong>Needs {{ step.short }} more</strong
              ><small>than the set's units provide</small></span
            >
            <span class="bar-track"
              ><span
                class="bar-fill"
                :style="{ width: `${((step.gold ?? 0) / peak) * 100}%` }"
            /></span>
          </li>
        </ol>
        <div v-if="open === price.trait.id" class="trait-members">
          <p class="fineprint">
            Units with {{ price.trait.name }}, cheapest first. The price above
            takes them from the left.
          </p>
          <ul>
            <li v-for="unit in price.members" :key="unit.id" :data-cost="unit.cost">
              <TftIcon :src="unit.icon" :name="unit.name" :cost="unit.cost" :size="36" />
              <span>{{ unit.name }}</span
              ><small>{{ unit.cost }} gold</small>
            </li>
          </ul>
        </div>
      </li>
    </ol>
    <p v-if="!shown.length" class="empty-hint">No trait or unit matches.</p>
  </TftShell>
</template>
