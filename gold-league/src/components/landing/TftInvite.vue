<script setup lang="ts">
import { computed } from "vue";
import { FzIcon } from "@chrisdalbano/forza-ui";
import { useTft } from "../../state/tft";
import { poolUnits } from "../../domain/tft/units";
import { rollDown } from "../../domain/tft/odds";
/** Landing section for the TFT tools, with one figure the model calculates. */
const { data } = useTft();
const sample = computed(() => {
  const economy = data.value.economy;
  const unit = poolUnits(data.value).find((entry) => entry.cost === 4);
  if (!unit) return null;
  const pool = economy.poolSize[3] || 0;
  const tier = poolUnits(data.value).filter((entry) => entry.cost === 4).length;
  const at = (level: number) =>
    rollDown(
      {
        tierOdds: (economy.shopOdds[String(level)]?.[3] || 0) / 100,
        unitCost: 4,
        copiesLeft: pool,
        tierLeft: pool * tier,
        need: 3,
        rerollCost: economy.rerollCost,
        slots: economy.slotPattern,
      },
      50,
    ).hitByGold[50]! * 100;
  return { name: unit.name, seven: at(7), eight: at(8) };
});
</script>
<template>
  <section class="tft-invite">
    <div>
      <h2>The same question,<br /><span class="accent">on a different board.</span></h2>
      <p>
        Teamfight Tactics spends gold too. See what a reroll buys, what an
        item's stat line is worth in components, and what a trait costs to
        switch on.
      </p>
      <p v-if="sample" class="invite-figure">
        50 gold for a two-star {{ sample.name }}:
        <strong>{{ sample.seven.toFixed(0) }}%</strong> at level 7,
        <strong>{{ sample.eight.toFixed(0) }}%</strong> at level 8.
        <span class="fineprint"
          >Calculated for set {{ data.set.number }}, uncontested.</span
        >
      </p>
    </div>
    <div class="credit-links">
      <RouterLink to="/tft">Roll odds <FzIcon name="arrowRight" /></RouterLink
      ><RouterLink to="/tft/items"
        >Item ledger <FzIcon name="arrowRight" /></RouterLink
      ><RouterLink to="/tft/traits"
        >Trait prices <FzIcon name="arrowRight"
      /></RouterLink>
    </div>
  </section>
</template>
