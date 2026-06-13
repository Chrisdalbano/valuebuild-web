<script setup>
// A speculative, model-estimated gold value. Deliberately NOT gold and NOT shaped
// like EfficiencyBadge/GoldValue — azure support accent + an "est." marker — so an
// estimate can never be mistaken for the ground-truth efficiency number. We don't
// name the AI vendor anywhere user-facing.
defineProps({
  value: { type: [Number, String], default: null },
  confidence: { type: String, default: '' }, // low | medium | high
})
</script>

<template>
  <span class="ai-badge" :class="confidence ? `conf-${confidence}` : ''">
    <span class="ai-marker">est.</span>
    <span v-if="value !== null" class="ai-value">≈ {{ value }}g</span>
    <span v-if="confidence" class="ai-conf">{{ confidence }}</span>
  </span>
</template>

<style scoped>
.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--accent-support-tint);
  border: 1px solid color-mix(in srgb, var(--accent-support) 35%, transparent);
  font-size: 0.75rem;
  line-height: 1;
}

.ai-marker {
  font-size: 0.5625rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-support);
  opacity: 0.85;
}

.ai-value {
  color: var(--accent-support);
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
}

.ai-conf {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.0625rem 0.3rem;
  border-radius: 999px;
  color: var(--fg-secondary);
  background: var(--bg-elevated);
}

.conf-high .ai-conf { color: var(--eff-positive); }
.conf-medium .ai-conf { color: var(--eff-neutral); }
.conf-low .ai-conf { color: var(--fg-muted); }
</style>
