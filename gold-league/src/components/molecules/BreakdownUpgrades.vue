<script setup>
import GoldValue from '@/components/atoms/GoldValue.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'

defineProps({
  upgrades: { type: Array, required: true },
})

defineEmits(['select'])
</script>

<template>
  <div class="builds-into">
    <h3>Builds Into</h3>
    <div class="upgrade-list">
      <div v-for="upgrade in upgrades" :key="upgrade.id" class="upgrade-card" @click="$emit('select', upgrade)">
        <ItemIcon :item="upgrade" size="lg" :alt="upgrade.name" class="upgrade-icon" />
        <div class="upgrade-name">{{ upgrade.name }}</div>
        <GoldValue :amount="upgrade.cost" class="upgrade-cost" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.builds-into {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.builds-into h3 { color: var(--fg-primary); margin-bottom: 1.5rem; font-size: 1.125rem; font-weight: 600; }

.upgrade-list { display: flex; gap: 1rem; flex-wrap: wrap; }

.upgrade-card {
  background: var(--bg-surface);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.upgrade-card:hover { border-color: var(--accent-lead); transform: translateY(-2px); box-shadow: var(--shadow-md); }

.upgrade-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
}

.upgrade-name { font-size: 0.75rem; color: var(--fg-primary); font-weight: 500; margin-bottom: 0.25rem; text-align: center; }
.upgrade-cost { font-size: 0.875rem; font-weight: 600; }
</style>
