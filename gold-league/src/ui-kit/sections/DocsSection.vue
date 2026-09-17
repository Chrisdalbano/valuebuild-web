<script setup lang="ts">
import { shallowRef } from "vue";
import { VgTabs, VgBadge } from "../../vantage";
const mode = shallowRef("vue");
const examples = {
  vue: `// Vue 3.5+ / local source imports
import { VgButton, VgField } from './vantage'
import './vantage/tokens.css'

<VgField v-model="name" label="Build name" />
<VgButton @click="saveBuild">Save build</VgButton>`,
  nuxt: `// Copy vantage/ into app/components/vantage/
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/components/vantage/tokens.css']
})

// Explicit imports in a Nuxt page
import { VgButton } from '~/components/vantage'
// Wrap your layout in <div class="vg-theme">`,
};
</script>
<template>
  <section id="integration" class="section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">04 / UNDER THE SURFACE</span>
        <h2>Designed to become your own.</h2>
      </div>
      <VgBadge>Source-first / publication pending</VgBadge>
    </div>
    <div class="docs-grid">
      <div>
        <h3 class="docs-title">A system, not a stylesheet.</h3>
        <p class="muted">
          Nine typed primitives with explicit props, slots, and events. No
          BuildValue API imports. No styling framework dependency. Copy the
          source into Vue or Nuxt and own every detail.
        </p>
        <div class="architecture-row">
          <span>01</span><strong>Primitive tokens</strong
          ><small>Raw palette, spacing, type</small>
        </div>
        <div class="architecture-row">
          <span>02</span><strong>Semantic roles</strong
          ><small>Surface, signal, feedback</small>
        </div>
        <div class="architecture-row">
          <span>03</span><strong>Component contracts</strong
          ><small>Props, models, slots, states</small>
        </div>
        <p class="muted small-copy">
          Ink and Paper share a contract. Override semantic variables on a
          <code>.vg-theme</code> wrapper. Fonts are host-owned; the preview
          self-hosts open-source typefaces.
        </p>
      </div>
      <div class="code-panel">
        <VgTabs
          v-model="mode"
          label="Integration framework"
          :options="[
            { value: 'vue', label: 'Vue 3' },
            { value: 'nuxt', label: 'Nuxt' },
          ]"
        >
          <pre><code>{{examples[mode as keyof typeof examples]}}</code></pre></VgTabs
        ><span class="code-caption"
          >LOCAL SOURCE PREVIEW / NO PUBLISHED PACKAGE YET</span
        >
      </div>
    </div>
    <details class="research">
      <summary>Design research & the original direction <span>+</span></summary>
      <div>
        <p>
          Riot’s designers describe adapting a shared visual language to
          different products, with hierarchy driven by player needs. Vantage
          interprets that as quiet controls inside an expressive editorial
          frame.
        </p>
        <a
          href="https://www.riotgames.com/en/news/complementary-visual-design-in-spirit-blossom"
          >Riot: Complementary Visual Design in Spirit Blossom &#8599;</a
        >
        <p>
          Stink Studios’ Riot identity connects many games through expressive
          graphic rules. Vantage uses its own split-blade symbol, warm signal
          palette, and condensed type pairing.
        </p>
        <a href="https://www.stinkstudios.com/work/riot-games-brand-evolution"
          >Stink Studios: Riot Games Brand Evolution &#8599;</a
        >
        <p>
          Riot’s Hextech engineering article describes self-contained UI units.
          Here, framework-independent tokens and Vue components stay separate
          from the showcase and product fixtures.
        </p>
        <a
          href="https://www.riotgames.com/en/news/under-hood-league-client%E2%80%99s-hextech-ui"
          >Riot: Under the hood of the League Client’s Hextech UI &#8599;</a
        >
        <p>
          This is an independent study. No Riot logos, proprietary typefaces,
          character art, or source code are included. The working name and
          public release remain subject to review.
        </p>
      </div>
    </details>
  </section>
</template>
