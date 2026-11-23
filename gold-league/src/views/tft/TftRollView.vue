<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import { FzCheckbox, FzSegmented, FzSlider } from "@chrisdalbano/forza-ui";
import { useTft } from "../../state/tft";
import { poolUnits } from "../../domain/tft/units";
import {
  copiesFor,
  goldFor,
  levelCost,
  rollDown,
  type RollInput,
} from "../../domain/tft/odds";
import { useCountUp } from "../../composables/useCountUp";
import TftShell from "../../components/tft/TftShell.vue";
import UnitPicker from "../../components/tft/UnitPicker.vue";
import TftIcon from "../../components/tft/TftIcon.vue";
import LineChart, { type LineSeries } from "../../components/charts/LineChart.vue";
import BarChart, { type BarRow } from "../../components/charts/BarChart.vue";
const { data } = useTft();
const economy = computed(() => data.value.economy);
const units = computed(() =>
  poolUnits(data.value).filter(
    (unit) => !economy.value.unmodelled.includes(unit.name),
  ),
);
const levels = computed(() =>
  Object.keys(economy.value.shopOdds)
    .map(Number)
    .sort((a, b) => a - b),
);
const cost = shallowRef("4"),
  unitId = shallowRef(""),
  level = shallowRef(8),
  gold = shallowRef(50),
  star = shallowRef("2"),
  held = shallowRef(0),
  contested = shallowRef(0),
  tierTaken = shallowRef(0),
  xpInto = shallowRef(0),
  wisps = shallowRef(true);
// Keep the selection valid when the cost switch or the data changes.
watch(
  [cost, units],
  () => {
    const inCost = units.value.filter((unit) => String(unit.cost) === cost.value);
    if (!inCost.some((unit) => unit.id === unitId.value))
      unitId.value = inCost[0]?.id || units.value[0]?.id || "";
  },
  { immediate: true },
);
const unit = computed(
  () => units.value.find((entry) => entry.id === unitId.value) || units.value[0]!,
);
const pool = computed(() => economy.value.poolSize[unit.value.cost - 1] || 0);
// Every unit of the tier shares the bag, including ones this tool leaves out.
const tierUnits = computed(
  () =>
    poolUnits(data.value).filter((entry) => entry.cost === unit.value.cost)
      .length,
);
const wanted = computed(() =>
  copiesFor(Number(star.value), economy.value.copiesPerStar),
);
const need = computed(() => Math.max(0, wanted.value - held.value));
const copiesLeft = computed(() =>
  Math.max(0, pool.value - held.value - contested.value),
);
const tierLeft = computed(() =>
  Math.max(
    copiesLeft.value,
    pool.value * tierUnits.value - held.value - contested.value - tierTaken.value,
  ),
);
// Clamp dependent inputs when the unit or star target changes.
watch([pool, wanted], () => {
  held.value = Math.min(held.value, wanted.value - 1);
  contested.value = Math.min(contested.value, pool.value - held.value);
});
const maxOtherTaken = computed(() =>
  Math.max(0, pool.value * (tierUnits.value - 1)),
);
function input(atLevel: number): RollInput {
  return {
    tierOdds: (economy.value.shopOdds[String(atLevel)]?.[unit.value.cost - 1] || 0) / 100,
    unitCost: unit.value.cost,
    copiesLeft: copiesLeft.value,
    tierLeft: tierLeft.value,
    need: need.value,
    rerollCost: economy.value.rerollCost,
    slots: wisps.value ? economy.value.slotPattern : economy.value.shopSlots,
  };
}
const CURVE_GOLD = 160;
const curveLevels = computed(() =>
  [level.value - 1, level.value, level.value + 1].filter((value) =>
    levels.value.includes(value),
  ),
);
const curves = computed(() =>
  curveLevels.value.map((value) => ({
    level: value,
    result: rollDown(input(value), CURVE_GOLD),
  })),
);
const now = computed(() => rollDown(input(level.value), gold.value));
const chance = computed(() => now.value.hitByGold[gold.value] ?? 0);
const shownChance = useCountUp(() => chance.value * 100, 320);
const impossible = computed(() => need.value > copiesLeft.value);
const series = computed<LineSeries[]>(() =>
  curves.value.map((curve) => ({
    key: `level-${curve.level}`,
    label: `Level ${curve.level}${curve.level === level.value ? " (you)" : ""}`,
    color:
      curve.level === level.value
        ? "var(--fz-accent)"
        : curve.level < level.value
          ? "var(--fz-info)"
          : "var(--fz-positive)",
    dashed: curve.level !== level.value,
    points: curve.result.hitByGold.map((y, x) => ({ x, y: y * 100 })),
  })),
);
const milestones = computed(() => {
  const curve = curves.value.find((entry) => entry.level === level.value)!.result
    .hitByGold;
  return [0.5, 0.75, 0.9].map((target) => ({
    target,
    gold: goldFor(curve, target),
  }));
});
// Roll now, or buy a level first and roll with what is left?
const levelUp = computed(() => {
  const next = level.value + 1;
  if (!levels.value.includes(next)) return null;
  const price = levelCost(
    level.value,
    xpInto.value,
    1,
    economy.value.xpToNext,
    economy.value.xpPurchase,
  );
  if (price === null) return null;
  const left = gold.value - price;
  return {
    level: next,
    price,
    left,
    chance: left >= 0 ? (rollDown(input(next), left).hitByGold[left] ?? 0) : 0,
  };
});
const xpNeeded = computed(() => economy.value.xpToNext[String(level.value)] || 0);
watch(xpNeeded, (value) => (xpInto.value = Math.min(xpInto.value, Math.max(0, value - 1))));
const plans = computed<BarRow[]>(() => {
  const rows: BarRow[] = [
    {
      key: "roll",
      label: `Roll all ${gold.value} gold at level ${level.value}`,
      parts: [{ value: chance.value * 100, color: "var(--fz-accent)" }],
      display: `${(chance.value * 100).toFixed(1)}%`,
    },
  ];
  if (levelUp.value)
    rows.push({
      key: "level",
      label: `Buy level ${levelUp.value.level} for ${levelUp.value.price} gold, roll the other ${Math.max(0, levelUp.value.left)}`,
      parts: [{ value: levelUp.value.chance * 100, color: "var(--fz-positive)" }],
      display:
        levelUp.value.left < 0
          ? "not enough gold"
          : `${(levelUp.value.chance * 100).toFixed(1)}%`,
    });
  return rows;
});
const better = computed(() =>
  !levelUp.value || levelUp.value.left < 0 || Math.abs(levelUp.value.chance - chance.value) < 0.005
    ? null
    : levelUp.value.chance > chance.value
      ? "level"
      : "roll",
);
const copyRows = computed<BarRow[]>(() =>
  now.value.copies.map((value, copies) => ({
    key: String(copies),
    label:
      copies === need.value
        ? `${copies} new ${copies === 1 ? "copy" : "copies"} (target reached)`
        : `${copies} new ${copies === 1 ? "copy" : "copies"}`,
    parts: [
      {
        value: value * 100,
        color: copies >= need.value ? "var(--fz-positive)" : "var(--bv-series-8)",
      },
    ],
    display: `${(value * 100).toFixed(1)}%`,
  })),
);
const percent = (value: number) => `${value.toFixed(value < 10 ? 1 : 0)}%`;
</script>
<template>
  <TftShell
    title="What does a reroll buy?"
    lead="Pick a unit, your level and your gold. See the chance of hitting it, and whether a level is worth more than the rolls it costs."
  >
    <div class="roll-layout">
      <section class="roll-controls" aria-label="Roll settings">
        <h2>The unit</h2>
        <UnitPicker
          v-model="unitId"
          v-model:cost="cost"
          :units="units"
          label="Unit to roll for"
        />
        <h2>Your position</h2>
        <FzSlider
          v-model="level"
          label="Level"
          :min="levels[0]"
          :max="levels[levels.length - 1]"
        />
        <FzSlider v-model="gold" label="Gold to spend" :min="0" :max="100" :step="2" unit=" g" />
        <FzSegmented
          v-model="star"
          label="Target"
          :options="[
            { value: '2', label: 'Two-star' },
            { value: '3', label: 'Three-star' },
          ]"
        />
        <FzSlider
          v-model="held"
          label="Copies you already hold"
          :min="0"
          :max="wanted - 1"
        />
        <h2>The lobby</h2>
        <FzSlider
          v-model="contested"
          label="Copies other players hold"
          :min="0"
          :max="pool - held"
        />
        <FzSlider
          v-model="tierTaken"
          :label="`Other ${unit.cost}-cost copies out of the pool`"
          :min="0"
          :max="maxOtherTaken"
        />
        <FzSlider
          v-if="levelUp"
          v-model="xpInto"
          :label="`XP already toward level ${level + 1}`"
          :min="0"
          :max="Math.max(0, xpNeeded - 1)"
          :step="2"
        />
        <FzCheckbox
          v-if="economy.slotPattern.length > 1"
          v-model="wisps"
          label="Count the set mechanic"
          :description="economy.slotPatternNote"
        />
      </section>
      <section class="roll-results" aria-label="Roll results">
        <div class="roll-headline" :data-cost="unit.cost">
          <TftIcon :src="unit.icon" :name="unit.name" :cost="unit.cost" :size="72" />
          <div>
            <p class="roll-question">
              {{ star === "2" ? "Two-star" : "Three-star" }} {{ unit.name }} with
              {{ gold }} gold at level {{ level }}
            </p>
            <p v-if="impossible" class="roll-chance">
              <strong>0%</strong>
              <span
                >Only {{ copiesLeft }} of the {{ need }} copies you need are left
                in the pool.</span
              >
            </p>
            <p v-else class="roll-chance">
              <strong data-testid="hit-chance">{{ shownChance.toFixed(1) }}%</strong>
              <span
                >chance to find the {{ need }}
                {{ need === 1 ? "copy" : "copies" }} you still need</span
              >
            </p>
          </div>
        </div>
        <dl class="roll-facts">
          <div>
            <dt>One reroll ({{ economy.rerollCost }} gold) shows</dt>
            <dd>{{ now.perShop.toFixed(2) }} copies on average</dd>
          </div>
          <div>
            <dt>A shop shows at least one</dt>
            <dd>{{ percent(now.seenPerShop * 100) }} of the time</dd>
          </div>
          <div>
            <dt>Rerolls per copy seen</dt>
            <dd>
              {{ now.perShop > 0 ? (1 / now.perShop).toFixed(1) : "never" }}
              <small v-if="now.perShop > 0"
                >≈ {{ (economy.rerollCost / now.perShop).toFixed(1) }} gold
                before its {{ unit.cost }} gold price</small
              >
            </dd>
          </div>
          <div>
            <dt>Left in the pool</dt>
            <dd>{{ copiesLeft }} of {{ pool }} · {{ tierLeft }} in the tier</dd>
          </div>
        </dl>
        <h2>Chance against gold spent</h2>
        <LineChart
          :label="`Chance to hit ${unit.name} against gold spent, at the levels around yours`"
          :series="series"
          x-label="Gold"
          y-label="Chance to hit"
          :x-max="CURVE_GOLD"
          :y-max="100"
          :cursor="gold"
          :format-x="(v: number) => `${Math.round(v)}`"
          :format-y="(v: number) => `${v.toFixed(0)}%`"
          @update:cursor="(v: number) => (gold = Math.min(100, Math.round(v / 2) * 2))"
        >
          <ul class="milestones">
            <li v-for="mark in milestones" :key="mark.target">
              <strong>{{ mark.target * 100 }}%</strong>
              {{
                mark.gold === null
                  ? `needs more than ${CURVE_GOLD} gold`
                  : `at ${mark.gold} gold`
              }}
            </li>
          </ul>
        </LineChart>
        <h2>Roll now, or level first?</h2>
        <BarChart
          label="Chance to hit under each plan"
          :rows="plans"
          :max="100"
        />
        <p v-if="!levelUp" class="fineprint">
          Level {{ level }} is the highest level in this table.
        </p>
        <p v-else-if="levelUp.left < 0" class="plan-note" data-testid="plan-note">
          Level {{ levelUp.level }} costs {{ levelUp.price }} gold from here,
          more than the {{ gold }} you set.
        </p>
        <p v-else-if="better" class="plan-note" data-testid="plan-note">
          {{
            better === "level"
              ? `In this model, buying level ${levelUp.level} first gives the higher chance.`
              : `In this model, rolling at level ${level} gives the higher chance.`
          }}
          This counts only the one unit you picked; a level also gives you a
          board slot, which is not priced here.
        </p>
        <p v-else class="plan-note" data-testid="plan-note">
          The two plans come out about the same for this unit.
        </p>
        <h2>How it ends</h2>
        <BarChart
          label="Chance of ending with each number of new copies"
          :rows="copyRows"
          :max="100"
        />
        <details class="method-details">
          <summary>How this is calculated, and where the numbers come from</summary>
          <p>
            Each shop slot first rolls a cost tier from your level's odds
            ({{ economy.shopOdds[String(level)]?.[unit.cost - 1] }}% for a
            {{ unit.cost }}-cost at level {{ level }}), then a unit of that tier
            in proportion to the copies left. The chance a slot shows
            {{ unit.name }} is that tier chance times {{ copiesLeft }} /
            {{ tierLeft }}. The result is exact for this model, not a random
            simulation.
          </p>
          <p>
            It assumes you buy every copy you can afford, that other players'
            boards do not change while you roll, and that the pool holds
            {{ pool }} copies of each of the {{ tierUnits }}
            {{ unit.cost }}-cost units. {{ economy.unmodelled.join(", ") }}
            {{ economy.unmodelled.length === 1 ? "is" : "are" }} left out because
            the standard pool rules do not describe
            {{ economy.unmodelled.length === 1 ? "it" : "them" }}.
          </p>
          <ul class="source-list">
            <li v-for="(entry, key) in economy.sources" :key="key">
              <a :href="entry.url" rel="noopener">{{ entry.label }}</a>
              <span class="muted">checked {{ entry.checked }}</span>
            </li>
          </ul>
        </details>
      </section>
    </div>
  </TftShell>
</template>
