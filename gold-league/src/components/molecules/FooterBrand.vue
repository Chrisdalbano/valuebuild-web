<script setup>
// Brand block only — dataset stats (items / patch / computed math / freshness)
// live in the footer's Dataset column now, so there's no duplication.
</script>

<template>
  <div class="footer-brand">
    <div class="brand-logo">
      <img src="/20px-Gold_colored_icon.png" alt="Gold" class="brand-icon" />
      <h3>BuildValue</h3>
    </div>
    <p class="brand-tagline">
      Advanced gold efficiency analytics for League of Legends items.
      Make smarter build decisions with data-driven insights.
    </p>
  </div>
</template>

<style scoped>
.footer-brand { padding-right: 2rem; }

.brand-logo { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }

.brand-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--footer-accent) 60%, transparent));
}

.brand-logo h3 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--footer-accent-bright), var(--footer-accent));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.brand-tagline {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .footer-brand {
    padding-right: 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid color-mix(in srgb, var(--footer-accent) 15%, transparent);
  }
}
</style>
