<script setup>
// "What we study" — the research agenda. Icons from CommunityDragon, tinted
// with semantic accents per research area.
const CD = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry'
const areas = [
  {
    icon: `${CD}/icon_gold.png`,
    tint: 'var(--accent-lead)',
    title: 'Efficiency Baselines',
    body: "Every item measured against the gold value of its raw stats, using the same base prices Riot builds component items from. The ground truth everything else stands on.",
  },
  {
    icon: `${CD}/icon_move_speed.png`,
    tint: 'var(--accent-support)',
    title: 'Effect Valuation',
    body: "The frontier. Heals, shields, on-hit and actives the stat formula can't price. We estimate their gold value against base stats, and show the reasoning.",
  },
  {
    icon: `${CD}/icon_cooldown.png`,
    tint: 'var(--p-violet-500)',
    title: 'Patch Deltas',
    body: 'Itemization shifts every patch. Re-measuring each one lets us watch efficiency rise and fall as the meta moves.',
  },
  {
    icon: `${CD}/icon_aoe.png`,
    tint: 'var(--eff-positive)',
    title: 'Outlier Detection',
    body: "Which items are quietly over- or under-valued for their cost. Surfacing the outliers is how you find what's broken before everyone else does.",
  },
  {
    icon: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsadaptiveforceicon.png',
    tint: 'var(--accent-warm)',
    title: 'Experimental Builds',
    body: 'Hypotheses worth testing. Cost-efficient loadouts and off-meta combos the numbers say might be stronger than their reputation.',
  },
]
</script>

<template>
  <section class="section-areas">
    <div class="section-container">
      <div class="section-header">
        <h2>What We Study</h2>
        <p>Five threads of research into how gold becomes power. Measured, not guessed.</p>
      </div>

      <div class="areas-grid">
        <article v-for="area in areas" :key="area.title" class="area-card">
          <div class="area-icon-wrapper" :style="{ '--area-tint': area.tint }">
            <img :src="area.icon" :alt="area.title" class="area-icon-img" @error="(e) => e.target.style.display = 'none'" />
          </div>
          <h3>{{ area.title }}</h3>
          <p>{{ area.body }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-areas { padding: 6rem 2rem; position: relative; }

.section-container { max-width: 1200px; margin: 0 auto; }

.section-header { text-align: center; margin-bottom: 4rem; }
.section-header h2 { font-size: clamp(2rem, 4vw, 2.5rem); font-weight: 700; color: var(--fg-primary); margin-bottom: 1rem; }
.section-header p { font-size: 1.125rem; color: var(--fg-secondary); max-width: 700px; margin: 0 auto; line-height: 1.6; }

.areas-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2rem; }

/* 3 on top, 2 centered below */
.area-card:nth-child(1), .area-card:nth-child(2), .area-card:nth-child(3) { grid-column: span 2; }
.area-card:nth-child(4) { grid-column: 2 / span 2; }
.area-card:nth-child(5) { grid-column: 4 / span 2; }

.area-card {
  padding: 2rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

.area-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); border-color: var(--accent-lead); }

.area-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--area-tint) 18%, transparent),
    color-mix(in srgb, var(--area-tint) 5%, transparent));
  border: 1px solid color-mix(in srgb, var(--area-tint) 25%, transparent);
}

.area-icon-img { width: 38px; height: 38px; object-fit: contain; }

.area-card h3 { font-size: 1.25rem; font-weight: 600; color: var(--fg-primary); margin-bottom: 0.75rem; }
.area-card p { font-size: 0.9375rem; color: var(--fg-secondary); line-height: 1.7; }

@media (max-width: 1024px) and (min-width: 769px) {
  .areas-grid { grid-template-columns: repeat(2, 1fr); }
  .area-card:nth-child(n) { grid-column: auto; }
  .area-card:nth-child(5) { grid-column: span 2; }
}

@media (max-width: 768px) {
  .section-areas { padding: 4rem 1.5rem; }
  .section-header h2 { font-size: 2rem; }
  .section-header p { font-size: 1rem; }
  .areas-grid { grid-template-columns: 1fr; }
  .area-card:nth-child(n) { grid-column: auto; }
}
</style>
