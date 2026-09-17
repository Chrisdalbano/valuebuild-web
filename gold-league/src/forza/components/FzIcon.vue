<script setup lang="ts">
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  X,
  Check,
  Search,
  Shield,
  Swords,
  Zap,
  Flame,
  Sun,
  Moon,
  LoaderCircle,
  Trash2,
  RotateCcw,
  ArrowDownUp,
  ChevronDown,
  GripVertical,
} from "@lucide/vue";
const icons = {
  arrowUpRight: ArrowUpRight,
  arrowRight: ArrowRight,
  plus: Plus,
  close: X,
  check: Check,
  search: Search,
  shield: Shield,
  swords: Swords,
  zap: Zap,
  flame: Flame,
  sun: Sun,
  moon: Moon,
  loader: LoaderCircle,
  trash: Trash2,
  undo: RotateCcw,
  sort: ArrowDownUp,
  chevronDown: ChevronDown,
  grip: GripVertical,
};
withDefaults(
  defineProps<{
    name: keyof typeof icons;
    size?: number;
    label?: string;
    strokeWidth?: number;
  }>(),
  { size: 18, strokeWidth: 1.75 },
);
</script>
<template>
  <component
    :is="icons[name]"
    class="fz-icon"
    :size="size"
    :stroke-width="strokeWidth"
    :aria-hidden="label ? undefined : true"
    :aria-label="label"
    :role="label ? 'img' : undefined"
    focusable="false"
  />
</template>
<style scoped>
.fz-icon {
  display: block;
  flex: none;
  width: auto;
  max-width: 100%;
  overflow: hidden;
  vertical-align: middle;
}
</style>
