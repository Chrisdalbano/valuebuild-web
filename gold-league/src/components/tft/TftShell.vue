<script setup lang="ts">
import { FzAlert, FzButton, FzIcon } from "@chrisdalbano/forza-ui";
import { useTft } from "../../state/tft";
import { tftReviewEnabled } from "../../domain/features";
/** Frame shared by the TFT pages: heading, tool links, data provenance. */
defineProps<{ title: string; lead: string }>();
const { data, source, loading, refresh } = useTft({ live: true });
const tools = [
  { to: "/tft", label: "Roll odds" },
  { to: "/tft/items", label: "Item ledger" },
  { to: "/tft/traits", label: "Trait prices" },
  ...(tftReviewEnabled ? [{ to: "/tft/review", label: "Game review" }] : []),
];
</script>
<template>
  <div class="workspace-page tft-page">
    <div class="page-heading">
      <div>
        <h1>{{ title }}</h1>
        <p>{{ lead }}</p>
      </div>
      <FzButton variant="secondary" size="sm" :loading="loading" @click="refresh"
        ><FzIcon name="undo" :size="14" />Refresh data</FzButton
      >
    </div>
    <nav class="tft-tools" aria-label="Teamfight Tactics tools">
      <RouterLink
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        exact-active-class="current"
        >{{ tool.label }}</RouterLink
      >
    </nav>
    <div class="data-status">
      <span class="status-dot" />Set {{ data.set.number }} · {{ data.set.name
      }}<template v-if="data.patch"> · game data {{ data.patch }}</template
      ><span>{{ source }} · {{ data.fetchedAt.slice(0, 10) }}</span>
    </div>
    <FzAlert
      v-if="!data.economy.verified"
      title="These constants were checked for a different set"
      tone="warning"
      >{{ data.economy.note }}</FzAlert
    >
    <slot />
    <p class="method-note">
      Calculated from published game data. Teamfight Tactics and its assets
      belong to Riot Games; BuildValue is not endorsed by Riot Games.
      <RouterLink to="/about">Read the method ↗</RouterLink>
    </p>
  </div>
</template>
