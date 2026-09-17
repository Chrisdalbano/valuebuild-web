<script setup lang="ts">
const colors = [
  { name: "Ink", hex: "#101416", token: "--fz-bg" },
  { name: "Signal", hex: "#FF705B", token: "--fz-accent" },
  { name: "Ivory", hex: "#F2EFE6", token: "--fz-text" },
  { name: "Mint", hex: "#A8D6B5", token: "--fz-positive" },
  { name: "Alloy", hex: "#E3C38C", token: "--fz-warning" },
];
</script>
<template>
  <section id="foundations" class="section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">Foundations</span>
        <h2>Color and typography.</h2>
      </div>
      <p>
        Editorial scale. Instrument-panel precision.<br />One signal color with
        a job to do.
      </p>
    </div>
    <div class="foundation-grid">
      <div class="palette">
        <div v-for="color in colors" :key="color.name" class="swatch">
          <div :style="{ background: color.hex }" />
          <strong>{{ color.name }}</strong
          ><span>{{ color.hex }}</span>
        </div>
        <p class="palette-note">
          INK PALETTE / Semantic tokens adapt in Paper theme.
        </p>
      </div>
      <div class="type-specimen">
        <span class="eyebrow">Typography</span>
        <div class="display-spec">MAKE YOUR<br /><span>ADVANTAGE.</span></div>
        <div class="type-bottom">
          <span>Barlow Condensed<br /><small>Display / 600-700</small></span
          ><span>Manrope<br /><small>Interface / 400-600</small></span
          ><span class="mono"
            >0123456789<br /><small>IBM Plex Mono / Data</small></span
          >
        </div>
      </div>
    </div>
    <div class="principles">
      <article>
        <span>01</span>
        <h3>Focus earns color.</h3>
        <p>
          Signal marks action. Mint marks a positive result. Information stays
          quiet until it matters.
        </p>
      </article>
      <article>
        <span>02</span>
        <h3>Energy at the edges.</h3>
        <p>
          Angular identity and assertive type frame calm, legible controls. No
          decoration over data.
        </p>
      </article>
      <article>
        <span>03</span>
        <h3>Motion has a reason.</h3>
        <p>
          Fast, restrained feedback confirms your input. Reduced-motion
          preferences come first.
        </p>
      </article>
    </div>
  </section>
</template>
