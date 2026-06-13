import { ref } from 'vue'

// Tiny shared store for "which item's full breakdown is open". Any component can
// open the ItemBreakdownModal without prop/event drilling through the router;
// App.vue renders the modal bound to this ref. (The modal had been orphaned
// since the Phase 2 decomposition dropped its @view-detailed entry point.)
const detailItem = ref(null)

export function useItemDetail() {
  return {
    detailItem,
    openDetail: item => { detailItem.value = item },
    closeDetail: () => { detailItem.value = null },
  }
}
