<script setup lang="ts">
import { FzAlert, FzButton } from "@chrisdalbano/forza-ui";
defineProps<{ loading: boolean; error: string; pending?: boolean }>();
defineEmits<{ retry: [] }>();
</script>
<template>
  <div v-if="loading" class="analysis-loading" role="status">
    Loading cached analysis... The service may need a moment to wake up.
    <div class="loading-lines" aria-hidden="true"><i /><i /><i /></div>
  </div>
  <FzAlert v-else-if="error" title="Analysis unavailable" tone="warning"
    >{{ error
    }}<FzButton variant="secondary" size="sm" @click="$emit('retry')"
      >Try again</FzButton
    ></FzAlert
  ><FzAlert v-else-if="pending" title="No cached analysis yet"
    >Analysis appears here after the backend's scheduled enrichment. Viewing
    this page does not trigger generation.</FzAlert
  ><slot v-else />
</template>
