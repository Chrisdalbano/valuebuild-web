<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// The /research route exists as of Phase B3 — the teaser is now a live link.
const researchLive = ref(true)
const router = useRouter()

function openResearch() {
  if (researchLive.value) router.push('/research')
}
</script>

<template>
  <section class="section-gap">
    <div class="section-container">
      <div class="section-header">
        <h2>The Open Problem: Valuing Effects</h2>
        <p>
          Gold efficiency only counts what it can measure — flat stats. But the things that win games
          often aren't stats at all.
        </p>
      </div>

      <div class="gap-split">
        <div class="gap-col measured">
          <div class="gap-tag measured-tag">Measurable</div>
          <h3>What the formula sees</h3>
          <ul class="gap-list">
            <li><span>40 Ability Power</span><span class="gap-val solid">800g</span></li>
            <li><span>25% Critical Strike</span><span class="gap-val solid">1000g</span></li>
            <li><span>300 Health</span><span class="gap-val solid">800g</span></li>
          </ul>
          <p class="gap-foot">Exact, deterministic, traced to component items.</p>
        </div>

        <div class="gap-arrow" aria-hidden="true">vs</div>

        <div class="gap-col missed">
          <div class="gap-tag missed-tag">Unpriced</div>
          <h3>What it misses</h3>
          <ul class="gap-list">
            <li><span>Heal for 8% of damage dealt</span><span class="gap-val unknown">? g</span></li>
            <li><span>Shield on takedown</span><span class="gap-val unknown">? g</span></li>
            <li><span>On-hit magic damage</span><span class="gap-val unknown">? g</span></li>
          </ul>
          <p class="gap-foot">Invisible to the formula — yet often the whole point of the item.</p>
        </div>
      </div>

      <div class="gap-cta">
        <p class="gap-cta-copy">
          This is where the research goes next: using AI to estimate the gold value of effects
          <em>in relation to base stats</em>, with the reasoning shown — never blended into the real
          efficiency number, always labeled as an estimate.
        </p>
        <button class="btn-research" :class="{ soon: !researchLive }" @click="openResearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4 2.5 5 .5.5.5 1 .5 2h8c0-1 0-1.5.5-2 1-1 2.5-2.5 2.5-5a7 7 0 0 0-7-7Z"/>
            <path d="M9 21h6"/>
          </svg>
          {{ researchLive ? 'Explore AI Research' : 'AI Research — coming soon' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-gap { padding: 6rem 2rem; position: relative; }

.section-container { max-width: 1100px; margin: 0 auto; }

.section-header { text-align: center; margin-bottom: 3.5rem; }
.section-header h2 { font-size: clamp(2rem, 4vw, 2.5rem); font-weight: 700; color: var(--fg-primary); margin-bottom: 1rem; }
.section-header p { font-size: 1.125rem; color: var(--fg-secondary); max-width: 720px; margin: 0 auto; line-height: 1.6; }

.gap-split { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1.5rem; align-items: stretch; margin-bottom: 3rem; }

.gap-col { padding: 1.75rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.gap-col.measured { border-color: color-mix(in srgb, var(--eff-positive) 35%, var(--border)); }
.gap-col.missed { border-color: color-mix(in srgb, var(--accent-support) 35%, var(--border)); border-style: dashed; }

.gap-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
}
.measured-tag { background: color-mix(in srgb, var(--eff-positive) 15%, transparent); color: var(--eff-positive); }
.missed-tag { background: color-mix(in srgb, var(--accent-support) 15%, transparent); color: var(--accent-support); }

.gap-col h3 { font-size: 1.0625rem; font-weight: 600; color: var(--fg-primary); margin-bottom: 1rem; }

.gap-list { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.gap-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--fg-secondary);
}

.gap-val { font-family: 'Monaco', 'Courier New', monospace; font-weight: 700; }
.gap-val.solid { color: var(--accent-lead); }
.gap-val.unknown { color: var(--accent-support); opacity: 0.85; }

.gap-foot { font-size: 0.8125rem; color: var(--fg-muted); margin: 0; line-height: 1.5; }

.gap-arrow {
  align-self: center;
  color: var(--fg-muted);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.gap-cta { text-align: center; max-width: 760px; margin: 0 auto; }
.gap-cta-copy { font-size: 1.0625rem; color: var(--fg-secondary); line-height: 1.7; margin-bottom: 1.75rem; }
.gap-cta-copy em { color: var(--fg-primary); font-style: italic; }

.btn-research {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.75rem;
  background: var(--accent-support);
  color: var(--bg-canvas);
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-research:hover { transform: translateY(-2px); box-shadow: 0 6px 24px color-mix(in srgb, var(--accent-support) 45%, transparent); }
.btn-research.soon { background: var(--bg-elevated); color: var(--fg-muted); border: 1px solid var(--border); cursor: default; }
.btn-research.soon:hover { transform: none; box-shadow: none; }
.btn-research svg { width: 18px; height: 18px; }

@media (prefers-reduced-motion: reduce) { .btn-research { transition: none; } }

@media (max-width: 768px) {
  .section-gap { padding: 4rem 1.5rem; }
  .section-header h2 { font-size: 2rem; }
  .gap-split { grid-template-columns: 1fr; }
  .gap-arrow { padding: 0.5rem 0; }
}
</style>
