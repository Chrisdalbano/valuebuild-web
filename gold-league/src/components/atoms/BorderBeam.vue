<script setup>
// A slow gold beam circling the parent's border (Inspira BorderBeam, CSS-only).
// Parent needs position: relative. Hidden entirely under reduced motion.
defineProps({
  duration: { type: Number, default: 6 }, // seconds per lap
})
</script>

<template>
  <span class="border-beam" :style="{ '--beam-duration': duration + 's' }" aria-hidden="true"></span>
</template>

<style scoped>
@property --beam-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.border-beam {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  padding: 2px;
  pointer-events: none;
  background: conic-gradient(
    from var(--beam-angle),
    transparent 0deg,
    transparent 295deg,
    color-mix(in srgb, var(--accent-lead) 35%, transparent) 330deg,
    var(--accent-lead) 352deg,
    var(--accent-lead-hover) 360deg
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: beam-spin var(--beam-duration) linear infinite;
}

@keyframes beam-spin {
  to { --beam-angle: 360deg; }
}

@media (prefers-reduced-motion: reduce) {
  .border-beam { display: none; }
}
</style>
