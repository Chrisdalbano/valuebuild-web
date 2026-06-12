<script setup>
defineProps({
  checked: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<template>
  <input type="checkbox" :checked="checked" @click.stop="$emit('toggle')" class="checkbox-input" />
</template>

<style scoped>
.checkbox-input {
  width: 24px;
  height: 24px;
  cursor: pointer;
  appearance: none;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.checkbox-input:checked {
  background: var(--accent-lead);
  border-color: var(--accent-lead);
}

.checkbox-input:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--bg-canvas);
  font-weight: bold;
  font-size: 16px;
}
</style>
