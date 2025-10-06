<template>
  <div class="about-section">
    <h2>About Gold Efficiency</h2>
    
    <div class="info-card">
      <h3>What is Gold Efficiency?</h3>
      <p>
        Gold efficiency is a derivative heuristic to compare item efficiency based on their 
        stats versus price (gold cost). It's calculated as:
      </p>
      <div class="formula">
        Gold Efficiency = (Gold Value / Item Price) × 100%
      </div>
      <p>
        Where <strong>Gold Value</strong> is the sum of the item's stats multiplied by their 
        reference gold values from base items.
      </p>
    </div>

    <div class="info-card">
      <h3>Rating System</h3>
      <ul class="rating-list">
        <li><span class="badge eff-excellent">Excellent</span> ≥120% - Exceptional value</li>
        <li><span class="badge eff-good">Good</span> ≥100% - Cost efficient</li>
        <li><span class="badge eff-fair">Fair</span> ≥80% - Moderate value</li>
        <li><span class="badge eff-poor">Poor</span> &lt;80% - Low stat value (usually has powerful passives)</li>
      </ul>
    </div>

    <div class="info-card">
      <h3>Important Notes</h3>
      <ul>
        <li>Gold efficiency only measures <strong>stat value</strong>, not the power of passive or active effects</li>
        <li>Items with low efficiency often have powerful unique effects that aren't reflected in raw stats</li>
        <li>Use this tool as a <strong>starting point</strong> for theorycrafting, not as absolute truth</li>
        <li>Champion synergies, team composition, and game state are more important than raw efficiency</li>
      </ul>
    </div>

    <div class="info-card">
      <h3>Reference Stat Values</h3>
      <div class="stat-values-grid">
        <div class="stat-value-item">
          <span class="stat-name">Attack Damage</span>
          <span class="stat-gold">35g per point</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Ability Power</span>
          <span class="stat-gold">20g per point</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Armor</span>
          <span class="stat-gold">20g per point</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Magic Resist</span>
          <span class="stat-gold">20g per point</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Health</span>
          <span class="stat-gold">2.67g per HP</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Mana</span>
          <span class="stat-gold">1g per mana</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Attack Speed</span>
          <span class="stat-gold">250g per 10%</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Crit Chance</span>
          <span class="stat-gold">40g per 1%</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Life Steal</span>
          <span class="stat-gold">53.55g per 1%</span>
        </div>
        <div class="stat-value-item">
          <span class="stat-name">Movement Speed</span>
          <span class="stat-gold">12g per point</span>
        </div>
      </div>
    </div>

    <div class="info-card tech-stack">
      <h3>Tech Stack</h3>
      <p>Built with Vue 3, FastAPI, Chart.js, and Riot's Data Dragon API</p>
      <p class="source-link">
        Data sourced from 
        <a href="https://leagueoflegends.fandom.com/wiki/Gold_efficiency" target="_blank">
          League of Legends Wiki
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-section {
  padding: 1.5rem;
  color: var(--text-primary);
}

.about-section h2 {
  color: var(--gold);
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
}

.info-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  margin-bottom: 1.75rem;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.info-card h3 {
  color: var(--gold);
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-card p {
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.info-card ul {
  line-height: 1.8;
  color: var(--text-secondary);
  padding-left: 1.5rem;
}

.info-card strong {
  color: var(--text-primary);
  font-weight: 600;
}

.formula {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gold);
  margin: 1.5rem 0;
  border: 1px solid var(--border-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
}

.rating-list {
  list-style: none;
  padding: 0;
}

.rating-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem;
  background: var(--bg-tertiary);
  margin-bottom: 0.625rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  min-width: 100px;
  text-align: center;
  font-size: 0.8125rem;
}

.eff-excellent { background: rgba(34, 197, 94, 0.15); color: var(--success); border: 1px solid rgba(34, 197, 94, 0.3); }
.eff-good { background: rgba(59, 130, 246, 0.15); color: var(--info); border: 1px solid rgba(59, 130, 246, 0.3); }
.eff-fair { background: rgba(234, 179, 8, 0.15); color: var(--warning); border: 1px solid rgba(234, 179, 8, 0.3); }
.eff-poor { background: rgba(239, 68, 68, 0.15); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.3); }

.stat-values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-value-item {
  display: flex;
  justify-content: space-between;
  padding: 0.875rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.stat-name {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
}

.stat-gold {
  color: var(--gold);
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.875rem;
}

.tech-stack {
  text-align: center;
}

.source-link {
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.source-link a {
  color: var(--gold);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.source-link a:hover {
  color: rgb(220, 148, 21);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .stat-values-grid {
    grid-template-columns: 1fr;
  }
}
</style>

