<template>
  <section class="section-features">
    <div class="section-container">
      <div class="section-header">
        <h2>Built for Players. Powered by Data.</h2>
        <p>A full-stack web application that transforms how you approach itemization in League of Legends</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));">
            <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/icon_gold.png"
                 alt="Gold Efficiency" class="feature-icon-img" />
          </div>
          <h3>Gold Efficiency Analytics</h3>
          <p>Instantly see how much stat value you get per gold spent. Every item is analyzed using official base stat formulas derived from League's component items.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));">
            <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsadaptiveforceicon.png"
                 alt="Compare" class="feature-icon-img" />
          </div>
          <h3>Advanced Comparison</h3>
          <p>Compare up to 6 items side-by-side with detailed stat breakdowns, build paths, and visual efficiency charts. Make informed decisions in champion select.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05));">
            <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/icon_aoe.png"
                 alt="Build Optimizer" class="feature-icon-img" />
          </div>
          <h3>Build Optimizer</h3>
          <p>Construct optimal 6-item builds and see total gold value, combined stats, and efficiency ratings. Experiment without risking LP.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));">
            <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/icon_move_speed.png"
                 alt="Smart Insights" class="feature-icon-img" />
          </div>
          <h3>Flash Comparisons</h3>
          <p>Get instant recommendations on the most efficient items by category. Perfect for quick decision-making during game lobbies.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));">
            <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/strawberry/icon_cooldown.png"
                 alt="Live Data" class="feature-icon-img" />
          </div>
          <h3>Weekly Up-to-Date</h3>
          <p>Automated ETL pipeline syncs with Riot's DDragon API every Monday. New items, balance changes, and patches are reflected automatically.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Inline rgba feature-icon tints above are legacy raw colors kept verbatim (no token maps). */
.section-features { padding: 6rem 2rem; position: relative; }

.section-container { max-width: 1200px; margin: 0 auto; }

.section-header { text-align: center; margin-bottom: 4rem; }
.section-header h2 { font-size: 2.5rem; font-weight: 700; color: var(--fg-primary); margin-bottom: 1rem; }
.section-header p { font-size: 1.125rem; color: var(--fg-secondary); max-width: 700px; margin: 0 auto; }

.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }

.features-grid .feature-card:nth-child(4),
.features-grid .feature-card:nth-child(5) { grid-column: span 1; }

/* Center last 2 cards when 5 total */
@media (min-width: 1025px) {
  .features-grid { grid-template-columns: repeat(6, 1fr); }
  .features-grid .feature-card:nth-child(1),
  .features-grid .feature-card:nth-child(2),
  .features-grid .feature-card:nth-child(3) { grid-column: span 2; }
  .features-grid .feature-card:nth-child(4) { grid-column: 2 / span 2; }
  .features-grid .feature-card:nth-child(5) { grid-column: 4 / span 2; }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .features-grid .feature-card:nth-child(5) { grid-column: span 2; }
}

.feature-card { padding: 2rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; transition: all 0.3s ease; }

.feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); border-color: var(--accent-lead); }

.feature-icon-wrapper { width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }

.feature-icon-img { width: 40px; height: 40px; object-fit: contain; }

.feature-card h3 { font-size: 1.25rem; font-weight: 600; color: var(--fg-primary); margin-bottom: 0.75rem; }

.feature-card p { font-size: 0.9375rem; color: var(--fg-secondary); line-height: 1.7; }

@media (max-width: 768px) {
  .section-header h2 { font-size: 2rem; }
  .section-header p { font-size: 1rem; }
  .features-grid { grid-template-columns: 1fr !important; }
  .features-grid .feature-card:nth-child(4),
  .features-grid .feature-card:nth-child(5) { grid-column: span 1 !important; }
  .section-features { padding: 4rem 1.5rem; }
}
</style>
