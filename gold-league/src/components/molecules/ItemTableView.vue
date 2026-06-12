<script setup>
import ItemRow from './ItemRow.vue'

const props = defineProps({
  items: { type: Array, required: true },
  sortKey: { type: String, required: true },
  sortDir: { type: Number, required: true },
  selectedIds: { type: Array, default: () => [] },
  selectingId: { type: String, default: null },
})

defineEmits(['sort', 'toggle', 'image-failed'])

function sortIcon(key) {
  if (props.sortKey !== key) return '⇅'
  return props.sortDir === 1 ? '↑' : '↓'
}
</script>

<template>
  <div class="items-table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th class="th-checkbox"></th>
          <th class="th-item">Item</th>
          <th @click="$emit('sort', 'goldEfficiency')" class="sortable th-efficiency">
            Efficiency {{ sortIcon('goldEfficiency') }}
          </th>
          <th @click="$emit('sort', 'cost')" class="sortable th-cost">
            Cost {{ sortIcon('cost') }}
          </th>
          <th class="th-value">Value</th>
          <th class="th-rating">Rating</th>
        </tr>
      </thead>
      <tbody>
        <ItemRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          :selected="selectedIds.includes(item.id)"
          :selecting="selectingId === item.id"
          @toggle="$emit('toggle', $event)"
          @image-failed="$emit('image-failed', $event)"
        />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.items-table-wrapper {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  margin-bottom: 2rem;
}

.items-table { width: 100%; border-collapse: collapse; }

.items-table thead {
  background: var(--bg-elevated);
  position: sticky;
  top: 0;
  z-index: 10;
}

.items-table th {
  padding: 1rem;
  text-align: left;
  color: var(--fg-secondary);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--border);
}

.items-table th.sortable { cursor: pointer; user-select: none; transition: color 0.2s; }
.items-table th.sortable:hover { color: var(--accent-lead); }

.th-efficiency { text-align: center; width: 150px; }
.th-cost { text-align: right; width: 120px; }
.th-value { text-align: right; width: 120px; }
.th-rating { text-align: center; width: 120px; }

@media (max-width: 768px) {
  .items-table th { padding: 0.75rem 0.5rem; font-size: 0.8125rem; }
  .th-efficiency { width: auto; }
  .th-cost, .th-value { display: none; /* Hide on mobile to save space */ }
  .th-rating { width: auto; }
}
</style>
