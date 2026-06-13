<script setup>
import { ref, computed } from 'vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'

const props = defineProps({
  builds: { type: Array, required: true },
  allItems: { type: Array, required: true },
})

const emit = defineEmits(['load', 'delete', 'rename'])

const editingId = ref(null)
const draftName = ref('')

// autofocus the rename input when it mounts (script-setup local directive)
const vFocus = { mounted: el => el.focus() }

// resolve stored IDs to live item objects for thumbnails (skips missing items)
const resolved = computed(() => {
  const byId = new Map(props.allItems.map(i => [i.id, i]))
  return props.builds.map(b => ({
    ...b,
    items: b.itemIds.map(id => byId.get(id)).filter(Boolean),
  }))
})

function startRename(build) {
  editingId.value = build.id
  draftName.value = build.name
}
function confirmRename(id) {
  if (draftName.value.trim()) emit('rename', { id, name: draftName.value.trim() })
  editingId.value = null
}
</script>

<template>
  <div v-if="builds.length > 0" class="saved-builds">
    <h3>Saved Builds</h3>
    <div class="saved-list">
      <div v-for="b in resolved" :key="b.id" class="saved-row">
        <div class="saved-icons">
          <ItemIcon
            v-for="(item, i) in b.items"
            :key="`${item.id}-${i}`"
            :item="item"
            size="sm"
            :alt="item.name"
            class="saved-icon"
          />
          <span v-if="b.items.length === 0" class="saved-empty">no items</span>
        </div>
        <div class="saved-meta">
          <input
            v-if="editingId === b.id"
            v-model="draftName"
            class="saved-name-input"
            @keyup.enter="confirmRename(b.id)"
            @blur="confirmRename(b.id)"
            v-focus
          />
          <span v-else class="saved-name">{{ b.name }}</span>
          <span class="saved-count">{{ b.items.length }} item{{ b.items.length === 1 ? '' : 's' }}</span>
        </div>
        <div class="saved-actions">
          <button class="saved-btn load" @click="emit('load', b.id)" title="Load this build">Load</button>
          <button class="saved-btn" @click="startRename(b)" title="Rename">Rename</button>
          <button class="saved-btn danger" @click="emit('delete', b.id)" title="Delete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.saved-builds {
  background: var(--bg-elevated);
  padding: 1.5rem 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  border: 2px solid var(--border);
}

.saved-builds h3 { color: var(--accent-lead); margin-bottom: 1.25rem; font-size: 1.25rem; }

.saved-list { display: flex; flex-direction: column; gap: 0.75rem; }

.saved-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-canvas);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.saved-icons { display: flex; gap: 0.375rem; flex: 1; min-width: 120px; flex-wrap: wrap; }

.saved-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  object-fit: contain;
  background: var(--bg-surface);
}

.saved-empty { color: var(--fg-muted); font-size: 0.8125rem; font-style: italic; }

.saved-meta { display: flex; flex-direction: column; gap: 0.25rem; min-width: 140px; }
.saved-name { color: var(--fg-primary); font-weight: 600; font-size: 0.9375rem; }
.saved-count { color: var(--fg-muted); font-size: 0.75rem; }

.saved-name-input {
  background: var(--bg-surface);
  border: 1px solid var(--accent-lead);
  border-radius: var(--radius-sm);
  color: var(--fg-primary);
  padding: 0.25rem 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  width: 160px;
}

.saved-actions { display: flex; gap: 0.5rem; }

.saved-btn {
  padding: 0.5rem 0.875rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg-secondary);
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.saved-btn:hover { border-color: var(--accent-lead); color: var(--fg-primary); transform: translateY(-1px); }
.saved-btn.load:hover { background: var(--accent-lead); border-color: var(--accent-lead); color: var(--bg-canvas); }
.saved-btn.danger:hover { background: var(--fb-error); border-color: var(--fb-error); color: white; }

@media (max-width: 768px) {
  .saved-row { flex-direction: column; align-items: stretch; }
  .saved-actions { justify-content: space-between; }
}
</style>
