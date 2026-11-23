<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { FzAlert, FzBadge, FzButton } from "@chrisdalbano/forza-ui";
import { useRemote } from "../../composables/useRemote";
import TftShell from "../../components/tft/TftShell.vue";
import BarChart, { type BarRow } from "../../components/charts/BarChart.vue";
interface Decision {
  key: string;
  label: string;
  question: string;
  topFour: number | null;
  bottomFour: number | null;
  difference: number | null;
}
interface Game {
  matchId: string;
  playedAt: number | null;
  placement: number;
  level: number | null;
  goldLeft: number;
  boardGold: number;
  twoStars: number;
  threeStars: number;
  completedItems: number;
  looseComponents: number;
}
interface Review {
  status: "ready" | "example" | "needs_key" | "error";
  missing?: string[];
  reason?: string;
  riotId?: string;
  note?: string;
  otherSets?: number;
  summary?: {
    games: number;
    topFourGames: number;
    bottomFourGames: number;
    averagePlacement: number | null;
    placements: number[];
    decisions: Decision[];
    goldLeftInBottomFour: number;
    rerollsUnspentInBottomFour: number;
  };
  games?: Game[];
}
const { data, loading, error, reload } = useRemote<Review>("/tft/review");
const example = shallowRef<Review | null>(null);
async function showExample() {
  example.value = (await import("../../data/tft.review.example.json"))
    .default as unknown as Review;
}
const review = computed(() =>
  data.value?.status === "ready" ? data.value : example.value,
);
const isExample = computed(() => review.value?.status === "example");
const placementRows = computed<BarRow[]>(() =>
  (review.value?.summary?.placements || []).map((count, index) => ({
    key: String(index + 1),
    label: `${index + 1}${["st", "nd", "rd"][index] || "th"}`,
    parts: [
      {
        value: count,
        color: index < 4 ? "var(--fz-positive)" : "var(--bv-series-8)",
      },
    ],
    display: `${count} ${count === 1 ? "game" : "games"}`,
  })),
);
const show = (value: number | null) => (value === null ? "—" : value.toFixed(1));
const signed = (value: number | null) =>
  value === null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
const scale = (row: Decision) =>
  Math.max(1, row.topFour || 0, row.bottomFour || 0);
const date = (value: number | null) =>
  value ? new Date(value).toLocaleDateString() : "";
</script>
<template>
  <TftShell
    title="What did your own decisions look like?"
    lead="Your ranked games, split into the ones that went well and the ones that did not, decision by decision. Nobody else's board is read."
  >
    <div v-if="loading" class="analysis-loading" role="status">
      Checking the review service... It may need a moment to wake up.
      <div class="loading-lines" aria-hidden="true"><i /><i /><i /></div>
    </div>
    <template v-else>
      <FzAlert
        v-if="error"
        title="The review service could not be reached"
        tone="warning"
        >{{ error }}
        <FzButton size="sm" variant="secondary" @click="reload"
          >Try again</FzButton
        ></FzAlert
      >
      <section
        v-else-if="data?.status === 'needs_key'"
        class="needs-key"
        aria-labelledby="needs-key-title"
      >
        <h2 id="needs-key-title">This needs a Riot API key</h2>
        <p>
          Match history comes from Riot's API, which needs a key. The key lives
          on the BuildValue backend only; it is never sent to your browser.
          None is configured, so there is no review to show.
        </p>
        <dl class="needs-list">
          <div v-for="name in data.missing" :key="name">
            <dt>
              <code>{{ name }}</code>
            </dt>
            <dd>
              {{
                name === "RIOT_API_KEY"
                  ? "A key from Riot's Developer Portal, set as an environment variable on the backend."
                  : "The one Riot ID to review, written Name#TAG. There is no search box: the review is of your own account only."
              }}
            </dd>
          </div>
        </dl>
        <p class="fineprint">
          Why there is no player search: Riot allows tools that show a player
          their own match history on a public site only with Riot Sign On and a
          production key. Until BuildValue has those, this page stays a private
          tool for the account its owner configures.
        </p>
      </section>
      <FzAlert
        v-else-if="data?.status === 'error'"
        title="The review could not be built"
        tone="warning"
        >{{ data.reason }}
        <FzButton size="sm" variant="secondary" @click="reload"
          >Try again</FzButton
        ></FzAlert
      >
      <div v-if="data?.status !== 'ready' && !example" class="example-offer">
        <FzButton variant="secondary" @click="showExample"
          >Show an example with invented games</FzButton
        >
        <span class="fineprint"
          >Twelve made-up games run through the same calculation, so you can
          see what the review looks like.</span
        >
      </div>
      <template v-if="review?.summary">
        <FzAlert
          v-if="isExample"
          title="Example data, not a real account"
          tone="warning"
          >These twelve games are invented. They show the layout and the
          arithmetic only.</FzAlert
        >
        <div class="review-head">
          <h2>{{ review.riotId }}</h2>
          <FzBadge :tone="isExample ? 'warning' : 'positive'">{{
            isExample ? "Example" : "Calculated from your matches"
          }}</FzBadge>
        </div>
        <dl class="insight-metrics">
          <div>
            <dt>Ranked games reviewed</dt>
            <dd>{{ review.summary.games }}</dd>
          </div>
          <div>
            <dt>Average placement</dt>
            <dd>{{ show(review.summary.averagePlacement) }}</dd>
          </div>
          <div>
            <dt>Top four</dt>
            <dd>
              {{ review.summary.topFourGames }} of {{ review.summary.games }}
            </dd>
          </div>
          <div>
            <dt>Gold unspent in bottom-four games</dt>
            <dd>
              {{ review.summary.goldLeftInBottomFour }}
              <small
                >= {{ review.summary.rerollsUnspentInBottomFour }} rerolls not
                taken</small
              >
            </dd>
          </div>
        </dl>
        <div class="chart-grid-2">
          <div>
            <h3>Where you finished</h3>
            <BarChart label="Games by final placement" :rows="placementRows" />
          </div>
          <div>
            <h3>Reading this</h3>
            <p>{{ review.note }}</p>
            <p v-if="review.otherSets" class="fineprint">
              {{ review.otherSets }} of these games were played in a different
              set; their board gold uses this set's unit costs where the unit
              still exists.
            </p>
          </div>
        </div>
        <h3>Your better games against your worse games</h3>
        <ol class="decision-list">
          <li
            v-for="(row, index) in review.summary.decisions"
            :key="row.key"
            :style="{ '--i': index }"
          >
            <div class="decision-text">
              <strong>{{ row.label }}</strong>
              <span>{{ row.question }}</span>
            </div>
            <div class="decision-bars">
              <div>
                <span>Top four</span
                ><span class="bar-track"
                  ><span
                    class="bar-fill top"
                    :style="{ width: `${((row.topFour || 0) / scale(row)) * 100}%` }" /></span
                ><strong>{{ show(row.topFour) }}</strong>
              </div>
              <div>
                <span>Bottom four</span
                ><span class="bar-track"
                  ><span
                    class="bar-fill bottom"
                    :style="{ width: `${((row.bottomFour || 0) / scale(row)) * 100}%` }" /></span
                ><strong>{{ show(row.bottomFour) }}</strong>
              </div>
            </div>
            <span class="decision-diff"
              >{{ signed(row.difference) }}<small>difference</small></span
            >
          </li>
        </ol>
        <h3>Game by game</h3>
        <div class="catalog-table-scroll" tabindex="0" aria-label="Reviewed games">
          <table class="catalog-table review-table">
            <caption class="sr-only">
              End state of each reviewed game
            </caption>
            <thead>
              <tr>
                <th scope="col">Played</th>
                <th scope="col">Placement</th>
                <th scope="col">Level</th>
                <th scope="col">Gold left</th>
                <th scope="col">Board gold</th>
                <th scope="col">2★ / 3★</th>
                <th scope="col">Items / loose components</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="game in review.games" :key="game.matchId">
                <td>{{ date(game.playedAt) }}</td>
                <td>
                  <strong :class="game.placement <= 4 ? 'mint' : ''">{{
                    game.placement
                  }}</strong>
                </td>
                <td>{{ game.level ?? "—" }}</td>
                <td>{{ game.goldLeft }}</td>
                <td>{{ game.boardGold }}</td>
                <td>{{ game.twoStars }} / {{ game.threeStars }}</td>
                <td>{{ game.completedItems }} / {{ game.looseComponents }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
  </TftShell>
</template>
