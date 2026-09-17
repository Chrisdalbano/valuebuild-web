<script setup lang="ts">
import { ConfigProvider } from 'reka-ui';
import { FzButton, FzIcon } from '@chrisdalbano/forza-ui';
import { provideWorkspace } from './state/workspace';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import ItemDetails from './components/workspace/ItemDetails.vue';
const workspace = provideWorkspace();
</script>
<template>
  <ConfigProvider :scroll-body="false"><div class="fz-theme bv-app">
    <a class="skip-link" href="#main">Skip to content</a>
    <AppHeader />
    <main id="main" tabindex="-1"><RouterView /></main>
    <AppFooter />
    <ItemDetails />
    <div class="workspace-feedback" role="status" aria-live="polite" aria-atomic="true">
      <template v-if="workspace.message.value"><FzIcon name="check" :size="16" /><span>{{ workspace.message.value }}</span><FzButton v-if="workspace.undoIds.value" size="sm" variant="ghost" @click="workspace.undo">Undo</FzButton><FzButton size="sm" variant="ghost" aria-label="Dismiss notification" @click="workspace.message.value = ''"><FzIcon name="close" :size="16" /></FzButton></template>
    </div>
  </div></ConfigProvider>
</template>

