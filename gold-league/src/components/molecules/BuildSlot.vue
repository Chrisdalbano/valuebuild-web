<script setup>
import EfficiencyBadge from '@/components/atoms/EfficiencyBadge.vue'
import ItemHoverCard from './ItemHoverCard.vue'
import ItemIcon from '@/components/atoms/ItemIcon.vue'

defineProps({
  item: { type: Object, default: null },
  slotNumber: { type: Number, required: true },
  goldIconUrl: { type: String, default: '' },
})

defineEmits(['open', 'remove'])
</script>

<template>
  <div :class="['build-slot', { filled: item }]" @click="$emit('open')">
    <template v-if="item">
      <button @click.stop="$emit('remove')" class="slot-remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <ItemHoverCard :item="item" :mobile-tap="false">
        <ItemIcon :item="item" size="hero" :alt="item.name" class="slot-icon" />
      </ItemHoverCard>
      <div class="slot-name">{{ item.name }}</div>
      <div class="slot-cost gold-line">
        <img :src="goldIconUrl" alt="gold" class="gold-icon" /> {{ item.cost }}
      </div>
      <EfficiencyBadge :value="item.goldEfficiency" :decimals="0" class="slot-eff" />

    </template>
    <template v-else>
      <div class="slot-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Slot {{ slotNumber }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.build-slot {
  position: relative;
  background: var(--bg-surface);
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.build-slot:hover {
  border-color: var(--accent-lead);
  background: var(--bg-canvas);
  transform: translateY(-2px);
}

.build-slot.filled {
  border-style: solid;
  border-color: var(--accent-lead);
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--accent-lead) 5%, transparent),
    color-mix(in srgb, var(--accent-warm) 5%, transparent));
}

.slot-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--fg-muted);
  font-size: 0.875rem;
}

.slot-placeholder svg { width: 32px; height: 32px; opacity: 0.5; }

.slot-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  border: 2px solid var(--accent-lead);
  object-fit: contain;
  margin-bottom: 0.75rem;
}

.slot-name {
  color: var(--fg-primary);
  font-weight: 600;
  font-size: 0.8125rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.slot-cost {
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
  margin-bottom: 0.25rem;
}

.gold-line {
  color: var(--accent-lead);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.gold-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
  margin-right: 2px;
}

.slot-eff {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
}

.slot-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: var(--fb-error);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.slot-remove svg { width: 14px; height: 14px; }
.slot-remove:hover { transform: scale(1.1); background: rgb(200, 40, 40); }
</style>
