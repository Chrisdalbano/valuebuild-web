<script setup>
import { ref, watch, nextTick, useTemplateRef } from 'vue'
import SwapItemRow from './SwapItemRow.vue'
import { formatStatName } from '@/api/items'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  allItems: { type: Array, required: true },
  selectedItems: { type: Array, required: true },
})

const emit = defineEmits(['close', 'select'])

const query = ref('')
const results = ref([])
const searchInput = useTemplateRef('searchInput')

function isAlreadySelected(item) {
  return props.selectedItems.some(i => i.id === item.id)
}

// Legacy quirk kept: an empty query EXCLUDES already-selected items, while a
// typed query includes them (greyed out with the "in comparison" flag).
function filterResults() {
  const q = query.value.toLowerCase().trim()
  if (!q) {
    results.value = props.allItems.filter(i => !isAlreadySelected(i))
  } else {
    results.value = props.allItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(q)
      const statsMatch = item.statBreakdown && Object.keys(item.statBreakdown).some(stat =>
        stat.toLowerCase().includes(q) || formatStatName(stat).toLowerCase().includes(q)
      )
      return nameMatch || statsMatch
    })
  }
}

watch(() => props.open, isOpen => {
  if (isOpen) {
    query.value = ''
    filterResults()
    nextTick(() => searchInput.value?.focus())
  }
})

function pick(item) {
  if (isAlreadySelected(item)) return
  emit('select', item)
}
</script>

<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
        <div class="swap-modal">
          <div class="swap-modal-header">
            <h3>{{ title }}</h3>
            <button @click="$emit('close')" class="btn-modal-close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="swap-modal-body">
            <div class="swap-search-box">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                v-model="query"
                ref="searchInput"
                placeholder="Search for an item..."
                class="swap-search-input"
                @input="filterResults"
              />
            </div>

            <div class="swap-items-list">
              <SwapItemRow
                v-for="item in results.slice(0, 50)"
                :key="item.id"
                :item="item"
                :already-selected="isAlreadySelected(item)"
                @pick="pick"
              />
              <div v-if="results.length === 0" class="no-swap-results">
                No items found matching "{{ query }}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 1rem;
}

.swap-modal {
  background: var(--bg-surface);
  border: 2px solid var(--accent-lead);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 96px rgba(0, 0, 0, 0.9);
}

.swap-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid var(--border);
}

.swap-modal-header h3 { color: var(--accent-lead); font-size: 1.25rem; margin: 0; font-weight: 700; }

.btn-modal-close {
  background: transparent;
  border: none;
  color: var(--fg-secondary);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-close:hover { background: var(--fb-error); color: white; }
.btn-modal-close svg { width: 20px; height: 20px; }

.swap-modal-body { padding: 1.5rem; overflow: hidden; display: flex; flex-direction: column; gap: 1rem; }

.swap-search-box { position: relative; display: flex; align-items: center; }

.swap-search-box .search-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: var(--fg-muted);
  pointer-events: none;
}

.swap-search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: var(--bg-elevated);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--fg-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.swap-search-input:focus {
  outline: none;
  border-color: var(--accent-lead);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-lead) 10%, transparent);
}

.swap-items-list { overflow-y: auto; max-height: 400px; display: flex; flex-direction: column; gap: 0.5rem; }

.swap-items-list::-webkit-scrollbar { width: 8px; }
.swap-items-list::-webkit-scrollbar-track { background: var(--bg-elevated); border-radius: 4px; }
.swap-items-list::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
.swap-items-list::-webkit-scrollbar-thumb:hover { background: var(--accent-lead); }

.no-swap-results { padding: 2rem; text-align: center; color: var(--fg-muted); font-size: 0.9375rem; }

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-active .swap-modal, .modal-leave-active .swap-modal { transition: transform 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .swap-modal, .modal-leave-to .swap-modal { transform: scale(0.9); }
</style>
