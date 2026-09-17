<script setup lang="ts">
import { useWorkspace } from "../state/workspace";
import { statDefinitions, number } from "../domain/items";
const { dataset, source } = useWorkspace();
</script>
<template>
  <article class="method-page">
    <h1>The numbers.<br /><span class="accent">And their limits.</span></h1>
    <p class="lead">
      BuildValue helps you understand what an item costs and what its base stats
      buy. It does not rank builds by win rate or simulate combat.
    </p>
    <section>
      <h2>Trace every number.</h2>
      <p>
        Riot's public
        <a href="https://developer.riotgames.com/docs/lol#data-dragon"
          >Data Dragon</a
        >
        supplies the item records and artwork. BuildValue's backend filters the
        catalog and calculates stat values. The frontend displays those returned
        values and sums them for builds.
      </p>
      <div class="method-equation">
        Stat efficiency = priced stat value ÷ total cost × 100
      </div>
      <p>
        Currently showing patch <strong>{{ dataset.version }}</strong> from
        {{ source }}. Snapshot date: {{ dataset.fetchedAt?.slice(0, 10) }}. Data
        Dragon can lag regional game patches.
      </p>
      <p>
        A bundled copy of a real API response keeps the explorer usable while
        the service wakes up or when a request fails. Refresh replaces it with
        the API's current catalog.
      </p>
    </section>
    <section>
      <h2>What gets priced?</h2>
      <p>
        The backend multiplies stat amounts by the reference rates in
        <a
          href="https://github.com/Chrisdalbano/valuebuild-web/blob/main/backend/efficiency.py"
          >efficiency.py</a
        >. Rates are maintained constants, not automatically recalibrated each
        patch. The item drawer shows each stat's contribution so the total can
        be inspected.
      </p>
      <p>
        Supported values include attack damage, ability power, health, mana,
        resistances, attack speed, critical chance, movement speed,
        regeneration, lifesteal, and ability haste where supplied or parsed by
        the backend. Passives, actives, penetration, and champion interactions
        are not priced by the base-stat formula.
      </p>
      <p>
        Build totals add the returned values. They do not simulate stacking
        rules, unique item groups, or champion-specific purchase restrictions.
        The budget planner maximizes these base-stat values under a gold limit;
        it is not a combat optimizer.
      </p>
      <p>
        Low or zero efficiency can reflect unpriced effects, not a bad item. A
        high number does not mean an item is right for your champion.
      </p>
    </section>
    <section>
      <h2>Keep research separate from measurement.</h2>
      <p>
        Champion studies, effect estimates, and research copy are generated with
        AI and cached per patch. They may contain incorrect claims or outdated
        recommendations. Generated suggestions are labeled and never added to
        the formula-based stat totals. Opening a study fetches cached data; it
        does not request new generation.
      </p>
      <p>
        Champion-study counts measure occurrences in generated analyses, not
        player pick rates. Purchase timing is an illustrative gold-per-minute
        model, not observed match data.
      </p>
    </section>
    <section>
      <h2>A working application of Forza UI.</h2>
      <p>
        The interface uses the published Forza UI package for inputs, selectors,
        buttons, dialogs, drawers, lists, and pagination. BuildValue owns the
        game data and calculations.
        <a href="https://forzaui.chrisdalbano.com/guide/buildvalue"
          >See the integration guide ↗</a
        >
      </p>
      <p>
        Created by <a href="https://chrisdalbano.com">Chrisdalbano</a> with AI
        assistance across research, code, design iteration, and documentation.
        The project repository and checks are on
        <a href="https://github.com/Chrisdalbano/valuebuild-web">GitHub</a>.
        This project is independent and not endorsed by Riot Games.
      </p>
    </section>
  </article>
</template>
