<script setup lang="ts">
import { FzIcon } from "../../forza";
</script>
<template>
  <section class="motion-band" aria-label="Designed for connected workflows">
    <div class="motion-word" aria-hidden="true">FROM INPUT. TO IMPACT.</div>
    <div class="motion-intro">
      <span class="mono">SMALL INTERACTIONS. REAL MOMENTUM.</span>
      <h2>Everything connects.</h2>
      <p>
        A choice becomes a build. A build becomes a decision.<br />Give every
        step the attention it deserves.
      </p>
    </div>
    <div class="motion-stage" aria-hidden="true">
      <div class="motion-line"></div>
      <div class="motion-tile">
        <FzIcon name="plus" :size="28" /><span>01 / CREATE</span
        ><strong>Start with intent.</strong>
        <div class="tile-line"></div>
        <div class="tile-line short"></div>
      </div>
      <div class="motion-tile">
        <FzIcon name="settings" :size="28" /><span>02 / REFINE</span
        ><strong>Find your balance.</strong>
        <div class="tile-slider"><i /></div>
      </div>
      <div class="motion-tile">
        <FzIcon name="check" :size="28" /><span>03 / COMMIT</span
        ><strong>Make your move.</strong>
        <div class="tile-result">
          READY TO BUILD <FzIcon name="arrowUpRight" />
        </div>
      </div>
    </div>
  </section>
</template>
