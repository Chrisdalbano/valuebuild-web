<script setup>
defineProps({
  lastUpdate: { type: String, default: null },
})

// Format last update timestamp
const formatLastUpdate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}
</script>

<template>
  <section class="section-cta">
    <div class="section-container-narrow">
      <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/1111.jpg"
           alt="BuildValue" class="cta-icon" />
      <h2>Go find what the numbers are hiding.</h2>
      <p>Every item, priced and measured against the latest patch. Start exploring the data.</p>
      <button @click="$router.push('/')" class="btn-cta-large">
        Browse the Database
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      <!-- Last Update Info -->
      <div v-if="lastUpdate" class="last-update-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="update-icon">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>Data last updated: {{ formatLastUpdate(lastUpdate) }}</span>
      </div>

      <div class="disclaimer">
        BuildValue is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-cta { padding: 6rem 2rem; position: relative; }

.section-container-narrow { max-width: 800px; margin: 0 auto; text-align: center; }

.cta-icon { width: 80px; height: 80px; margin-bottom: 2rem; filter: drop-shadow(0 4px 16px color-mix(in srgb, var(--accent-lead) 40%, transparent)); }

.section-cta h2 { font-size: 2.5rem; font-weight: 700; color: var(--fg-primary); margin-bottom: 1rem; }

.section-cta p { font-size: 1.125rem; color: var(--fg-secondary); margin-bottom: 2.5rem; }

.btn-cta-large { display: inline-flex; align-items: center; gap: 0.75rem; padding: 1.25rem 3rem; background: linear-gradient(135deg, var(--accent-lead), var(--accent-lead-press)); color: var(--accent-lead-foreground); font-size: 1.25rem; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 20px color-mix(in srgb, var(--accent-lead) 40%, transparent); }

.btn-cta-large:hover { transform: translateY(-2px); box-shadow: 0 6px 30px color-mix(in srgb, var(--accent-lead) 55%, transparent); }

.btn-cta-large svg { width: 20px; height: 20px; }

.last-update-info { margin-top: 2rem; padding: 0.875rem 1.25rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--fg-secondary); }

.update-icon { width: 16px; height: 16px; color: var(--accent-lead); flex-shrink: 0; }

/* Merged legacy cascade: a later duplicate `.disclaimer` rule (in the dead "legacy
   styles" block) overrode margin/padding/background/radius/line-height; only the
   border survived from the first rule. This is the computed style that rendered. */
.disclaimer { margin-top: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--fg-muted); line-height: 1.5; }

@media (max-width: 768px) {
  .section-cta { padding: 4rem 1.5rem; }
  .section-cta h2 { font-size: 2rem; }
  .btn-cta-large { font-size: 1.125rem; padding: 1rem 2rem; }
}
</style>
