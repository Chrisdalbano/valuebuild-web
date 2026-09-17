<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { FzField, FzSelect, FzPagination } from "@chrisdalbano/forza-ui";
import { useRemote } from "../composables/useRemote";
import { type Champion } from "../domain/api";
import RemoteState from "../components/analysis/RemoteState.vue";
import ChampionDetail from "../components/analysis/ChampionDetail.vue";
const { data, loading, error, reload } = useRemote<{ champions: Champion[] }>(
  "/champions",
);
const search = shallowRef(""),
  role = shallowRef("all"),
  selected = shallowRef<Champion | null>(null),
  page = shallowRef(1);
const roles = [
  { value: "all", label: "All classes" },
  ...["Fighter", "Mage", "Assassin", "Marksman", "Tank", "Support"].map(
    (value) => ({ value, label: value }),
  ),
];
const roster = computed(() => {
  const byId = new Map<string, Champion>();
  for (const champion of data.value?.champions || []) {
    const previous = byId.get(champion.name);
    if (
      !previous ||
      champion.patch.localeCompare(previous.patch, undefined, {
        numeric: true,
      }) > 0
    )
      byId.set(champion.name, champion);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
});
const filtered = computed(() =>
  roster.value.filter(
    (c) =>
      c.name.toLowerCase().includes(search.value.toLowerCase()) &&
      (role.value === "all" || c.tags.includes(role.value)),
  ),
);
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * 18, page.value * 18),
);
</script>
<template>
  <div class="workspace-page">
    <div class="page-heading">
      <div>
        <h1>Build around a champion.</h1>
        <p>
          Explore cached itemization studies, purchase stages, and situational
          alternatives.
        </p>
      </div>
    </div>
    <div class="champions-layout">
      <section>
        <div class="champion-filters">
          <FzField
            v-model="search"
            label="Find a champion"
            type="search"
            placeholder="Champion name"
            @input="page = 1"
          /><FzSelect
            v-model="role"
            label="Class"
            :options="roles"
            @update:model-value="page = 1"
          />
        </div>
        <RemoteState :loading="loading" :error="error" @retry="reload"
          ><div class="champion-grid">
            <button
              v-for="champion in visible"
              :key="champion.id"
              :aria-pressed="selected?.id === champion.id"
              @click="selected = champion"
            >
              <img
                :src="`https://ddragon.leagueoflegends.com/cdn/${champion.patch}/img/champion/${champion.id}.png`"
                alt=""
                width="52"
                height="52"
                loading="lazy"
              /><strong>{{ champion.name }}</strong>
            </button>
          </div>
          <p v-if="!filtered.length" class="empty-hint">
            No champions match these filters.
          </p>
          <FzPagination v-model="page" :total="filtered.length" :page-size="18"
        /></RemoteState>
      </section>
      <ChampionDetail v-if="selected" :key="selected.id" :champion="selected" />
      <div v-else class="empty-state">
        <h2>Who are you building for?</h2>
        <p>
          Choose a champion to inspect the study. Suggestions are AI-generated
          and should be tested against your matchup.
        </p>
      </div>
    </div>
  </div>
</template>
