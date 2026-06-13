<script setup>
import { ref, toRef } from 'vue'
import BuildRolePicker from '../molecules/BuildRolePicker.vue'
import BuildSlot from '../molecules/BuildSlot.vue'
import BuildStatsCard from '../molecules/BuildStatsCard.vue'
import CombinedStatsCard from '../molecules/CombinedStatsCard.vue'
import BuildInsightsCard from '../molecules/BuildInsightsCard.vue'
import BuildSuggestionsPanel from '../molecules/BuildSuggestionsPanel.vue'
import BudgetOptimizerPanel from '../molecules/BudgetOptimizerPanel.vue'
import ShareBuildButton from '../molecules/ShareBuildButton.vue'
import SavedBuildsPanel from '../molecules/SavedBuildsPanel.vue'
import { useBuildStats } from '@/composables/useBuildStats'
import { useBuildSuggestions } from '@/composables/useBuildSuggestions'
import { useShareableBuild } from '@/composables/useShareableBuild'
import { useSavedBuilds } from '@/composables/useSavedBuilds'

const props = defineProps({
  items: { type: Array, required: true },
  compareItems: { type: Array, required: true },
  goldIconUrl: { type: String, required: true },
})

const emit = defineEmits(['browse-items'])

const currentBuild = defineModel('currentBuild', { type: Array, required: true })
const selectedRole = ref('all')

const { totalCost, totalValue, avgEfficiency, combinedStats, recommendation, synergies } =
  useBuildStats(currentBuild)

const { suggestions, subtitle } = useBuildSuggestions(
  toRef(props, 'items'),
  currentBuild,
  selectedRole
)

// shareable builds: /builds?b=3071,3153,... <-> currentBuild
const { shareUrl } = useShareableBuild(currentBuild, toRef(props, 'items'))

// named builds persisted to localStorage (orthogonal to the URL share)
const { savedBuilds, saveBuild, deleteBuild, renameBuild, loadBuild } = useSavedBuilds()
const savingName = ref('')
const showSaveInput = ref(false)

function commitSave() {
  const build = saveBuild(savingName.value, currentBuild.value.map(i => i.id))
  if (build) {
    savingName.value = ''
    showSaveInput.value = false
  }
}

function applySavedBuild(id) {
  const ids = loadBuild(id)
  if (!ids) return
  const byId = new Map(props.items.map(i => [i.id, i]))
  // the share watcher syncs the URL automatically once currentBuild changes
  currentBuild.value = ids.map(id => byId.get(id)).filter(Boolean).slice(0, 6)
}

function addComparedItems() {
  props.compareItems.forEach(item => {
    if (!currentBuild.value.find(i => i.id === item.id) && currentBuild.value.length < 6) {
      currentBuild.value.push(item)
    }
  })
}

function addSuggestion(item) {
  if (currentBuild.value.length < 6 && !currentBuild.value.some(i => i.id === item.id)) {
    currentBuild.value.push(item)
  }
}

function removeFromBuild(index) {
  currentBuild.value.splice(index, 1)
}
</script>

<template>
  <div class="builds-section">
    <div class="builds-header">
      <div>
        <h2><span class="icon-build"></span> Build Optimizer</h2>
        <p class="builds-subtitle">Create and analyze optimal item builds for maximum gold efficiency</p>
      </div>
      <div class="header-actions">
        <div v-if="currentBuild.length > 0 && showSaveInput" class="save-build-inline">
          <input
            v-model="savingName"
            class="save-build-input"
            placeholder="Build name…"
            maxlength="40"
            @keyup.enter="commitSave"
            @keyup.escape="showSaveInput = false"
          />
          <button @click="commitSave" class="btn-save-confirm" :disabled="!savingName.trim()">Save</button>
        </div>
        <button v-if="currentBuild.length > 0 && !showSaveInput" @click="showSaveInput = true" class="btn-save-build">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <path d="M17 21v-8H7v8M7 3v5h8"/>
          </svg>
          Save Build
        </button>
        <ShareBuildButton v-if="currentBuild.length > 0" :url="shareUrl" />
        <button v-if="currentBuild.length > 0" @click="currentBuild = []" class="btn-clear-build">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          Clear Build
        </button>
      </div>
    </div>

    <BuildRolePicker v-model="selectedRole" />

    <BudgetOptimizerPanel :items="items" :role="selectedRole" @apply="currentBuild = $event" />

    <div class="build-slots-container">
      <h3>Your Build</h3>
      <div class="build-slots">
        <BuildSlot
          v-for="index in 6"
          :key="index"
          :item="currentBuild[index - 1] || null"
          :slot-number="index"
          :gold-icon-url="goldIconUrl"
          @open="emit('browse-items')"
          @remove="removeFromBuild(index - 1)"
        />
      </div>
      <div class="quick-actions">
        <button @click="addComparedItems" class="btn-quick-action" :disabled="compareItems.length === 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Compared Items
          <span v-if="compareItems.length > 0" class="badge">{{ compareItems.length }}</span>
        </button>
        <button @click="emit('browse-items')" class="btn-quick-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Browse Items
        </button>
      </div>
    </div>

    <div v-if="currentBuild.length > 0" class="build-analysis-panel">
      <div class="analysis-row">
        <BuildStatsCard
          :total-cost="totalCost"
          :total-value="totalValue"
          :avg-efficiency="avgEfficiency"
          :gold-icon-url="goldIconUrl"
        />
        <CombinedStatsCard :stats="combinedStats" />
      </div>
      <BuildInsightsCard :recommendation="recommendation" :synergies="synergies" />
    </div>

    <SavedBuildsPanel
      :builds="savedBuilds"
      :all-items="items"
      @load="applySavedBuild"
      @delete="deleteBuild"
      @rename="renameBuild($event.id, $event.name)"
    />

    <BuildSuggestionsPanel
      :suggestions="suggestions"
      :subtitle="subtitle"
      :build="currentBuild"
      :gold-icon-url="goldIconUrl"
      @add="addSuggestion"
    />

    <div v-if="currentBuild.length === 0" class="builds-empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      <h3>Start Building Your Perfect Loadout</h3>
      <p>Click on the item slots above to add items, or browse smart suggestions below</p>
    </div>
  </div>
</template>

<style scoped>
.builds-section { padding: 2rem; }

.icon-build { width: 2rem; height: 2rem; background: url("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/missions/newplayerexperience/npe_mission_annihilation.png") no-repeat center center; background-size: contain; display: inline-block; vertical-align: middle; margin-right: 2px; }

.builds-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--border); }

.header-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

.builds-subtitle { color: var(--fg-muted); font-size: 0.9375rem; margin-top: 0.5rem; }

.btn-clear-build { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--fg-primary); font-weight: 600; cursor: pointer; transition: all 0.2s; }

.btn-clear-build svg { width: 18px; height: 18px; }
.btn-clear-build:hover { background: var(--fb-error); border-color: var(--fb-error); color: white; transform: translateY(-2px); }

.btn-save-build { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--fg-primary); font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-save-build svg { width: 18px; height: 18px; }
.btn-save-build:hover { background: var(--accent-lead); border-color: var(--accent-lead); color: var(--bg-canvas); transform: translateY(-2px); }

.save-build-inline { display: flex; gap: 0.5rem; align-items: center; }
.save-build-input { padding: 0.75rem 1rem; background: var(--bg-canvas); border: 1px solid var(--accent-lead); border-radius: var(--radius-md); color: var(--fg-primary); font-size: 0.9375rem; font-weight: 500; width: 180px; }
.btn-save-confirm { padding: 0.75rem 1.25rem; background: var(--accent-lead); border: 1px solid var(--accent-lead); border-radius: var(--radius-md); color: var(--bg-canvas); font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-save-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

.build-slots-container { background: var(--bg-elevated); padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem; border: 2px solid var(--border); }

.build-slots-container h3 { color: var(--accent-lead); margin-bottom: 1.5rem; font-size: 1.25rem; }

.build-slots { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }

.quick-actions { display: flex; gap: 1rem; justify-content: center; }

.btn-quick-action { display: flex; align-items: center; gap: 0.625rem; padding: 0.875rem 1.5rem; background: var(--bg-canvas); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--fg-primary); font-weight: 600; cursor: pointer; transition: all 0.2s; position: relative; }

.btn-quick-action svg { width: 16px; height: 16px; }
.btn-quick-action:not(:disabled):hover { background: var(--accent-lead); border-color: var(--accent-lead); color: var(--bg-canvas); transform: translateY(-2px); }
.btn-quick-action:disabled { opacity: 0.5; cursor: not-allowed; }

.badge { position: absolute; top: -8px; right: -8px; background: var(--accent-lead); color: var(--bg-canvas); padding: 0.125rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; }

.build-analysis-panel { background: var(--bg-elevated); padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem; border: 2px solid var(--border); }

.analysis-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }

.builds-empty-state { background: var(--bg-elevated); padding: 4rem 2rem; border-radius: var(--radius-lg); text-align: center; border: 2px dashed var(--border); }

.empty-icon { width: 64px; height: 64px; color: var(--fg-muted); opacity: 0.5; margin: 0 auto 1.5rem; }
.builds-empty-state h3 { color: var(--fg-primary); margin-bottom: 1rem; }
.builds-empty-state p { color: var(--fg-muted); max-width: 500px; margin: 0 auto 1.5rem; }

@media (max-width: 768px) {
  .builds-header { flex-direction: column; gap: 1rem; }
  .build-slots { grid-template-columns: repeat(2, 1fr); }
  .quick-actions { flex-direction: column; }
  .analysis-row { grid-template-columns: 1fr; }
}
</style>
