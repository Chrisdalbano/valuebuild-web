<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import { FzSegmented, FzSelect } from "@chrisdalbano/forza-ui";
import { useTft } from "../../state/tft";
import type { TftItem, TftStatLine } from "../../domain/tft/types";
import {
  componentStats,
  itemStats,
  poolUnits,
  profile,
  emptyLoadout,
  worthOn,
} from "../../domain/tft/units";
import TftShell from "../../components/tft/TftShell.vue";
import UnitPicker from "../../components/tft/UnitPicker.vue";
import TftIcon from "../../components/tft/TftIcon.vue";
import BarChart, { type BarRow } from "../../components/charts/BarChart.vue";
const { data } = useTft();
const units = computed(() => poolUnits(data.value));
const cost = shallowRef("4"),
  unitId = shallowRef(""),
  star = shallowRef("2"),
  sort = shallowRef("efficiency"),
  selectedId = shallowRef("");
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
const base = computed(() =>
  profile(unit.value, Number(star.value), emptyLoadout(), data.value.economy),
);
const amount = (line: Pick<TftStatLine, "unit" | "amount">) =>
  line.unit === "percent_fraction"
    ? `${Math.round(line.amount * 100)}%`
    : line.unit === "percent"
      ? `${Math.round(line.amount)}%`
      : String(Math.round(line.amount * 100) / 100);
const rates = computed(() =>
  Object.entries(data.value.statRates).map(([key, rate]) => ({
    key,
    ...rate,
    text: amount({ unit: rate.unit, amount: rate.perComponent }),
    icon:
      data.value.components.find((entry) => entry.id === rate.component)?.icon ||
      null,
  })),
);
const rows = computed(() =>
  data.value.items.map((item) => ({
    item,
    worth: worthOn(unit.value, Number(star.value), itemStats(item), data.value.economy),
    parts: item.composition.map(
      (id) => data.value.components.find((entry) => entry.id === id) || null,
    ),
  })),
);
const sorts = [
  { value: "efficiency", label: "Stat efficiency" },
  { value: "attack", label: "Attack output on this unit" },
  { value: "physical", label: "Health against physical on this unit" },
  { value: "magic", label: "Health against magic on this unit" },
  { value: "name", label: "Name: A to Z" },
];
const sorted = computed(() =>
  [...rows.value].sort((a, b) =>
    sort.value === "name"
      ? a.item.name.localeCompare(b.item.name)
      : sort.value === "attack"
        ? b.worth.attackOutput - a.worth.attackOutput
        : sort.value === "physical"
          ? b.worth.physicalHealth - a.worth.physicalHealth
          : sort.value === "magic"
            ? b.worth.magicHealth - a.worth.magicHealth
            : (b.item.statEfficiency || 0) - (a.item.statEfficiency || 0),
  ),
);
const selected = computed<TftItem | null>(
  () => data.value.items.find((item) => item.id === selectedId.value) || null,
);
const selectedRow = computed(
  () => rows.value.find((row) => row.item.id === selectedId.value) || null,
);
const peak = computed(() =>
  Math.max(2, ...data.value.items.map((item) => item.statComponents)),
);
const signed = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(value >= 10 || value === 0 ? 0 : 1)}%`;
const componentRows = (field: "attackOutput" | "physicalHealth" | "magicHealth") =>
  data.value.components
    .filter((component) => component.stat)
    .map((component) => ({
      component,
      worth: worthOn(
        unit.value,
        Number(star.value),
        componentStats(data.value, component.id),
        data.value.economy,
      ),
    }))
    .filter((row) => row.worth[field] > 0)
    .sort((a, b) => b.worth[field] - a.worth[field])
    .map<BarRow>((row) => ({
      key: row.component.id,
      label: `${row.component.name} (${row.component.text})`,
      parts: [
        {
          value: row.worth[field],
          color: field === "attackOutput" ? "var(--fz-accent)" : "var(--fz-info)",
        },
      ],
      display: signed(row.worth[field]),
    }));
const attackRows = computed(() => componentRows("attackOutput"));
const physicalRows = computed(() => componentRows("physicalHealth"));
const magicRows = computed(() => componentRows("magicHealth"));
</script>
<template>
  <TftShell
    title="What is an item's stat line worth?"
    lead="Every completed item costs two components. Price its listed stats in components, then see what they do on a unit you pick."
  >
    <section class="rate-strip" aria-label="What one component buys">
      <h2>One component buys</h2>
      <ul>
        <li v-for="rate in rates" :key="rate.key">
          <TftIcon :src="rate.icon" :name="rate.componentName" :size="32" />
          <span
            ><strong>{{ rate.text }} {{ rate.label.toLowerCase() }}</strong
            ><small>{{ rate.componentName }}</small></span
          >
        </li>
      </ul>
      <p class="fineprint">
        Rates are read from the components in the set data, not typed in. A
        completed item is two components, so 200% means its listed stats equal
        four components' worth. The effect is never priced: a low number means
        an effect-heavy item, not a weak one.
      </p>
    </section>
    <div class="ledger-layout">
      <section aria-label="Unit to value items on" class="ledger-unit">
        <h2>On which unit?</h2>
        <UnitPicker
          v-model="unitId"
          v-model:cost="cost"
          :units="units"
          label="Unit to value items on"
        />
        <FzSegmented
          v-model="star"
          label="Star level"
          :options="[
            { value: '1', label: 'One-star' },
            { value: '2', label: 'Two-star' },
            { value: '3', label: 'Three-star' },
          ]"
        />
        <dl class="unit-base">
          <div>
            <dt>Health</dt>
            <dd>{{ Math.round(base.health) }}</dd>
          </div>
          <div>
            <dt>Attack damage</dt>
            <dd>{{ Math.round(base.attackDamage) }}</dd>
          </div>
          <div>
            <dt>Attacks per second</dt>
            <dd>{{ base.attackSpeed.toFixed(2) }}</dd>
          </div>
          <div>
            <dt>Armor / magic resist</dt>
            <dd>{{ base.armor }} / {{ base.magicResist }}</dd>
          </div>
        </dl>
        <h3>One component on {{ unit.name }}</h3>
        <h4>Attack output</h4>
        <BarChart
          :label="`Attack output gained on ${unit.name} from each component`"
          :rows="attackRows"
        />
        <h4>Effective health against physical damage</h4>
        <BarChart
          :label="`Effective health against physical damage gained on ${unit.name} from each component`"
          :rows="physicalRows"
        />
        <h4>Effective health against magic damage</h4>
        <BarChart
          :label="`Effective health against magic damage gained on ${unit.name} from each component`"
          :rows="magicRows"
        />
        <p class="fineprint">
          Attack output is attack damage × attacks per second × average crit.
          Effective health is health × (1 + resistance ÷ 100). Abilities,
          ability power, mana and item effects are not modelled, so a caster's
          best item will not show up here.
        </p>
      </section>
      <section aria-label="Completed items" class="ledger-items">
        <div class="panel-heading">
          <h2>{{ data.items.length }} completed items</h2>
          <FzSelect v-model="sort" label="Sort items by" :options="sorts" />
        </div>
        <ol class="ledger-list">
          <li v-for="(row, index) in sorted" :key="row.item.id" :style="{ '--i': Math.min(index, 12) }">
            <button
              type="button"
              class="ledger-row"
              :aria-pressed="selectedId === row.item.id"
              :aria-label="`${row.item.name}: ${row.item.statEfficiency ?? 0}% stat efficiency`"
              @click="selectedId = selectedId === row.item.id ? '' : row.item.id"
            >
              <TftIcon :src="row.item.icon" :name="row.item.name" :size="40" />
              <span class="ledger-name"
                ><strong>{{ row.item.name }}</strong
                ><span class="ledger-recipe"
                  ><template v-for="(part, at) in row.parts" :key="at"
                    ><TftIcon
                      v-if="part"
                      :src="part.icon"
                      :name="part.name"
                      :size="18" /></template
                ></span>
              </span>
              <span class="ledger-bar"
                ><span class="bar-track"
                  ><span
                    class="bar-fill"
                    :style="{ width: `${(row.item.statComponents / peak) * 100}%` }" /><span
                    class="bar-reference"
                    :style="{ left: `${(2 / peak) * 100}%` }"
                    aria-hidden="true" /></span
                ><small
                  >{{ row.item.statComponents.toFixed(2) }} components of
                  stats</small
                ></span
              >
              <span class="ledger-number"
                ><strong>{{ Math.round(row.item.statEfficiency || 0) }}%</strong></span
              >
              <span class="ledger-worth"
                ><span v-if="row.worth.attackOutput > 0"
                  >{{ signed(row.worth.attackOutput) }} attack</span
                ><span v-if="row.worth.physicalHealth > 0"
                  >{{ signed(row.worth.physicalHealth) }} vs physical</span
                ><span v-if="row.worth.magicHealth > 0"
                  >{{ signed(row.worth.magicHealth) }} vs magic</span
                ><span
                  v-if="
                    !row.worth.attackOutput &&
                    !row.worth.physicalHealth &&
                    !row.worth.magicHealth
                  "
                  >not modelled here</span
                ></span
              >
            </button>
            <div
              v-if="selected && selectedRow && selectedId === row.item.id"
              class="ledger-detail"
            >
              <p v-if="selected.text" class="ledger-text">{{ selected.text }}</p>
              <table>
                <caption>
                  {{
                    selected.name
                  }}'s listed stats, priced in components
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Stat</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Components</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in selected.statBreakdown" :key="line.key">
                    <th scope="row">{{ line.label }}</th>
                    <td>{{ amount(line) }}</td>
                    <td>{{ line.components.toFixed(2) }}</td>
                  </tr>
                  <tr class="total">
                    <th scope="row">Total</th>
                    <td>for {{ selected.componentsSpent }} components</td>
                    <td>{{ selected.statComponents.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-if="!selected.statBreakdown.length" class="fineprint">
                No component stat is listed on this item. All of its worth is in
                its effect, which is not priced.
              </p>
              <p v-if="selected.unpricedEffects.length" class="fineprint">
                Not priced: {{ selected.unpricedEffects.length }} effect
                {{ selected.unpricedEffects.length === 1 ? "value" : "values" }}
                ({{ selected.unpricedEffects.slice(0, 6).join(", ")
                }}{{ selected.unpricedEffects.length > 6 ? ", …" : "" }}).
              </p>
              <p
                v-if="selectedRow.worth.unmodelled.length"
                class="fineprint"
              >
                Its ability power and mana are not turned into a number for
                {{ unit.name }}.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </TftShell>
</template>
