<template>
  <div class="formula-right">
    <div class="stat-values-table">
      <div class="table-header">Base Stat Gold Values</div>
      <div class="stat-row">
        <span class="stat-name-col">Attack Damage</span>
        <span class="stat-value-col">35g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Ability Power</span>
        <span class="stat-value-col">20g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Armor</span>
        <span class="stat-value-col">20g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Magic Resist</span>
        <span class="stat-value-col">20g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Health</span>
        <span class="stat-value-col">2.67g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Mana</span>
        <span class="stat-value-col">1g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Attack Speed (10%)</span>
        <span class="stat-value-col">250g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Crit Chance (1%)</span>
        <span class="stat-value-col">40g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Life Steal (1%)</span>
        <span class="stat-value-col">53.55g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Movement Speed</span>
        <span class="stat-value-col">12g</span>
      </div>
      <div class="stat-row">
        <span class="stat-name-col">Ability Haste</span>
        <span class="stat-value-col">26.67g</span>
      </div>
    </div>
    <div class="table-source">
      Derived from League's basic component items (Long Sword, Ruby Crystal, etc.)
    </div>
  </div>
</template>

<style scoped>
.stat-values-table { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; position: sticky; top: 2rem; }

.table-header { padding: 1rem 1.5rem; background: var(--bg-elevated); border-bottom: 1px solid var(--border); font-weight: 600; color: var(--accent-lead); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }

.stat-row { display: flex; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); transition: background 0.2s ease; }

.stat-row:last-child { border-bottom: none; }

.stat-row:hover { background: var(--bg-elevated); }

.stat-name-col { color: var(--fg-primary); font-weight: 500; font-size: 0.9375rem; }

.stat-value-col { color: var(--accent-lead); font-weight: 600; font-family: 'Monaco', 'Courier New', monospace; font-size: 0.9375rem; }

.table-source { padding: 0.75rem 1.5rem; font-size: 0.75rem; color: var(--fg-muted); text-align: center; background: var(--bg-elevated); }

@media (max-width: 1024px) {
  .stat-values-table { position: static; }
}
</style>
