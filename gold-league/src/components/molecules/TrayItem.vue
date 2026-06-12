<script setup>
import ItemHoverCard from './ItemHoverCard.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'

defineProps({
  item: { type: Object, required: true },
})

defineEmits(['remove', 'image-failed'])
</script>

<template>
  <div class="tray-item">
    <ItemHoverCard :item="item" :mobile-tap="false">
      <ItemIcon :item="item" size="md" :alt="item.name" class="tray-item-img" @failed="$emit('image-failed', $event)" />
    </ItemHoverCard>
    <div class="tray-item-info">
      <div class="tray-item-name">{{ item.name }}</div>
      <EfficiencyBadge :value="item.goldEfficiency" class="tray-item-eff" />
    </div>
    <button @click.stop="$emit('remove', item)" class="btn-remove-item" title="Remove">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.tray-item {
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 180px;
  position: relative;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.tray-item:hover {
  border-color: var(--accent-lead);
  background: var(--bg-overlay);
}

.tray-item-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  object-fit: contain;
  background: var(--bg-surface);
}

.tray-item-info {
  flex: 1;
  min-width: 0;
}

.tray-item-name {
  color: var(--fg-primary);
  font-weight: 600;
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tray-item-eff {
  display: block;
  font-weight: 700;
  font-size: 0.75rem;
}

.btn-remove-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  color: var(--fg-muted);
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-remove-item svg {
  width: 12px;
  height: 12px;
}

.btn-remove-item:hover {
  background: var(--fb-error);
  border-color: var(--fb-error);
  color: white;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .tray-item {
    min-width: 100%;
    padding: 0.625rem;
  }
}
</style>
