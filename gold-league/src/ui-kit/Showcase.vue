<script setup lang="ts">
import { shallowRef } from "vue";
import ForzaMark from "./ForzaMark.vue";
import { FzButton, FzBadge, FzIcon } from "../forza";
import HeroSection from "./sections/HeroSection.vue";
import FoundationsSection from "./sections/FoundationsSection.vue";
import ControlsSection from "./sections/ControlsSection.vue";
import BuildLabSection from "./sections/BuildLabSection.vue";
import DocsSection from "./sections/DocsSection.vue";
const paper = shallowRef(false);
</script>
<template>
  <div class="fz-theme showcase" :data-theme="paper ? 'paper' : 'ink'">
    <a class="skip" href="#content">Skip to content</a>
    <header class="topbar">
      <a href="#" class="wordmark" aria-label="Forza UI home"
        ><span class="brandmark" aria-hidden="true"><ForzaMark /></span
        >FORZA<span class="wordmark-ui">UI</span></a
      >
      <nav aria-label="Main navigation">
        <a href="#foundations">Foundations</a
        ><a href="#components">Components</a><a href="#build-lab">Build lab</a
        ><a href="#integration">Developers</a>
      </nav>
      <FzButton
        variant="secondary"
        size="sm"
        :aria-pressed="paper"
        @click="paper = !paper"
        ><FzIcon :name="paper ? 'moon' : 'sun'" :size="14" />{{
          paper ? "Ink theme" : "Paper theme"
        }}</FzButton
      >
    </header>
    <main id="content">
      <HeroSection />
      <div class="system-strip">
        <span>VUE 3 / NUXT</span><span>SHARED TOKENS</span
        ><span>VUE COMPONENTS</span
        ><FzBadge tone="positive">Interactive preview</FzBadge>
      </div>
      <FoundationsSection /><ControlsSection /><BuildLabSection /><DocsSection />
    </main>
    <footer class="page-footer">
      <a class="wordmark" href="#">FORZA UI</a>
      <p>
        A design exploration for Christian D'Albano.<br />Independent work. Not
        affiliated with or endorsed by Riot Games.
      </p>
      <span class="mono">FORZA UI<br />APPROVAL PREVIEW</span>
    </footer>
  </div>
</template>
