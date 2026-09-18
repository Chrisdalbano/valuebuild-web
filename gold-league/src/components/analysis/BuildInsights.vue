<script setup lang="ts">
import { computed } from "vue";
import { totals, number, type Item } from "../../domain/items";
const props = defineProps<{ items: readonly Item[] }>();
const sum = computed(() => totals(props.items));
const interactions = computed(() => {
  const s = sum.value.stats,
    notes: string[] = [];
  if (
    s.FlatPhysicalDamageMod &&
    (s.FlatCritChanceMod || s.PercentCritChanceMod)
  )
    notes.push(
      "Attack damage + critical chance: consider attack frequency and critical-strike modifiers.",
    );
  if (s.FlatHPPoolMod && (s.FlatArmorMod || s.FlatSpellBlockMod))
    notes.push(
      "Health + resistances: these stats work together against the corresponding damage type.",
    );
  if (s.PercentLifeStealMod && s.FlatPhysicalDamageMod)
    notes.push(
      "Attack damage + lifesteal: healing depends on the damage your eligible attacks actually deal.",
    );
  if (s.FlatMagicDamageMod && s.AbilityHaste)
    notes.push(
      "Ability power + haste: consider each ability’s scaling and cooldown.",
    );
  return notes;
});
</script>
<template>
  <section v-if="items.length" class="build-insights">
    <h3>Build analysis</h3>
    <dl class="insight-metrics">
      <div>
        <dt>Stat value minus cost</dt>
        <dd>{{ number(sum.value - sum.cost) }} G</dd>
      </div>
      <div>
        <dt>Average purchase</dt>
        <dd>{{ number(sum.cost / items.length) }} G</dd>
      </div>
    </dl>
    <p class="fineprint">
      {{
        sum.efficiency >= 100
          ? "Priced stats cover this build’s cost."
          : "Priced stats alone do not cover this build’s cost."
      }}
      This does not measure its combat strength.
    </p>
    <ul v-if="interactions.length">
      <li v-for="note in interactions" :key="note">{{ note }}</li>
    </ul>
  </section>
</template>
