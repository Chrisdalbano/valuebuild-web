<script setup lang="ts">
import { shallowRef } from "vue";
import { VgButton, VgBadge } from "../vantage";
import HeroSection from "./sections/HeroSection.vue";
import FoundationsSection from "./sections/FoundationsSection.vue";
import ControlsSection from "./sections/ControlsSection.vue";
import BuildLabSection from "./sections/BuildLabSection.vue";
import DocsSection from "./sections/DocsSection.vue";
const paper = shallowRef(false);
</script>
<template>
  <div class="vg-theme showcase" :data-theme="paper ? 'paper' : 'ink'">
    <a class="skip" href="#content">Skip to content</a>
    <header class="topbar">
      <a href="#" class="wordmark" aria-label="Vantage UI home"
        ><span class="brandmark" aria-hidden="true">V/</span>VANTAGE<span
          class="wordmark-ui"
          >UI</span
        ></a
      >
      <nav aria-label="Main navigation">
        <a href="#foundations">Foundations</a
        ><a href="#components">Components</a><a href="#build-lab">Build lab</a
        ><a href="#integration">Developers</a>
      </nav>
      <VgButton
        variant="secondary"
        size="sm"
        :aria-pressed="paper"
        @click="paper = !paper"
        >{{ paper ? "Ink theme" : "Paper theme" }}</VgButton
      >
    </header>
    <main id="content">
      <HeroSection />
      <div class="system-strip">
        <span>VUE 3 / NUXT</span><span>01 DESIGN LANGUAGE</span
        ><span>09 CORE COMPONENTS</span
        ><VgBadge tone="positive">Interactive preview</VgBadge>
      </div>
      <FoundationsSection /><ControlsSection /><BuildLabSection /><DocsSection />
    </main>
    <footer class="page-footer">
      <a class="wordmark" href="#">VANTAGE UI</a>
      <p>
        A design exploration for Christian D’Albano.<br />Independent work. Not
        affiliated with or endorsed by Riot Games.
      </p>
      <span class="mono">DESIGN LAB / 001<br />APPROVAL PREVIEW</span>
    </footer>
  </div>
</template>
