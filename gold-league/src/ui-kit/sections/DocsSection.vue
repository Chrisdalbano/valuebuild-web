<script setup lang="ts">
import { shallowRef } from "vue";
import { FzTabs, FzBadge, FzIcon } from "../../forza";
import ApiSection from "./ApiSection.vue";
const mode = shallowRef("vue");
const examples = {
  vue: `// npm add reka-ui @lucide/vue @formkit/auto-animate embla-carousel-vue
// Vue 3.5+ / local source imports
import { FzButton, FzField } from './forza'
import './forza/tokens.css'

<FzField v-model="name" label="Build name" />
<FzButton @click="saveBuild">Save build</FzButton>`,
  nuxt: `// npm add reka-ui @lucide/vue @formkit/auto-animate embla-carousel-vue
// Copy forza/ into app/components/forza/
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/components/forza/tokens.css']
})

// Explicit imports in a Nuxt page
import { FzButton } from '~/components/forza'
// Wrap your layout in <div class="fz-theme">`,
};
</script>
<template>
  <section id="integration" class="section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">For developers</span>
        <h2>A system you can build on.</h2>
      </div>
      <FzBadge>Source-first / publication pending</FzBadge>
    </div>
    <div class="docs-grid">
      <div>
        <h3 class="docs-title">Typed components. Shared tokens.</h3>
        <p class="muted">
          Typed Vue primitives with explicit props, slots, and events. No
          BuildValue API imports. Accessible behavior from Reka UI. List motion
          from AutoAnimate. Copy the source into Vue or Nuxt and own every
          detail.
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
          <code>.fz-theme</code> wrapper. Fonts are host-owned; the preview
          self-hosts open-source typefaces.
        </p>
      </div>
      <div class="code-panel">
        <FzTabs
          v-model="mode"
          label="Integration framework"
          :options="[
            { value: 'vue', label: 'Vue 3' },
            { value: 'nuxt', label: 'Nuxt' },
          ]"
        >
          <pre><code>{{examples[mode as keyof typeof examples]}}</code></pre></FzTabs
        ><span class="code-caption"
          >LOCAL SOURCE PREVIEW / NO PUBLISHED PACKAGE YET</span
        >
      </div>
    </div>
    <ApiSection />
    <div class="motion-notes">
      <h3>Motion that follows your input.</h3>
      <p>
        160ms for local feedback. 260ms for list changes. Dialogs arrive in
        320ms and leave in 180ms. Transform and opacity handle movement;
        reduced-motion preferences switch it off.
      </p>
      <div class="motion-contract">
        <code
          >&lt;FzList :items="builds" label="Saved builds"&gt;<br />
          &lt;template #default="{ item }"&gt;<br />
          &lt;BuildRow :build="item" @remove="remove(item.id)" /&gt;<br />
          &lt;/template&gt;<br />&lt;/FzList&gt;</code
        >
      </div>
      <p>
        Stable item IDs preserve identity. Props carry data down; typed events
        carry intent up. Override duration per list, or disable its motion
        altogether.
      </p>
      <p>
        <a href="https://reka-ui.com/docs/guides/animation"
          >Reka UI animation</a
        >
        / <a href="https://auto-animate.formkit.com/">AutoAnimate</a> /
        <a href="https://lucide.dev/">Lucide</a>
      </p>
    </div>
    <details class="research">
      <summary>
        Design research & the original direction
        <FzIcon name="chevronDown" :size="16" />
      </summary>
      <div>
        <p>
          Riot’s designers describe adapting a shared visual language to
          different products, with hierarchy driven by player needs. Forza
          interprets that as quiet controls inside an expressive editorial
          frame.
        </p>
        <a
          href="https://www.riotgames.com/en/news/complementary-visual-design-in-spirit-blossom"
          >Riot: Complementary Visual Design in Spirit Blossom
          <FzIcon name="arrowUpRight" :size="14"
        /></a>
        <p>
          Stink Studios’ Riot identity connects many games through expressive
          graphic rules. Forza uses its own F monogram, warm signal palette, and
          condensed type pairing.
        </p>
        <a href="https://www.stinkstudios.com/work/riot-games-brand-evolution"
          >Stink Studios: Riot Games Brand Evolution
          <FzIcon name="arrowUpRight" :size="14"
        /></a>
        <p>
          Riot’s Hextech engineering article describes self-contained UI units.
          Here, framework-independent tokens and Vue components stay separate
          from the showcase and product fixtures.
        </p>
        <a
          href="https://www.riotgames.com/en/news/under-hood-league-client%E2%80%99s-hextech-ui"
          >Riot: Under the hood of the League Client’s Hextech UI
          <FzIcon name="arrowUpRight" :size="14"
        /></a>
        <p>
          This is an independent study. No Riot logos, proprietary typefaces,
          character art, or source code are included. The working name and
          public release remain subject to review.
        </p>
      </div>
    </details>
  </section>
</template>
