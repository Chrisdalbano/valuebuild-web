<script setup>
defineProps({
  open: { type: Boolean, default: false },
  routes: { type: Array, required: true }, // [{ path, name, badge }]
})

defineEmits(['close'])
</script>

<template>
  <div>
    <transition name="slide-down">
      <div v-if="open" class="mobile-menu">
        <router-link
          v-for="route in routes"
          :key="route.path"
          :to="route.path"
          @click="$emit('close')"
          class="mobile-nav-item"
          active-class="active"
        >
          <span>{{ route.name }}</span>
          <span v-if="route.badge" class="badge">{{ route.badge }}</span>
        </router-link>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="open" class="backdrop" @click="$emit('close')"></div>
    </transition>
  </div>
</template>

<style scoped>
.mobile-menu {
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 0.5rem;
  z-index: var(--z-nav);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--fg-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.15s;
}

.mobile-nav-item:hover,
.mobile-nav-item.active {
  color: var(--fg-primary);
  background: var(--bg-elevated);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--accent-lead);
  background: var(--bg-surface);
  border-radius: 4px;
  line-height: 1;
}

.backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: calc(var(--z-nav) - 1); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
