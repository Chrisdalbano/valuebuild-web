<template>
  <div class="about-section">
    <div class="hero-section">
      <img src="https://raw.communitydragon.org/15.8/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/inspiration/kleptomancy/kleptomancy.png" alt="Gold" class="hero-icon" />
      <h1>BuildValue - League Item Optimizer</h1>
      <p class="tagline">Data-driven item analysis for League of Legends</p>
    </div>
 

    <div class="info-card">
      <h3>💡 What is Gold Efficiency?</h3>
      <p>
        Gold efficiency measures how much <strong>stat value</strong> you get per gold spent. 
        It's calculated by comparing an item's total stat value to its cost:
      </p>
      <div class="formula">
        Gold Efficiency = (Total Stat Value / Item Cost) × 100%
      </div>
      <p>
        <strong>Example:</strong> If an item costs 3000g but provides 3600g worth of stats, 
        it has <span class="highlight-green">120% gold efficiency</span> - you're getting 20% more value!
      </p>
    </div>


    <div class="info-card warning-card">
      <h3>⚠️ Important Limitations</h3>
      <ul>
        <li>🎯 Gold efficiency only measures <strong>raw stat value</strong>, NOT passive/active abilities</li>
        <li>⚡ Items like Infinity Edge or Rabadon's Deathcap have low base efficiency but AMPLIFY other stats</li>
        <li>🛡️ Defensive items often have low efficiency but provide crucial survivability</li>
        <li>🎮 Champion synergies, team composition, and game state matter MORE than raw numbers</li>
        <li>📊 Use this as a <strong>guide</strong>, not absolute truth - context is king!</li>
      </ul>
    </div>

    <div class="info-card tips-card">
      <h3>💎 Pro Tips</h3>
      <div class="tips-grid">
        <div class="tip-item">
          <span class="tip-number">1</span>
          <div>
            <strong>Component Items</strong>
            <p>Early game components often have high efficiency - they give you strong laning power!</p>
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-number">2</span>
          <div>
            <strong>Completed Items</strong>
            <p>Lower efficiency is OK if the unique passive is game-changing (e.g., Guardian Angel)</p>
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-number">3</span>
          <div>
            <strong>Build Path</strong>
            <p>Check the "Builds From" section to see if you already own components</p>
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-number">4</span>
          <div>
            <strong>Compare Tool</strong>
            <p>Use item comparison to decide between similar items for your champion</p>
          </div>
        </div>
      </div>
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



    
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-section {
  padding: 2rem 1.5rem;
  color: var(--text-primary);
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 2rem;
}

.hero-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 4px 8px rgba(193, 131, 28, 0.3));
}

.hero-section h1 {
  color: var(--gold);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.tagline {
  font-size: 1.125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 1.75rem;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.highlight-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02));
  border-color: rgba(59, 130, 246, 0.3);
}

.warning-card {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.05), rgba(234, 179, 8, 0.02));
  border-color: rgba(234, 179, 8, 0.3);
}

.tips-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02));
  border-color: rgba(34, 197, 94, 0.3);
}

.how-to-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(168, 85, 247, 0.02));
  border-color: rgba(168, 85, 247, 0.3);
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

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.highlight-green {
  color: var(--success);
  font-weight: 600;
}

.tips-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.tip-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  align-items: flex-start;
}

.tip-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--gold);
  color: #000;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.tip-item strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.tip-item p {
  margin: 0;
  font-size: 0.875rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.step-item {
  padding: 1.25rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--gold), rgb(220, 148, 21));
  color: #000;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.step-item p {
  margin: 0;
  font-size: 0.875rem;
}

.tech-stack {
  text-align: center;
}

.tech-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0;
  text-align: left;
}

.tech-item {
  padding: 0.875rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  font-size: 0.875rem;
}

.tech-item strong {
  color: var(--gold);
  margin-right: 0.5rem;
}

.source-link {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
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

.disclaimer {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-tertiary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 1.75rem;
  }
  
  .stat-values-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-grid,
  .steps-grid,
  .tech-details {
    grid-template-columns: 1fr;
  }
  
  .about-section {
    padding: 1rem;
  }
  
  .info-card {
    padding: 1.25rem;
  }
}
</style>

