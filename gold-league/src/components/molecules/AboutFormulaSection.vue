<script setup>
import AboutStatValuesTable from './AboutStatValuesTable.vue'
</script>

<template>
  <section class="section-formula">
    <div class="section-container">
      <div class="formula-content">
        <div class="formula-left">
          <h2>Methodology: Measuring Gold Efficiency</h2>
          <p>Gold efficiency is the cornerstone metric of this research — the percentage of an item's cost that converts into raw stat value. Every base stat is priced from League's own component items, so the baseline is reproducible, not opinion.</p>

          <div class="formula-box">
            <div class="formula-label">The Formula</div>
            <div class="formula-equation">
              Gold Efficiency = <span class="formula-fraction"><span class="numerator">Total Stat Value</span><span class="denominator">Item Cost</span></span> × 100%
            </div>
          </div>

          <div class="formula-example">
            <div class="example-header">
              <img src="https://ddragon.leagueoflegends.com/cdn/15.1.1/img/item/3031.png"
                   alt="Infinity Edge" class="example-item-icon" />
              <strong>Example: Infinity Edge</strong>
            </div>
            <div class="example-stats">
              <div class="stat-line">
                <span class="stat-icon">💰</span>
                <span>Cost: <strong>3450g</strong></span>
              </div>
              <div class="stat-line">
                <span class="stat-icon">⚔️</span>
                <span>Stats: <strong>65 AD + 25% Crit</strong></span>
              </div>
              <div class="stat-line">
                <span class="stat-icon">📊</span>
                <span>Stat Value: <strong>3275g</strong> (2275g AD + 1000g Crit)</span>
              </div>
              <div class="stat-line highlight">
                <span class="stat-icon">✨</span>
                <span>Base Efficiency: <strong>94.93%</strong></span>
              </div>
              <div class="stat-line">
                <span class="stat-icon">📉</span>
                <span>Gold Deficit: <strong>-175g</strong></span>
              </div>
            </div>
            <div class="example-note">
              The unique passive amplifies crit damage by 40%, making it essential for ADCs despite being slightly below 100% base efficiency. The true value comes from maximizing your critical strike damage output.
            </div>
          </div>

          <div class="formula-note">
            Gold efficiency only accounts for base stats, not unique passives or actives. A low-efficiency item can still be optimal if its passive is powerful for your champion.
          </div>
        </div>

        <AboutStatValuesTable />
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-formula { padding: 6rem 2rem; position: relative; }

.section-container { max-width: 1200px; margin: 0 auto; }

.formula-content { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }

.formula-left h2 { font-size: 2rem; font-weight: 700; color: var(--fg-primary); margin-bottom: 1rem; }

.formula-left p { color: var(--fg-secondary); line-height: 1.7; margin-bottom: 2rem; }

.formula-box { background: var(--bg-surface); border: 2px solid var(--accent-lead); border-radius: 12px; padding: 2rem; margin: 2rem 0; }

.formula-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-lead); margin-bottom: 1rem; }

.formula-equation { font-size: 1.25rem; color: var(--fg-primary); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.formula-fraction { display: inline-flex; flex-direction: column; align-items: center; margin: 0 0.5rem; }

.numerator { padding-bottom: 0.25rem; border-bottom: 2px solid var(--accent-lead); color: var(--accent-lead); }

.denominator { padding-top: 0.25rem; color: var(--accent-lead); }

.formula-example { padding: 1.5rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; margin: 2rem 0; }

.example-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }

.example-item-icon { width: 48px; height: 48px; border-radius: 6px; border: 2px solid var(--accent-lead); box-shadow: 0 2px 8px color-mix(in srgb, var(--accent-lead) 30%, transparent); }

.example-header strong { color: var(--accent-lead); font-size: 1.125rem; }

.example-stats { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }

.stat-line { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: var(--bg-elevated); border-radius: 6px; font-size: 0.9375rem; color: var(--fg-secondary); }

.stat-line.highlight { background: var(--accent-lead-tint); border: 1px solid color-mix(in srgb, var(--accent-lead) 30%, transparent); }

.stat-icon { font-size: 1.125rem; flex-shrink: 0; }

.stat-line strong { color: var(--fg-primary); font-weight: 600; }

.example-note { padding: 1rem; background: var(--bg-elevated); border-left: 3px solid var(--accent-lead); border-radius: 4px; font-size: 0.875rem; color: var(--fg-secondary); line-height: 1.6; font-style: italic; }

.formula-note { padding: 1rem 1.5rem; background: var(--accent-lead-tint); border-left: 3px solid var(--accent-lead); border-radius: 4px; font-size: 0.9375rem; color: var(--fg-secondary); line-height: 1.6; }

@media (max-width: 1024px) {
  .formula-content { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .section-formula { padding: 4rem 1.5rem; }
}
</style>
